function settingInputsToSettingVars() {
  X = parseFloat(settings_x.value);
  Y = parseFloat(settings_y.value);
  SCALE = parseFloat(settings_scale.value);
  
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
}

function resetCoordsButton() {
  events.escapeKey();
  
  settingVarsToSettingInputs();
}

function closeSettings() {
  SHOW_SETTINGS = false;
  
  showSettings();
}