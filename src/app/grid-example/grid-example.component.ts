import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-grid-example',
  templateUrl: './grid-example.component.html',
  styleUrls: ['./grid-example.component.scss'],
})
export class GridExampleComponent implements OnInit {
  @ViewChild('agGrid') agGrid: AgGridAngular;

  columnDefs = [
    { headerName: 'Make', field: 'make', rowGroup: true },
    { headerName: 'Price', field: 'price' },
  ];

  autoGroupColumnDef = {
    headerName: 'Model',
    field: 'model',
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      checkbox: true,
    },
  };

  rowData: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.rowData = this.http.get(
      'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/sample-data/smallRowData.json',
    );
  }

  getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    const selectedDataStringPresentation = selectedData.map(node => node.make + ' ' + node.model).join(', ');
    alert(`Selected nodes: ${selectedDataStringPresentation}`);
  }
}
