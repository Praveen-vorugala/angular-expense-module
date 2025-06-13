import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { RemoveUnderscorePipe } from './pipes/remove-underscore.pipe';



@NgModule({
  declarations: [LoaderComponent, RemoveUnderscorePipe],
  imports: [
    CommonModule
  ],
  exports: [
    LoaderComponent,
    RemoveUnderscorePipe,
  ],
})
export class appCommonsModule { }
