import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GridExampleComponent } from './grid-example/grid-example.component';
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, GridExampleComponent],
  imports: [BrowserModule, HttpClientModule, AgGridModule.withComponents([])],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
