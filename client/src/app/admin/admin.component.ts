import { Component, OnInit } from '@angular/core';
import { Product } from '../shared/models/product';
import { ShopParams } from '../shared/models/shopParams';
import { ShopService } from '../shop/shop.service';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  totalCount: number = 0;
  shopParams: ShopParams;

  constructor(private shopService: ShopService, private adminService: AdminService) {
    this.shopParams = this.shopService.getShopParams();
  }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(useCache = false) {
    this.shopService.getProducts(useCache).subscribe({
      next: response => {
        this.products = response.data;
        this.totalCount = response.count;
      },
      error: error => console.log(error)
    })
  }

  onPageChanged(event: any) {
    const params = this.shopService.getShopParams();
    if (params.pageNumber !== event) {
      params.pageNumber = event;
      this.shopService.setShopParams(params);
      this.getProducts(true);
    }
  }

  deleteProduct(id: number) {
    this.adminService.deleteProduct(id).subscribe((response: any) => {
      this.products.splice(this.products.findIndex(p => p.id === id), 1);
      this.totalCount--;
    });
  }


}
