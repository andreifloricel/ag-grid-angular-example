function ratingRendererGeneral(value, forFilter) {
  var result = '<span>';
  for (var i = 0; i < 5; i++) {
    if (value > i) {
      result += '<img src="/assets/images/star.svg" class="star" width=12 height=12 />';
    }
  }
  if (forFilter && value === 0) {
    result += '(no stars)';
  }
  result += '</span>';
  return result;
}

function ratingFilterRenderer(params) {
  return ratingRendererGeneral(params.value, true);
}

function ratingRenderer(params) {
  return ratingRendererGeneral(params.value, false);
}

export { ratingFilterRenderer, ratingRenderer };
