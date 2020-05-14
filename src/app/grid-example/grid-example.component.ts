import { Component, Inject, OnInit } from '@angular/core';
import { DataSize } from 'src/app/app.model';
import { GridOptions } from 'ag-grid-community';
import { PersonFilter } from 'src/app/filters/person-filter';
import { countryCellRenderer } from 'src/app/renderers/country-cell-renderer';
import {
  booleanCellRenderer,
  booleanComparator,
  booleanFilterCellRenderer,
} from 'src/app/renderers/boolean-cell-renderer';
import { PersonFloatingFilterComponent } from '../filters/person-floating-filter';
import { CountryFloatingFilterComponent } from 'src/app/filters/country-floating-filter';
import { WinningsFilter } from 'src/app/renderers/winnings-filter';
import { ratingFilterRenderer, ratingRenderer } from 'src/app/renderers/ratings-renderer';
import { months } from '../data/months';
import { DOCUMENT } from '@angular/common';
import { countries } from '../data/country';
import { firstNames, lastNames } from '../data/person';
import { games, booleanValues } from '../data/game';

@Component({
  selector: 'app-grid-example',
  templateUrl: './grid-example.component.html',
  styleUrls: ['./grid-example.component.scss'],
})
export class GridExampleComponent implements OnInit {
  isSmall = false; // initially: docEl.clientHeight <= 415 || docEl.clientWidth < 768

  defaultCols: any[];
  defaultColCount: number;

  currentDataSizeIndex: number;
  dataSizes: DataSize[];

  globalFilter: string;

  loadInstance = 0;
  loadingMessage: string;

  filterCount = 0;

  gridOptions: GridOptions;

  private docEl: HTMLElement;

