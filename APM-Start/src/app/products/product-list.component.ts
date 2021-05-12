import { ChangeDetectionStrategy, Component } from '@angular/core';
import {  BehaviorSubject, combineLatest, EMPTY, merge, Observable, Subject} from 'rxjs';
import { catchError, map, scan, tap } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List'
  errorMessage = ''
  selectedCatergoyId

 

  private errorMessageSubject = new Subject<string>()
  errorMessage$ = this.errorMessageSubject.asObservable()



  private selectedCategorySubject = new BehaviorSubject<Number>(0)
  selectedCategoryAction$ = this.selectedCategorySubject.asObservable()

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err)
        return EMPTY
      })
    )



  products$ = combineLatest([
        this.productService.productWithAdd$,
        this.selectedCategoryAction$
      ])
      .pipe(
        map(([products,catergoryId]) => 
        products.filter(product => 
          catergoryId ?  product.categoryId == catergoryId : true )
        ),
        catchError(err =>{
          this.errorMessageSubject.next(err)
          return EMPTY
        })
      )



  constructor(private productService: ProductService, private productCategoryService: ProductCategoryService){ }

  onAdd(): void {
    this.productService.addProduct()
  }

  onSelected(categoryId: string): void {
    this.selectedCategorySubject.next(+categoryId)
  }
}
