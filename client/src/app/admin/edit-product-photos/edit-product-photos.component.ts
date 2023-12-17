import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Product } from 'src/app/shared/models/product';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-product-photos',
  templateUrl: './edit-product-photos.component.html',
  styleUrls: ['./edit-product-photos.component.scss']
})
export class EditProductPhotosComponent {
  @Input() product?: Product;
  addPhotoMode = false;
  progress = 0;

  constructor(private adminService: AdminService, private toast: ToastrService) { }

  addPhotoModeToggle() {
    this.addPhotoMode = !this.addPhotoMode;
  }

  uploadFile(file: File) {
    if (this.product) {
      this.adminService.uploadImage(file, this.product.id).subscribe({
        next: (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              if (event.total)
                this.progress = Math.round(event.loaded / event.total * 100);
              break;
            case HttpEventType.Response:
              this.product = event.body;
              setTimeout(() => {
                this.progress = 0;
                this.addPhotoMode = false;
              }, 1500);
          }
        }, error: (error: any) => {
          if (error.errors) {
            this.toast.error(error.errors[0]);
          } else {
            this.toast.error('Problem uploading image');
          }
          this.progress = 0;
        }
      });
    }
  }

  deletePhoto(photoId: number) {
    if (this.product) {
      this.adminService.deleteProductPhoto(photoId, this.product.id).subscribe({
        next: () => {
          if (this.product) {
            const photoIndex = this.product.photos.findIndex(x => x.id === photoId);
            this.product.photos.splice(photoIndex, 1);
          }
        }, error: (error: any) => {
          this.toast.error('Problem deleting photo');
          console.log(error);
        }
      });
    }
  }

  setMainPhoto(photoId: number) {
    if (this.product) {
      this.adminService.setMainPhoto(photoId, this.product.id).subscribe({
        next: (product: Product) => {
          this.product = product;
        }
      });
    }
  }


}