  // for pseudo random
  seed = 123456789;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.docEl = document.documentElement;
  }

  ngOnInit() {
    [this.defaultCols, this.defaultColCount] = this.getColumnConfiguration();

    // has to be initialized after the column initialization
    this.dataSizes = this.initializeDataSizes(this.defaultColCount);
    this.currentDataSizeIndex = 0;

    this.gridOptions = this.initializeGridOptions();
    this.createData();
  }

  onDataSizeChanged() {
    this.createData();
  }

  onGlobalFilterChange() {
    this.filterCount++;
    const filterCountCopy = this.filterCount;
    setTimeout(() => {
      if (this.filterCount === filterCountCopy) {
        this.gridOptions.api.setQuickFilter(this.globalFilter);
      }
    }, 300);
  }

  createData() {
    this.loadInstance++;

    let loadInstanceCopy = this.loadInstance;

    // on the first rendering the api is still null
    if (this.gridOptions.api) {
      this.gridOptions.api.showLoadingOverlay();
    }

    const colDefs = this.createCols();

    const rowCount = this.getRowCount();
    const colCount = this.getColCount();

    let row = 0;
    const data = [];

    const intervalId = setInterval(() => {
      if (loadInstanceCopy != this.loadInstance) {
        clearInterval(intervalId);
        return;
      }

      for (let i = 0; i < 1000; i++) {
        if (row < rowCount) {
          const rowItem = this.createRowItem(row, colCount);
          data.push(rowItem);
          row++;
        }
      }

      this.loadingMessage = `Generating rows ${row}`;

      if (row >= rowCount) {
        clearInterval(intervalId);
        window.setTimeout(() => {
          this.gridOptions.api.setColumnDefs(colDefs);
          this.gridOptions.api.setRowData(data);
          this.loadingMessage = '';
        }, 0);
      }
    }, 0);
  }

  createRowItem(row, colCount) {
    const rowItem = {} as any;

    //create data for the known columns
    const countriesToPickFrom = Math.floor(countries.length * (((row % 3) + 1) / 3));
    const countryData = countries[(row * 19) % countriesToPickFrom];
    rowItem.country = countryData.country;
    rowItem.continent = countryData.continent;
    rowItem.language = countryData.language;

    const firstName = firstNames[row % firstNames.length];
    const lastName = lastNames[row % lastNames.length];
    rowItem.name = firstName + ' ' + lastName;

    rowItem.game = {
      name: games[Math.floor(((row * 13) / 17) * 19) % games.length],
      bought: booleanValues[row % booleanValues.length],
    };

    rowItem.bankBalance = Math.round(this.pseudoRandom() * 100000) - 3000;
    rowItem.rating = Math.round(this.pseudoRandom() * 5);

    var totalWinnings = 0;
    months.forEach(month => {
      var value = Math.round(this.pseudoRandom() * 100000) - 20;
      rowItem[month.toLocaleLowerCase()] = value;
      totalWinnings += value;
    });
    rowItem.totalWinnings = totalWinnings;

    //create dummy data for the additional columns
    for (let col = this.defaultCols.length; col < colCount; col++) {
      const randomBit = this.pseudoRandom().toString().substring(2, 5);
      const value = this.colNames[col % this.colNames.length] + '-' + randomBit + ' - (' + (row + 1) + ',' + col + ')';
      rowItem['col' + col] = value;
    }

    return rowItem;
  }

  createCols() {
    const colCount = this.getColCount();
    // start with a copy of the default cols
    const columns = this.defaultCols.slice(0, colCount);

    for (let col = this.defaultColCount; col < colCount; col++) {
      const colName = this.colNames[col % this.colNames.length];
      const colDef = { headerName: colName, field: 'col' + col, width: 200, editable: true };
      columns.push(colDef);
    }

    return columns;
  }

  private getRowCount() {
    return this.dataSizes[this.currentDataSizeIndex].rows;
  }

  private getColCount() {
    return this.dataSizes[this.currentDataSizeIndex].cols;
  }

  private initializeGridOptions() {
    const groupColumn = {
      headerName: 'Group',
      width: 250,
      field: 'name',
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        checkbox: true,
      },
    };

    return {
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalAndFilteredRowCountComponent', key: 'totalAndFilter', align: 'left' },
          { statusPanel: 'agSelectedRowCountComponent', align: 'left' },
          { statusPanel: 'agAggregationComponent', align: 'right' },
        ],
      },
      components: {
        personFilter: PersonFilter,
        personFloatingFilterComponent: PersonFloatingFilterComponent,
        countryCellRenderer: countryCellRenderer,
        countryFloatingFilterComponent: CountryFloatingFilterComponent,
        booleanCellRenderer: booleanCellRenderer,
        booleanFilterCellRenderer: booleanFilterCellRenderer,
        winningsFilter: WinningsFilter,
        ratingRenderer: ratingRenderer,
        ratingFilterRenderer: ratingFilterRenderer,
      },
      defaultExportParams: {
        columnGroups: true,
        headerRowHeight: 30,
        rowHeight: 22,
      },
      defaultColDef: {
        minWidth: 50,
        sortable: true,
        filter: true,
        floatingFilter: !this.isSmall,
        resizable: true,
      },
      enableCellChangeFlash: true,
      rowDragManaged: true,
      // suppressMoveWhenRowDragging: true,
      enableMultiRowDragging: true,
      popupParent: this.document.querySelector('#example-wrapper') as HTMLElement,
      // enableBrowserTooltips: true,
      // tooltipShowDelay: 200,
      // ensureDomOrder: true,
      // enableCellTextSelection: true,
      // postProcessPopup: function(params) {
      //     console.log(params);
      // },
      // need to be careful here inside the normal demo, as names are not unique if big data sets
      // getRowNodeId: function(data) {
      //     return data.name;
      // },
      // suppressAsyncEvents: true,
      // suppressAggAtRootLevel: true,
      debug: true,
      // editType: 'fullRow',
      // debug: true,
      // suppressMultiRangeSelection: true,
      rowGroupPanelShow: this.isSmall ? undefined : 'always', // on of ['always','onlyWhenGrouping']
      suppressMenuHide: this.isSmall,
      pivotPanelShow: 'always', // on of ['always','onlyWhenPivoting']
      // pivotColumnGroupTotals: 'before',
      // pivotRowTotals: 'before',
      // suppressRowTransform: true,
      // minColWidth: 50,
      // maxColWidth: 300,
      // rowBuffer: 10,
      // columnDefs: [],
      // singleClickEdit: true,
      // suppressClickEdit: true,
      enterMovesDownAfterEdit: true,
      enterMovesDown: true,
      // domLayout: 'autoHeight',
      // domLayout: 'forPrint',
      // groupUseEntireRow: true, //one of [true, false]
      // groupDefaultExpanded: 9999, //one of [true, false], or an integer if greater than 1
      // headerHeight: 100, // set to an integer, default is 25, or 50 if grouping columns
      // groupSuppressAutoColumn: true,
      // pivotSuppressAutoColumn: true,
      // groupSuppressBlankHeader: true,
      // suppressMovingCss: true,
      // suppressMovableColumns: true,
      // groupIncludeFooter: true,
      // groupIncludeTotalFooter: true,
      // suppressHorizontalScroll: true,
      // alwaysShowVerticalScroll: true,
      suppressColumnMoveAnimation: true,
      // suppressRowHoverHighlight: true,
      // suppressTouch: true,
      // suppressDragLeaveHidesColumns: true,
      // suppressMakeColumnVisibleAfterUnGroup: true,
      // unSortIcon: true,
      enableRtl: /[?&]rtl=true/.test(window.location.search),
      enableCharts: true,
      multiSortKey: 'ctrl',
      animateRows: true,

      enableRangeSelection: true,
      // enableRangeHandle: true,
      enableFillHandle: true,
      undoRedoCellEditing: true,
      undoRedoCellEditingLimit: 50,

      suppressClearOnFillReduction: false,

      rowSelection: 'multiple', // one of ['single','multiple'], leave blank for no selection
      rowDeselection: true,
      quickFilterText: null,
      groupSelectsChildren: true, // one of [true, false]
      // pagination: true,
      // paginateChildRows: true,
      // paginationPageSize: 10,
      // groupSelectsFiltered: true,
      suppressRowClickSelection: true, // if true, clicking rows doesn't select (useful for checkbox selection)
      // suppressColumnVirtualisation: true,
      // suppressContextMenu: true,
      // suppressFieldDotNotation: true,
      autoGroupColumnDef: groupColumn,
      // suppressActionCtrlC: true,
      // suppressActionCtrlV: true,
      // suppressActionCtrlD: true,
      // suppressActionCtrlA: true,
      // suppressCellSelection: true,
      // suppressMultiSort: true,
      // scrollbarWidth: 20,
      sideBar: {
        toolPanels: [
          {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
            toolPanelParams: {
              syncLayoutWithGrid: true,
            },
          },
          {
            id: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agFiltersToolPanel',
            toolPanelParams: {
              syncLayoutWithGrid: true,
            },
          },
        ],
        position: 'right',
        defaultToolPanel: 'columns',
        hiddenByDefault: this.isSmall,
      },

      // showToolPanel: true,//window.innerWidth > 1000,
      // toolPanelSuppressColumnFilter: true,
      // toolPanelSuppressColumnSelectAll: true,
      // toolPanelSuppressColumnExpandAll: true,
      // autoSizePadding: 20,
      // toolPanelSuppressGroups: true,
      // toolPanelSuppressValues: true,
      // groupSuppressAutoColumn: true,
      // contractColumnSelection: true,
      // groupAggFields: ['bankBalance','totalWinnings'],
      // groupMultiAutoColumn: true,
      // groupHideOpenParents: true,
      // suppressMenuFilterPanel: true,
      // clipboardDeliminator: ',',
      // suppressLastEmptyLineOnPaste: true,
      // suppressMenuMainPanel: true,
      // suppressMenuColumnPanel: true,
      // forPrint: true,
      // rowClass: function(params) { return (params.data.country === 'Ireland') ? "theClass" : null; },
      // headerCellRenderer: headerCellRenderer_text,
      // headerCellRenderer: headerCellRenderer_dom,
      onRowSelected: this.rowSelected, //callback when row selected
      onSelectionChanged: this.selectionChanged, //callback when selection changed,
      aggFuncs: {
        zero: function () {
          return 0;
        },
      },
      getBusinessKeyForNode: function (node) {
        return node.data ? node.data.name : '';
      },
      defaultGroupSortComparator: function (nodeA, nodeB) {
        if (nodeA.key < nodeB.key) {
          return -1;
        } else if (nodeA.key > nodeB.key) {
          return 1;
        }

        return 0;
      },
      processCellFromClipboard: function (params) {
        var colIdUpperCase = params.column.getId().toUpperCase();
        var monthsUpperCase = months.map(function (month) {
          return month.toUpperCase();
        });
        var isMonth = monthsUpperCase.indexOf(colIdUpperCase) >= 0;

        if (isMonth) {
          return this.sharedNumberParser(params.value);
        }

        return params.value;
      },
      // rowHeight: 100,
      // suppressTabbing: true,
      // rowHoverClass: true,
      // suppressAnimationFrame: true,
      // pinnedTopRowData: [
      //     {name: 'Mr Pinned Top 1', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
      //     {name: 'Mr Pinned Top 2', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
      //     {name: 'Mr Pinned Top 3', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
      // ],
      // pinnedBottomRowData: [
      //     {name: 'Mr Pinned Bottom 1', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
      //     {name: 'Mr Pinned Bottom 2', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
      //     {name: 'Mr Pinned Bottom 3', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
      // ],
      // callback when row clicked
      // stopEditingWhenGridLosesFocus: true,
      // allowShowChangeAfterFilter: true,
      onRowClicked: function (params) {
        // console.log("Callback onRowClicked: " + (params.data?params.data.name:null) + " - " + params.event);
      },
      // onSortChanged: function (params) {
      //     console.log("Callback onSortChanged");
      // },
      onRowDoubleClicked: function (params) {
        // console.log("Callback onRowDoubleClicked: " + params.data.name + " - " + params.event);
      },
      onGridSizeChanged: function (params) {
        console.log('Callback onGridSizeChanged: ', params);
      },
      // callback when cell clicked
      onCellClicked: function (params) {
        // console.log("Callback onCellClicked: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
      },
      onColumnVisible: function (event) {
        console.log('Callback onColumnVisible:', event);
      },
      onColumnResized: function (event) {
        console.log('Callback onColumnResized:', event);
      },
      onCellValueChanged: function (params) {
        // taking this out, as clipboard paste operation can result in this getting called
        // lots and lots of times (especially if user does ctrl+a to copy everything, then paste)
        // console.log("Callback onCellValueChanged:", params);
      },
      onRowDataChanged: function (params) {
        console.log('Callback onRowDataChanged: ');
      },
      // callback when cell double clicked
      onCellDoubleClicked: function (params) {
        // console.log("Callback onCellDoubleClicked: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
      },
      // callback when cell right clicked
      onCellContextMenu: function (params) {
        console.log('Callback onCellContextMenu: ' + params.value + ' - ' + params.colDef.field + ' - ' + params.event);
      },
      onCellFocused: function (params) {
        // console.log('Callback onCellFocused: ' + params.rowIndex + " - " + params.colIndex);
      },
      onPasteStart: function (params) {
        console.log('Callback onPasteStart:', params);
      },
      onPasteEnd: function (params) {
        console.log('Callback onPasteEnd:', params);
      },
      onGridReady: event => {
        console.log('Callback onGridReady: api = ' + event.api);

        if (this.docEl.clientWidth <= 1024) {
          this.gridOptions.api.closeToolPanel();
        }
      },
      onRowGroupOpened: function (event) {
        console.log('Callback onRowGroupOpened: node = ' + event.node.key + ', ' + event.node.expanded);
      },
      onRangeSelectionChanged: function (event) {
        // console.log('Callback onRangeSelectionChanged: finished = ' + event.finished);
      },
      processChartOptions: params => {
        var type = params.type;
        var options = params.options;

        if (type === 'pie' || type === 'doughnut') {
          options.seriesDefaults.tooltip.renderer = function (params) {
            var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
            var title = params.title
              ? '<div class="ag-chart-tooltip-title"' + titleStyle + '>' + params.title + '</div>'
              : '';
            var value = GridExampleComponent.formatThousands(Math.round(params.datum[params.angleKey]));
            return title + '<div class="ag-chart-tooltip-content">' + '$' + value + '</div>';
          };
        } else {
          var isNormalized = type === 'normalizedBar' || type === 'normalizedColumn' || type === 'normalizedArea';
          var isBar = type === 'groupedBar' || type === 'stackedBar' || type === 'normalizedBar';

          var standardiseNumber = function (value) {
            if (isNaN(value)) {
              return value;
            }
            if (isNormalized) {
              return value + '%';
            }

            const absolute = Math.abs(value);
            let standardised = '';

            if (absolute < 1e3) {
              standardised = (absolute as unknown) as string;
            }
            if (absolute >= 1e3 && absolute < 1e6) {
              standardised = '$' + +(absolute / 1e3).toFixed(1) + 'K';
            }
            if (absolute >= 1e6 && absolute < 1e9) {
              standardised = '$' + +(absolute / 1e6).toFixed(1) + 'M';
            }
            if (absolute >= 1e9 && absolute < 1e12) {
              standardised = '$' + +(absolute / 1e9).toFixed(1) + 'B';
            }
            if (absolute >= 1e12) standardised = '$' + +(absolute / 1e12).toFixed(1) + 'T';

            return value < 0 ? '-' + standardised : standardised;
          };

          var standardNumberFormatter = function (params) {
            return standardiseNumber(params.value);
          };

          options[isBar ? 'xAxis' : 'yAxis'].label.formatter = standardNumberFormatter;

          if (type === 'scatter' || type === 'bubble') {
            options.xAxis.label.formatter = standardNumberFormatter;

            options.seriesDefaults.tooltip.renderer = function (params) {
              var formatCurrency = function (value) {
                return '$' + GridExampleComponent.formatThousands(value);
              };

              var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
              var title = params.title
                ? '<div class="ag-chart-tooltip-title"' + titleStyle + '>' + params.title + '</div>'
                : '';
              var label = params.labelKey ? params.datum[params.labelKey] + '<br>' : '';
              var xValue = params.xName + ': ' + formatCurrency(params.datum[params.xKey]);
              var yValue = params.yName + ': ' + formatCurrency(params.datum[params.yKey]);
              var size = '';
              if (type === 'bubble' && params.sizeKey) {
                size = '<br>' + params.sizeName + ': ' + formatCurrency(params.datum[params.sizeKey]);
              }
              return (
                title + '<div class="ag-chart-tooltip-content">' + label + xValue + '<br>' + yValue + size + '</div>'
              );
            };
          } else if (type === 'histogram') {
            options.seriesDefaults.tooltip.renderer = function (params) {
              var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
              var title = params.title
                ? '<div class="ag-chart-tooltip-title"' + titleStyle + '>' + params.title + '</div>'
                : '';

              if (params.yKey) {
                // with a y key, the value is the total of the yKey value for the population of the bin:
                var value = GridExampleComponent.formatThousands(Math.round(params.datum.total));
                return title + '<div class="ag-chart-tooltip-content">' + '$' + value + '</div>';
              } else {
                // without a y key, the value is a count of the population of the bin:
                var value = params.datum.frequency;
                return title + '<div class="ag-chart-tooltip-content">' + value + '</div>';
              }
            };

            options.xAxis.label.formatter = standardNumberFormatter;
          } else {
            options.seriesDefaults.tooltip.renderer = function (params) {
              var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
              var title = params.title
                ? '<div class="ag-chart-tooltip-title"' + titleStyle + '>' + params.title + '</div>'
                : '';
              var value = GridExampleComponent.formatThousands(Math.round(params.datum[params.yKey]));
              return title + '<div class="ag-chart-tooltip-content">' + '$' + value + '</div>';
            };
          }

          if (options.seriesDefaults.label) {
            options.seriesDefaults.label.formatter = standardNumberFormatter;
          }
        }

        return options;
      },
      getContextMenuItems: this.getContextMenuItems,
      excelStyles: [
        {
          id: 'vAlign',
          alignment: {
            vertical: 'Center',
          },
        },
        {
          id: 'alphabet',
          alignment: {
            vertical: 'Center',
          },
        },
        {
          id: 'good-score',
          alignment: {
            horizontal: 'Center',
            vertical: 'Center',
          },
          interior: {
            color: '#C6EFCE',
            pattern: 'Solid',
          },
          numberFormat: {
            format: '[$$-409]#,##0',
          },
        },
        {
          id: 'bad-score',
          alignment: {
            horizontal: 'Center',
            vertical: 'Center',
          },
          interior: {
            color: '#FFC7CE',
            pattern: 'Solid',
          },
          numberFormat: {
            format: '[$$-409]#,##0',
          },
        },
        {
          id: 'header',
          font: {
            color: '#44546A',
            size: 16,
          },
          interior: {
            color: '#F2F2F2',
            pattern: 'Solid',
          },
          alignment: {
            horizontal: 'Center',
            vertical: 'Center',
          },
          borders: {
            borderTop: {
              lineStyle: 'Continuous',
              weight: 0,
              color: '#8EA9DB',
            },
            borderRight: {
              lineStyle: 'Continuous',
              weight: 0,
              color: '#8EA9DB',
            },
            borderBottom: {
              lineStyle: 'Continuous',
              weight: 0,
              color: '#8EA9DB',
            },
            borderLeft: {
              lineStyle: 'Continuous',
              weight: 0,
              color: '#8EA9DB',
            },
          },
        },
        {
          id: 'currencyCell',
          alignment: {
            horizontal: 'Center',
            vertical: 'Center',
          },
          numberFormat: {
            format: '[$$-409]#,##0',
          },
        },
        {
          id: 'booleanType',
          dataType: 'boolean',
          alignment: {
            vertical: 'Center',
          },
        },
      ],
    } as any;
  }

  private rowSelected(event) {
    // the number of rows selected could be huge, if the user is grouping and selects a group, so
    // to stop the console from clogging up, we only print if in the first 10 (by chance we know
    // the node id's are assigned from 0 upwards)
    if (event.node.id < 10) {
      var valueToPrint = event.node.group ? 'group (' + event.node.key + ')' : event.node.data.name;
      console.log('Callback rowSelected: ' + valueToPrint + ' - ' + event.node.isSelected());
    }
  }

  private selectionChanged(event) {
    console.log('Callback selectionChanged: selection count = ' + this.gridOptions.api.getSelectedNodes().length);
  }

  private sharedNumberParser(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    } else {
      return parseFloat(value);
    }
  }

  static formatThousands(value) {
    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  private getContextMenuItems(params) {
    var result = params.defaultItems ? params.defaultItems.splice(0) : [];
    result.push({
      name: 'Custom Menu Item',
      icon: '<img src="images/lab.svg" style="width: 14px; height: 14px;"/>',
      //shortcut: 'Alt + M',
      action: function () {
        var value = params.value ? params.value : '<empty>';
        window.alert('You clicked a custom menu item on cell ' + value);
      },
    });

    return result;
  }

  private getColumnConfiguration() {
    const columns = [...this.desktopDefaultCols, this.monthGroup];
    const columnsCount = columns.reduce((currentCount, column) => {
      const count = column.children ? column.children.length : 1;
      return currentCount + count;
    }, 0);

    return [columns, columnsCount] as [any[], number];
  }

  get desktopDefaultCols() {
    return [
      // {
      //     headerName: 'Test Date',
      //     editable: true,
      //     cellEditor: 'date',
      //     field: 'testDate'
      // },
      //{headerName: "", valueGetter: "node.id", width: 20}, // this row is for showing node id, handy for testing
      {
        // column group 'Participant
        headerName: 'Participant',
        // marryChildren: true,
        children: [
          {
            headerName: 'Name',
            rowDrag: true,
            field: 'name',
            width: 200,
            editable: true,
            enableRowGroup: true,
            // enablePivot: true,
            filter: 'personFilter',
            cellClass: 'vAlign',
            floatingFilterComponent: 'personFloatingFilterComponent',
            checkboxSelection: function (params) {
              // we put checkbox on the name if we are not doing grouping
              return params.columnApi.getRowGroupColumns().length === 0;
            },
            headerCheckboxSelection: function (params) {
              // we put checkbox on the name if we are not doing grouping
              return params.columnApi.getRowGroupColumns().length === 0;
            },
            headerCheckboxSelectionFilteredOnly: true,
          },
          {
            headerName: 'Language',
            field: 'language',
            width: 150,
            editable: true,
            filter: 'agSetColumnFilter',
            cellEditor: 'agSelectCellEditor',
            cellClass: 'vAlign',
            enableRowGroup: true,
            enablePivot: true,
            // rowGroupIndex: 0,
            // pivotIndex: 0,
            cellEditorParams: {
              values: [
                'English',
                'Spanish',
                'French',
                'Portuguese',
                'German',
                'Swedish',
                'Norwegian',
                'Italian',
                'Greek',
                'Icelandic',
                'Portuguese',
                'Maltese',
              ],
            },
            // pinned: 'left',
            headerTooltip: 'Example tooltip for Language',
            filterParams: {
              newRowsAction: 'keep',
              resetButton: true,
            },
          },
          {
            headerName: 'Country',
            field: 'country',
            width: 150,
            editable: true,
            cellRenderer: 'countryCellRenderer',
            // pivotIndex: 1,
            // rowGroupIndex: 1,
            cellClass: 'vAlign',
            // colSpan: function(params) {
            //     if (params.data && params.data.country==='Ireland') {
            //         return 2;
            //     } else if (params.data && params.data.country==='France') {
            //         return 3;
            //     } else {
            //         return 1;
            //     }
            // },
            // cellStyle: function(params) {
            //     if (params.data && params.data.country==='Ireland') {
            //         return {backgroundColor: 'red'};
            //     } else if (params.data && params.data.country==='France') {
            //         return {backgroundColor: 'green'};
            //     } else {
            //         return null;
            //     }
            // },
            // rowSpan: function(params) {
            //     if (params.data && params.data.country==='Ireland') {
            //         return 2;
            //     } else if (params.data && params.data.country==='France') {
            //         return 3;
            //     } else {
            //         return 1;
            //     }
            // },
            // suppressMovable: true,
            enableRowGroup: true,
            enablePivot: true,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              cellRenderer: 'countryCellRenderer',
              values: [
                'Argentina',
                'Brazil',
                'Colombia',
                'France',
                'Germany',
                'Greece',
                'Iceland',
                'Ireland',
                'Italy',
                'Malta',
                'Portugal',
                'Norway',
                'Peru',
                'Spain',
                'Sweden',
                'United Kingdom',
                'Uruguay',
                'Venezuela',
                'Belgium',
                'Luxembourg',
              ],
            },
            // pinned: 'left',
            floatCell: true,
            filterParams: {
              cellRenderer: 'countryCellRenderer',
              // cellHeight: 20,
              newRowsAction: 'keep',
              resetButton: true,
              // suppressSelectAll: true
            },
            floatingFilterComponent: 'countryFloatingFilterComponent',
            icons: {
              sortAscending: '<i class="fa fa-sort-alpha-up"/>',
              sortDescending: '<i class="fa fa-sort-alpha-down"/>',
            },
          },
        ],
      },
      {
        // column group 'Game of Choice'
        headerName: 'Game of Choice',
        children: [
          {
            headerName: 'Game Name',
            field: 'game.name',
            width: 180,
            editable: true,
            filter: 'agSetColumnFilter',
            tooltipField: 'game.name',
            cellClass: function () {
              return 'alphabet';
            },
            filterParams: {
              newRowsAction: 'keep',
              resetButton: true,
            },
            enableRowGroup: true,
            enablePivot: true,
            // pinned: 'right',
            // rowGroupIndex: 1,
            icons: {
              sortAscending: '<i class="fa fa-sort-alpha-up"/>',
              sortDescending: '<i class="fa fa-sort-alpha-down"/>',
            },
          },
          {
            headerName: 'Bought',
            field: 'game.bought',
            filter: 'agSetColumnFilter',
            editable: true,
            width: 150,
            // pinned: 'right',
            // rowGroupIndex: 2,
            // pivotIndex: 1,
            enableRowGroup: true,
            enablePivot: true,
            cellClass: 'booleanType',
            cellRenderer: 'booleanCellRenderer',
            cellStyle: { 'text-align': 'center' },
            comparator: booleanComparator,
            floatCell: true,
            filterParams: {
              cellRenderer: 'booleanFilterCellRenderer',
              newRowsAction: 'keep',
              resetButton: true,
            },
          },
        ],
      },
      {
        // column group 'Performance'
        headerName: 'Performance',
        groupId: 'performance',
        children: [
          {
            headerName: 'Bank Balance',
            field: 'bankBalance',
            width: 180,
            editable: true,
            filter: 'winningsFilter',
            valueFormatter: this.currencyFormatter,
            type: 'numericColumn',
            cellClassRules: {
              currencyCell: 'typeof x == "number"',
            },
            enableValue: true,
            // colId: 'sf',
            // valueGetter: '55',
            // aggFunc: 'sum',
            icons: {
              sortAscending: '<i class="fa fa-sort-amount-up"/>',
              sortDescending: '<i class="fa fa-sort-amount-down"/>',
            },
          },
          {
            colId: 'extraInfo1',
            headerName: 'Extra Info 1',
            columnGroupShow: 'open',
            width: 150,
            editable: false,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellStyle: { 'text-align': 'right' },
            cellRenderer: function () {
              return 'Abra...';
            },
          },
          {
            colId: 'extraInfo2',
            headerName: 'Extra Info 2',
            columnGroupShow: 'open',
            width: 150,
            editable: false,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellStyle: { 'text-align': 'left' },
            cellRenderer: function () {
              return '...cadabra!';
            },
          },
        ],
      },
      {
        headerName: 'Rating',
        field: 'rating',
        width: 120,
        editable: true,
        cellRenderer: 'ratingRenderer',
        cellClass: 'vAlign',
        floatCell: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        chartDataType: 'category',
        filterParams: { cellRenderer: 'ratingFilterRenderer' },
      },
      {
        headerName: 'Total Winnings',
        field: 'totalWinnings',
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        editable: true,
        valueParser: this.numberParser,
        width: 200,
        // aggFunc: 'sum',
        enableValue: true,
        cellClassRules: {
          currencyCell: 'typeof x == "number"',
        },
        valueFormatter: this.currencyFormatter,
        cellStyle: this.currencyCssFunc,
        icons: {
          sortAscending: '<i class="fa fa-sort-amount-up"/>',
          sortDescending: '<i class="fa fa-sort-amount-down"/>',
        },
      },
    ];
  }

  get monthGroup() {
    return {
      headerName: 'Monthly Breakdown',
      children: months.map(month => ({
        headerName: month,
        field: month.toLocaleLowerCase(),
        width: 150,
        filter: 'agNumberColumnFilter',
        editable: true,
        type: 'numericColumn',
        enableValue: true,
        // aggFunc: 'sum',
        //hide: true,
        cellClassRules: {
          'good-score': 'typeof x === "number" && x > 50000',
          'bad-score': 'typeof x === "number" && x < 10000',
          currencyCell: 'typeof x === "number" && x >= 10000 && x <= 50000',
        },
        valueParser: this.numberParser,
        valueFormatter: this.currencyFormatter,
        filterParams: {
          resetButton: true,
          inRangeInclusive: true,
        },
      })),
    };
  }

  get colNames() {
    return [
      'Station',
      'Railway',
      'Street',
      'Address',
      'Toy',
      'Soft Box',
      'Make and Model',
      'Longest Day',
      'Shortest Night',
    ];
  }

  private currencyFormatter(params) {
    if (params.value === null || params.value === undefined) {
      return null;
    } else if (isNaN(params.value)) {
      return 'NaN';
    } else {
      // if we are doing 'count', then we do not show pound sign
      if (params.node.group && params.column.aggFunc === 'count') {
        return params.value;
      } else {
        var result = '$' + GridExampleComponent.formatThousands(Math.floor(Math.abs(params.value)));
        if (params.value < 0) {
          result = '(' + result + ')';
        }
        return result;
      }
    }
  }

  private numberParser(params) {
    return this.sharedNumberParser(params.newValue);
  }

  private currencyCssFunc(params) {
    if (params.value !== null && params.value !== undefined && params.value < 0) {
      return { color: 'red', 'font-weight': 'bold' };
    } else {
      return {};
    }
  }

  private initializeDataSizes(defaultColumnCount: number) {
    return [
      {
        rows: 100,
        cols: defaultColumnCount,
      },
      {
        rows: 1000,
        cols: defaultColumnCount,
      },
      {
        rows: 10000,
        cols: 100,
      },
      {
        rows: 50000,
        cols: 100,
      },
      {
        rows: 100000,
        cols: defaultColumnCount,
      },
    ];
  }

  pseudoRandom() {
    const m = Math.pow(2, 32);
    const a = 1103515245;
    const c = 12345;

    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
}
