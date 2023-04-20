function settingInputsToSettingVars() {
  if (typeof X == 'object') {
    X = math.bignumber(settings_x.value);
    Y = math.bignumber(settings_y.value);
    SCALE = math.bignumber(settings_scale.value);
  } else {
    X = parseFloat(settings_x.value);
    Y = parseFloat(settings_y.value);
    SCALE = parseFloat(settings_scale.value);
  }
  
  PALLETE = parseInt(settings_color_pallete.value);
  LOG_RENDER = parseInt(settings_log_render.value);
  SMOOTH_ITERS = settings_smooth_iteration_count.checked;
  
  RENDER_METHOD = parseInt(settings_render_method.value);
  MAX_ITERS = parseInt(settings_max_iterations.value);
  ESCAPE_RADIUS = parseFloat(settings_escape_radius.value);
  INERTIA = settings_inertia.checked;
  
  if (INERTIA) {
    targetScale = SCALE;
  }
  
  render();
}

function settingInputsToSettingVars_ShowCoords() {
  SHOW_COORDINATES = settings_show_coordinates.checked;
  
  showCoordinates();
}

function settingInputsToSettingVars_SubpixelScale() {
  SUBPIXEL_SCALE = parseFloat(settings_subpixel_scale.value);
  
  resizeCanvas();
  render();
}

function settingVarsToSettingInputs() {
  settings_x.value = X;
  settings_y.value = Y;
  settings_scale.value = SCALE;
  
  settings_color_pallete.value = PALLETE;
  settings_log_render.value = LOG_RENDER;
  settings_smooth_iteration_count.checked = SMOOTH_ITERS;
  
  settings_render_method.value = RENDER_METHOD;
  settings_max_iterations.value = MAX_ITERS;
  settings_escape_radius.value = ESCAPE_RADIUS;
  settings_inertia.checked = INERTIA;
  settings_show_coordinates.checked = SHOW_COORDINATES;
  
  settings_subpixel_scale.value = SUBPIXEL_SCALE;
}

function resetCoordsButton() {
  events.escapeKey();
  
  settingVarsToSettingInputs();
}

function toggleSettings() {
  if (!startingPopupClosed) {
    closeStartingPopup();
  }
  
  SHOW_SETTINGS = !SHOW_SETTINGS;
  
  calculateMovementUnlocked(SHOW_SETTINGS);
  
  showSettings();
}

function closeSettings() {
  SHOW_SETTINGS = false;
  
  calculateMovementUnlocked(SHOW_SETTINGS);
  
  showSettings();
}

function closeStartingPopup() {
  startingPopupClosed = true;
  
  calculateMovementUnlocked(!startingPopupClosed);
  
  starting_popup.style.display = 'none';
}

function toggleRemarketing() {
  SHOW_REMARKETING = !SHOW_REMARKETING;
  
  calculateMovementUnlocked(SHOW_REMARKETING);
  
  showRemarketing();
}

function revealRemarketing() {
  if (movementUnlocked) {
    toggleRemarketing();
  }
}

function closeRemarketing() {
  if (SHOW_REMARKETING) {
    toggleRemarketing();
  }
}

function setRemarketingPhase(phaseNum, elem) {
  switch (phaseNum) {
    case 0:
      remarketing_popup_phase_1.style.display = '';
      remarketing_popup_phase_2.style.display = 'none';
      break;
    
    case 1:
      remarketing_popup_phase_1.style.display = 'none';
      remarketing_popup_phase_2.style.display = '';
      
      remarketing_wiki_entry_title.innerHTML = elem.innerHTML;
      remarketing_wiki_entry_contents.innerHTML = REMARKETING_DATA[elem.innerHTML];
      break;
  }
}

function calculateMovementUnlocked(showVar) {
  if (showVar) {
    movementUnlocked = false;
  } else {
    if (SHOW_SETTINGS || SHOW_REMARKETING || !startingPopupClosed) {
      movementUnlocked = false;
    } else {
      movementUnlocked = true;
    }
  }
}
