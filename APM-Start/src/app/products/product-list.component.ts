import { ChangeDetectionStrategy, Component } from '@angular/core';
import {  BehaviorSubject, combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

  private selectedCategorySubject = new BehaviorSubject<Number>(0);
  selectedCategoryAction$ = this.selectedCategorySubject.asObservable();

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err
        return EMPTY
      })
    )

  productsWithFilter$ = combineLatest([
        this.productService.productsWithCategories$,
        this.selectedCategoryAction$
      ])
      .pipe(
        map(([products,catergoryId]) => 
        products.filter(product => 
          catergoryId ?  product.categoryId == catergoryId : true )
        )
      ).subscribe()

  constructor(private productService: ProductService, private productCategoryService: ProductCategoryService){ }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.selectedCategorySubject.next(+categoryId)
  }
}
