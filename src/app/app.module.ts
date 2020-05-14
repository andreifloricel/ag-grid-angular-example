import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GridExampleComponent } from './grid-example/grid-example.component';
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, GridExampleComponent],
  imports: [BrowserModule, AgGridModule.withComponents([]), FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
