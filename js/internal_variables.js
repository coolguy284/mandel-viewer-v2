let realCanvasWidth = null, realCanvasHeight = null;
let mouseDown = false;
let velX = 0, velY = 0, velMag = 0;
let targetScale = SCALE, targetScalePMouseX = null, targetScalePMouseY = null;
let pMouseX = null, pMouseY = null, pTimestamp = null, timeUnclicked = null;
let previousMouseDrags = [];
let logZoomScaleFactor = Math.log(ZOOM_SCALE_FACTOR);
let ctxType, ctx;
let shaderProgram, shaderProgramInfo;