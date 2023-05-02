let realCanvasWidth = null, realCanvasHeight = null;
let mouseDown = false;
let velX = 0, velY = 0, velMag = 0;
let targetScale = SCALE, targetScalePMouseX = null, targetScalePMouseY = null;
let pMouseX = null, pMouseY = null, pTimestamp = null, timeUnclicked = null;
let previousMouseDrags = [];
let logZoomScaleFactor = Math.log(ZOOM_SCALE_FACTOR);
let ctxType, ctx;
let shaderProgram, shaderProgramInfo;
let startingPopupClosed = false;
let usingPerturbation = false;
let movementUnlocked = false;
let remarketingInputSequenceSet = new Set(REMARKETING_INPUT_SEQUENCE);
let remarketingInputCurrentIndex = 0;
let remarketingInputTimeout = null;
let audioState = 0; // 0 for stopped, 1 for hum, 2 for sorting algos
let audioElement = null;
let crashVal = 0;
let crashKeys = [];
