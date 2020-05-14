function PersonFilter() {}

PersonFilter.prototype.init = function (params) {
  this.valueGetter = params.valueGetter;
  this.filterText = null;
  this.params = params;
  this.setupGui();
};

// not called by ag-Grid, just for us to help setup
PersonFilter.prototype.setupGui = function () {
  this.gui = document.createElement('div');
  this.gui.innerHTML =
    '<div style="padding: 4px;">' +
    '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
    '<div class="ag-input-wrapper"><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
    '<div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, e.g. "mich phel" still brings back Michael Phelps.</div>' +
    '<div style="margin-top: 20px; width: 200px;">Just to illustrate that anything can go in here, here is an image:</div>' +
    '<div><img src="images/ag-Grid2-200.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/></div>' +
    '</div>';

  this.eFilterText = this.gui.querySelector('#filterText');
  this.eFilterText.addEventListener('input', this.onFilterChanged.bind(this));
};

PersonFilter.prototype.setFromFloatingFilter = function (filter) {
  this.eFilterText.value = filter;
  this.onFilterChanged();
};

PersonFilter.prototype.onFilterChanged = function () {
  this.extractFilterText();
  this.params.filterChangedCallback();
};

PersonFilter.prototype.extractFilterText = function () {
  this.filterText = this.eFilterText.value;
};

PersonFilter.prototype.getGui = function () {
  return this.gui;
};

PersonFilter.prototype.doesFilterPass = function (params) {
  // make sure each word passes separately, ie search for firstname, lastname
  var passed = true;
  var valueGetter = this.valueGetter;
  this.filterText
    .toLowerCase()
    .split(' ')
    .forEach(function (filterWord) {
      var value = valueGetter(params);
      if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
        passed = false;
      }
    });

  return passed;
};

PersonFilter.prototype.isFilterActive = function () {
  var isActive = this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
  return isActive;
};

PersonFilter.prototype.getModelAsString = function (model) {
  return model ? model : '';
};

PersonFilter.prototype.getModel = function () {
  return this.eFilterText.value;
};

// lazy, the example doesn't use setModel()
PersonFilter.prototype.setModel = function (model) {
  this.eFilterText.value = model;
  this.extractFilterText();
};

PersonFilter.prototype.destroy = function () {
  this.eFilterText.removeEventListener('input', this.onFilterChanged);
};

export { PersonFilter };
