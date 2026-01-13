import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularEditorModule } from '../../../angular-editor/src/lib/angular-editor.module';


@NgModule({

  imports: [
    BrowserModule,
    AngularEditorModule,

    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
})
export class AppModule { }
