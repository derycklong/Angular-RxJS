import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { SupplierService } from 'src/app/suppliers/supplier.service';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private errorMessageSubject = new Subject<string>()
  errorMessage$ = this.errorMessageSubject.asObservable()


  constructor(private productService: ProductService, private supplierService:SupplierService) {}

  product$ = this.productService.selectedProduct$
  .pipe(
    catchError(err => {
      this.errorMessageSubject.next(err)
      return EMPTY
    })
  )

  pageTitle$ = this.product$
    .pipe(
      map(product => product ? `Product Detail for : ${product.productName}`: null)
    )

  productSuppliers$ = this.productService.selectedProductSupplier2$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err)
        return EMPTY
      })
    )
    
  vm$ = combineLatest([
    this.product$,
    this.productSuppliers$,
    this.pageTitle$
  ])
    .pipe(
      filter(([product])=> Boolean(product)),
      map(([product,productSuppliers,pageTitle])=>
        ({product,productSuppliers,pageTitle})
      )
    )

}
