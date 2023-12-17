import { Component, OnInit } from '@angular/core';
import { Brand } from 'src/app/shared/models/brand';
import { Product, ProductFormValues } from 'src/app/shared/models/product';
import { AdminService } from '../admin.service';
import { ShopService } from 'src/app/shop/shop.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Type } from 'src/app/shared/models/type';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  product?: Product;
  productFormValues: ProductFormValues;
  brands: Brand[] = [];
  types: Type[] = [];

  constructor(private adminService: AdminService,
    private shopService: ShopService,
    private route: ActivatedRoute,
    private router: Router) {
    this.productFormValues = new ProductFormValues();
  }

  ngOnInit(): void {
    const brands = this.getBrands();
    const types = this.getTypes();

    forkJoin([types, brands]).subscribe({
      next: results => {
        this.types = results[0];
        this.brands = results[1];
      }, error: error => {
        console.log(error);
      }, complete: () => {
        if (this.route.snapshot.url[0].path === 'edit') {
          this.loadProduct();
        }
      }
    });
  }

  loadProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.shopService.getProduct(+id).subscribe(
        (response: any) => {
          const productBrandId = this.brands && this.brands.find(x => x.name === response.productBrand)?.id;
          const productTypeId = this.types && this.types.find(x => x.name === response.productType)?.id;
          this.product = response;
          this.productFormValues = { ...response, productBrandId, productTypeId };
        });
    }
  }

  getBrands() {
    return this.shopService.getBrands();
  }

  getTypes() {
    return this.shopService.getTypes();
  }

}
