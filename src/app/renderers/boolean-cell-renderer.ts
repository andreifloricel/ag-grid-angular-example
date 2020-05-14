function booleanCleaner(value) {
  if (value === 'true' || value === true || value === 1) {
    return true;
  } else if (value === 'false' || value === false || value === 0) {
    return false;
  } else {
    return null;
  }
}

let count = 0;
function booleanCellRenderer(params) {
  count++;
  if (count <= 1) {
    // params.api.onRowHeightChanged();
  }

  var valueCleaned = booleanCleaner(params.value);
  if (valueCleaned === true) {
    return "<span title='true' class='ag-icon ag-icon-tick content-icon'></span>";
  } else if (valueCleaned === false) {
    return "<span title='false' class='ag-icon ag-icon-cross content-icon'></span>";
  } else if (params.value !== null && params.value !== undefined) {
    return params.value.toString();
  } else {
    return null;
  }
}

function booleanFilterCellRenderer(params) {
  var valueCleaned = booleanCleaner(params.value);
  if (valueCleaned === true) {
    return "<span title='true' class='ag-icon ag-icon-tick content-icon'></span>";
  } else if (valueCleaned === false) {
    return "<span title='false' class='ag-icon ag-icon-cross content-icon'></span>";
  } else {
    return '(empty)';
  }
}

function booleanComparator(value1, value2) {
  var value1Cleaned = booleanCleaner(value1);
  var value2Cleaned = booleanCleaner(value2);
  var value1Ordinal = value1Cleaned === true ? 0 : value1Cleaned === false ? 1 : 2;
  var value2Ordinal = value2Cleaned === true ? 0 : value2Cleaned === false ? 1 : 2;
  return value1Ordinal - value2Ordinal;
}

export { booleanCellRenderer, booleanFilterCellRenderer, booleanComparator };
