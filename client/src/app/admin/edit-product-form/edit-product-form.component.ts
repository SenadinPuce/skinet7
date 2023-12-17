import { Component, Input, OnInit } from '@angular/core';
import { Brand } from 'src/app/shared/models/brand';
import { ProductFormValues } from 'src/app/shared/models/product';
import { Type } from 'src/app/shared/models/type';
import { AdminService } from '../admin.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-product-form',
  templateUrl: './edit-product-form.component.html',
  styleUrls: ['./edit-product-form.component.scss']
})
export class EditProductFormComponent  {
  @Input() product: ProductFormValues;
  @Input() brands: Brand[] = [];
  @Input() types: Type[] = [];

  constructor(private adminService: AdminService, private router: Router,
    private route: ActivatedRoute) {
    this.product = new ProductFormValues();
  }

  updatePrice(event: any) {
    this.product.price = event;
  }

  onSubmit(product: ProductFormValues) {
    if (this.route.snapshot.url[0].path === 'edit') {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        const updatedProduct = { ...this.product, ...product, price: +product.price };
        this.adminService.updateProduct(updatedProduct, +id).subscribe((response: any) => {
          this.router.navigate(['/admin']);
        });
      }
    } else {
      const newProduct = { ...product, price: +product.price };
      this.adminService.createProduct(newProduct).subscribe((response: any) => {
        this.router.navigate(['/admin']);
      });
    }
  }


}
