import { Component, OnInit } from '@angular/core';
import { Order } from '../shared/models/order';
import { BreadcrumbService } from 'xng-breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../orders/order.service';

@Component({
  selector: 'app-order-detailed',
  templateUrl: './order-detailed.component.html',
  styleUrls: ['./order-detailed.component.scss']
})
export class OrderDetailedComponent implements OnInit {
  order?: Order;

  constructor(private ordersService: OrderService, private bcService: BreadcrumbService, private activatedRoute: ActivatedRoute) {
    this.bcService.set('@orderDetailed', ' ');
  }

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    id && this.ordersService.getOrderDetailed(+id).subscribe({
      next: order => {
        this.order = order;
        this.bcService.set('@orderDetailed', `Order# ${order.id} - ${order.status}`);
      }
    })
  }

}
