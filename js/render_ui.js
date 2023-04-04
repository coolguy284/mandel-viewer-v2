function showCoordinates() {
  let coordPrecision = Math.min(Math.max(-Math.log10(SCALE) + 3, 3), 16);
  
  if (SHOW_COORDINATES) {
    if (coords.style.display == 'none') {
      coords.style.display = '';
    }
  } else {
    if (coords.style.display != 'none') {
      coords.style.display = 'none';
    }
  }
  
  coords.innerHTML = `X: ${X.toFixed(coordPrecision)}, Y: ${Y.toFixed(coordPrecision)}, Scale: ${SCALE.toPrecision(4)}`;
}

function showSettings() {
  if (SHOW_SETTINGS) {
    if (settings.style.display == 'none') {
      settingVarsToSettingInputs();
      settings.style.display = '';
    }
  } else {
    if (settings.style.display != 'none') {
      settings.style.display = 'none';
    }
  }
}
