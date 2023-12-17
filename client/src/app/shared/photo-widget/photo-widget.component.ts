import { Component, EventEmitter, Output } from '@angular/core';
import { ImageCroppedEvent, base64ToFile } from 'ngx-image-cropper';

@Component({
  selector: 'app-photo-widget',
  templateUrl: './photo-widget.component.html',
  styleUrls: ['./photo-widget.component.scss']
})
export class PhotoWidgetComponent {
  @Output() addFile = new EventEmitter();
  files: File[] = [];
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor() { }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
}

  imageCropped(event: ImageCroppedEvent) { 
    this.croppedImage = event.base64;
  }

  onSelect(event: any) {
      this.files = [];
      this.files.push(...event.addedFiles);
      this.fileChangeEvent(this.files[0]);
  }

  onUpload() {
    if (this.croppedImage) {
      console.log(base64ToFile(this.croppedImage));
      this.addFile.emit(base64ToFile(this.croppedImage));
    }
  }
}
