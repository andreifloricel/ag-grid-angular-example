function PersonFloatingFilterComponent() {}

PersonFloatingFilterComponent.prototype.init = function (params) {
  this.params = params;
  var eGui = (this.eGui = document.createElement('div'));
  eGui.className = 'ag-input-wrapper';
  var input = (this.input = document.createElement('input'));
  input.className = 'ag-floating-filter-input';
  eGui.appendChild(input);
  this.changeEventListener = function () {
    params.parentFilterInstance(function (instance) {
      instance.setFromFloatingFilter(input.value);
    });
  };
  input.addEventListener('input', this.changeEventListener);
};

PersonFloatingFilterComponent.prototype.getGui = function () {
  return this.eGui;
};

PersonFloatingFilterComponent.prototype.onParentModelChanged = function (model) {
  // add in child, one for each flat
  this.input.value = model != null ? model : '';
};

PersonFloatingFilterComponent.prototype.destroy = function () {
  this.input.removeEventListener('input', this.changeEventListener);
};

export { PersonFloatingFilterComponent };
