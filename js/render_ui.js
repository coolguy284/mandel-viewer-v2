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

async function sortingAlgoReveal() {
  sortingAlgosCreditationRunning = true;
  
  await new Promise(r => setTimeout(r, SORTING_ALGOS_CREDITATION_APPEAR_DELAY));
  
  if (audioState != 2) {
    sortingAlgosCreditationRunning = false;
    return;
  }
  
  sorting_algos_attribution.style.display = '';
  
  for (let i = 0; i < sortingAlgosCreditation.length; i++) {
    await new Promise(r => setTimeout(r, SORTING_ALGOS_CREDITATION_LETTER_DELAY));
    
    if (audioState != 2) {
      sortingAlgosCreditationRunning = false;
      return;
    }
    
    sorting_algos_attribution.textContent += sortingAlgosCreditation[i];
  }
  
  sortingAlgosCreditationRunning = false;
}

function handleAudioState() {
  if (CRASHED) {
    if (audioState == 0) {
      audioState = Math.random() < CRASH_SORTING_ALGOS_CHANCE ? 2 : 1;
      if (audioState == 1) {
        audioElement = new Audio('media/hum.mp3');
      } else {
        audioElement = new Audio('media/sorting algos.mp3');
        if (sortingAlgosCreditationRunning == false) {
          sortingAlgoReveal();
        }
      }
      audioElement.volume = CRASH_VOLUME;
      audioElement.loop = true;
      audioElement.play();
    }
  } else {
    if (audioState > 0) {
      audioElement.pause();
      audioElement = null;
      audioState = 0;
      if (sorting_algos_attribution.style.display == '') {
        sorting_algos_attribution.style.display = 'none';
        let selection = getSelection();
        if (selection.anchorNode && (selection.anchorNode.id ?? selection.anchorNode.parentElement?.id == 'sorting_algos_attribution')) {
          selection.removeAllRanges();
        }
        sorting_algos_attribution.textContent = '';
      }
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

function showRemarketing() {
  if (SHOW_REMARKETING) {
    if (remarketing_popup.style.display == 'none') {
      remarketing_popup.style.display = '';
    }
  } else {
    if (remarketing_popup.style.display == '') {
      remarketing_popup.style.display = 'none';
    }
  }
}
