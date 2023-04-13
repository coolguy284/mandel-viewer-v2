function showCoordinates() {
  if (SHOW_COORDINATES) {
    if (coords.style.display == 'none') {
      coords.style.display = '';
    }
  } else {
    if (coords.style.display != 'none') {
      coords.style.display = 'none';
    }
  }
  
  if (SHOW_COORDINATES) {
    if (RENDER_METHOD == 6 || RENDER_METHOD == 7) {
      let coordPrecision = math.max(math.floor(-math.log10(SCALE)) + 3, 3);
      
      coords.innerHTML = `X: ${X.toFixed(coordPrecision)}, Y: ${Y.toFixed(coordPrecision)}, Scale: ${SCALE.toPrecision(4)}, Perturbation: ${usingPerturbation}`;
    } else {
      let coordPrecision = Math.min(Math.max(Math.floor(-Math.log10(SCALE)) + 3, 3), 16);
      
      coords.innerHTML = `X: ${X.toFixed(coordPrecision)}, Y: ${Y.toFixed(coordPrecision)}, Scale: ${SCALE.toPrecision(4)}`;
    }
  }
}

function showSettings() {
  if (SHOW_SETTINGS) {
    if (settings.style.display == 'none') {
      settingVarsToSettingInputs();
      settings.style.display = '';
      coords.style.userSelect = 'auto';
    }
  } else {
    if (settings.style.display != 'none') {
      settings.style.display = 'none';
      coords.style.userSelect = '';
      let selection = getSelection();
      if (selection.anchorNode && (selection.anchorNode.id ?? selection.anchorNode.parentElement?.id == 'coords')) {
        selection.removeAllRanges();
      }
    }
  }
}
