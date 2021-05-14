import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';
  selectedProductId: number;



  private errorMessageSubject = new Subject<string>()
  errorMessage$ = this.errorMessageSubject.asObservable()

  products$ = this.productService.productsWithCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err)
        return EMPTY
      })
    )
  selectedProduct$ = this.productService.selectedProduct$

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChange(productId)
  }
}
