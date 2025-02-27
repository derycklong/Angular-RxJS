import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, from, merge, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, scan, share, shareReplay, switchMap, tap, toArray } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryData } from '../product-categories/product-category-data';
import { ProductCategoryService } from '../product-categories/product-category.service';


@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private productsUrl = '/api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      map(products => 
        products.map(product => ({
          ...product,
          price: product.price * 1.5,
          searchKey : [product.productName]
        })as Product)),
      //tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
  );
  
  productsWithCategories$ = combineLatest([
    this.products$,
    this.productCatergoryService.productCategories$
  ]).pipe(
    map(([products,catergories]) => 
    products.map(product => ({
      ...product,
      price : product.price * 1.5,
      category : catergories.find(c=> product.categoryId === c.id).name,
      searchKey : [product.productName]
    }) as Product )),
    tap(data => console.log('Products: ', JSON.stringify(data))),
    shareReplay(1)
  )

  private productSelectedSubject = new BehaviorSubject<Number>(0)
  productSelectedAction$ = this.productSelectedSubject.asObservable()

  selectedProduct$ = combineLatest([ 
    this.productsWithCategories$,
    this.productSelectedAction$
  ]).pipe(
    map(([products,selectedProductId]) => 
      products.find(product => (product.id === selectedProductId))),
    tap(product => console.log(product))
  )

  private productInsertedSubject = new Subject<Product>()
  productInsertedAction$ = this.productInsertedSubject.asObservable()

  productWithAdd$ = merge(
    this.productsWithCategories$,
    this.productInsertedAction$
  ).pipe(
    scan((acc:Product[],value:Product)=> [...acc, value]),
    tap(res=>console.log(res))
  )

  selectedProductSupplier$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
  ]).pipe(
    map(([selectedProduct,supplier]) => 
      supplier.filter(supplier => selectedProduct.supplierIds.includes(supplier.id))),
    tap(sup => console.log(sup))
  )

  selectedProductSupplier2$ = this.selectedProduct$
    .pipe(
      filter(product=>Boolean(product)),
      switchMap(product => from(product.supplierIds)
        .pipe(
          mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
          toArray(),
          tap(suppliers => console.log('product supplier', JSON.stringify(suppliers)))
        )
      )
    )

  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCatergoryService : ProductCategoryService) { }

  selectedProductChange(id: number){
    this.productSelectedSubject.next(id)
  }

  addProduct(newProduct?:Product){
    newProduct = newProduct || this.fakeProduct()
    console.log(newProduct)
    this.productInsertedSubject.next(newProduct)
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

}
