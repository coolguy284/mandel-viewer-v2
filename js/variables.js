let SHOW_SETTINGS = false; // whether settings menu is shown
let SHOW_REMARKETING = false; // whether remarketing menu is shown
let AUTOHIDE_STARTING_PROMPT = false; // if true, hides startup prompt automatically
let PRESENTATION_MODE = false; // whether to remove the settings cogwheel and perform a predetermined mandelbrot zoom to interesting place #2 (one indexed)
let CRASHED = false; // whether the mandelbrot set is crashed

let X = 0, Y = 0, SCALE = 4; // coordinates for mandelbrot set
/*
  interesting places:
  X = -0.10109636384562178, Y = 0.9562865108091415, SCALE = 9.603811037451508e-15; LOG_ZOOM = 2; top spiral
  X = -0.5480711427318311, Y = 0.5332889853014647, SCALE = 0.00013311315952046655; INERTIA_ZOOM_FACTOR = 1; comment out settings cogwheel; cool place to zoom in to
  X = math.bignumber('-0.1669138399758970336918858535530384159750754298744987026667204716'), Y = math.bignumber('1.036113602793806406801271495188574980225574959651585263187751418'), SCALE = math.bignumber('4.220155877953513927149612108611859709103720835692467166641984013e-16'); moderate iteration count place to test perturbation calculations
  X = math.bignumber('-0.13366830663337054858694168519219914479618712801034600522034914692189472761015923'), Y = math.bignumber('0.98932382309115156518297342024612380516419557875952324115767608094733408811445238'), SCALE = math.bignumber('1.3548879785039105487888559459877876350852457647933820199308945371879909567104359e-61'); high iteration count place that gets blocky then smooth again when zooming in
  X = math.bignumber('-0.1147409879068822285159937703493240096136779462774800779007524284'), Y = math.bignumber('0.9692401746189442916348371273509114547260222961120647210933079948'), SCALE = math.bignumber('1.233819714763475472099061090538540230841846561756676669109077158e-17')
*/

let PALLETE = 0; // 0 - blue, 1 - green, 2 - red, 3 - rainbow
let LOG_RENDER = 0; // convert distance from center of screen to an exponential coordinate, allows most of mandelbrot zoom to be viewed at once; 0 - no log render, 1 - 50% of mandelbrot set zoom is visible, 2 - full mandelbrot set is always visible, albeit distorted
let SMOOTH_ITERS = true; // calculate fractional iteration count and color smoothly

let RENDER_METHOD = 7; // 0 - fillRect canvas test, 1 - js calculations and manual pixel setting, 2 - webgl test, 3 - webgl shader test, 4 - webgl shader, 5 - math.js calculations and manual pixel setting, 6 - math.js high precision for center, and perturbations calculated with js, 7 - math.js high precision for center, and perturbations calculated with shader
let MAX_ITERS = 1024; // depth of mandelbrot calculation
let ESCAPE_RADIUS = 256.0; // distance beyond which a point is considered escaped from the mandelbrot set
let INERTIA = true; // smooth movement and scroll
let SHOW_COORDINATES = false; // whether coordinates are shown in bottom right hand corner

let RANDOM_COLOR_FUZZING = true, // very slight banding is visible even with smoothed iteration count, with random fuzzing based on the real floating point value of the iteration count the banding becomes completely invisible
  DO_ARTIFICIAL_BANDING = false, // quantize iteration count after calculating smooth iteration count, primarily used to test random color fuzzing
  ARTIFICIAL_BANDING_FACTOR = 256; // factor of quantization, 2 makes color channel even, 3 makes color channel a multiple of 3, etc.
let SUBPIXEL_SCALE = 1; // default ratio of canvas pixel size to true canvas size, 0 < x < 1 to render faster but more pixelated, x > 1 to supersample and make higher quality image
let ZOOM_SCALE_FACTOR = (1 / 1.5) ** (1 / 120); // amount that image scale is changed per unit of mouse delta (normal scroll is 120 delta)
let INERTIA_SLOWDOWN = 10, // pixel speed amount that is decreased every second
  INERTIA_FASTSLOWDOWN_TIME_THRESHOLD = 0.8, // amount of seconds of slow inertia slowdown before fast slowdown begins, must also be moving faster than velocity threshold
  INERTIA_FASTSLOWDOWN_VEL_THRESHOLD = 3, // pixel speed must be above this value before fast slowdown begins, must also be after the time threshold
  INERTIA_SLOWDOWN_FACTOR = 0.1, // smaller to slowdown faster in fast slowdown, hard to understand unit so just experiment
  INERTIA_MOVE_THRESHOLD = 1e-6, // minimum pixel velocity of the canvas to perform a move
  INERTIA_ZOOM_FACTOR = 20, // bigger to reach target zoom faster, hard to understand unit so just experiment
  INERTIA_ZOOM_THRESHOLD = 1e-2; // minimum natural log difference between target and current scale to perform a zoom operation
let PREV_MOUSE_BUFFER_LENGTH = 3, // number of previous mouse inputs used to calculate average speed to apply to canvas; only used with inertia
  PREV_MOUSE_BUFFER_TIMESPAN = 0.1 * 1000; // maximum time in past to include mouse inputs in the previous mouse buffer; only used with inertia
let WEBGL_CANVAS_RESIZE_WAIT = 100; // time in milliseconds to wait before resizing
let PERTURBATION_THRESHOLD_FLOAT = math.bignumber(4.768371584e-7 * 10), // threshold for perturbation check, currently scaled based on the minimum distance between floats above magnitude 4.0
  PERTURBATION_THRESHOLD_DOUBLE = math.bignumber(8.881784197001252e-16 * 100), // threshold for perturbation check, currently scaled based on the minimum distance between doubles above magnitude 4.0
  PERTURBATION_THRESHOLD_FLOAT_SQ = math.square(math.bignumber(4.768371584e-7 * 10)), // this one and the one below are the squared versions of the thresholds, not the number squared though
  PERTURBATION_THRESHOLD_DOUBLE_SQ = math.square(math.bignumber(8.881784197001252e-16 * 1e5));
let REMARKETING_INPUT_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA', 'Enter']; // typing the konami code (with "enter" replacing "start") will open the remarketing menu
let REMARKETING_INPUT_SEQUENCE_TIMEOUT = 5000; // timeout in milliseconds for remarketing input sequence
let CRASH_KEYS_THRESHOLD = 10; // value that the crash threshold must be at for a crash
let CRASH_KEYS_DROP_DELAY = 100; // delay in milliseconds before crash threshold drops
let CRASH_KEYS_ESCAPE_THRESHOLD = 3; // number of times escape key must be pressed to stop crash
let CRASH_KEYS_ESCAPE_TIMEOUT = 1000; // timeout in milliseconds before escape cancellation of crashing is itself cancelled
let CRASH_KEYS_ESCAPE_LOCKOUT = 2000; // time in milliseconds that escape key will be locked after successful escape-key based uncrash
let CRASH_SORTING_ALGOS_CHANCE = 0.25; // chance in not percent that the crash will play sorting algos noise instead of regular noise
let CRASH_VOLUME = 0.1; // volume of crash audio because audio clips are quite loud by default
let SORTING_ALGOS_CREDITATION_APPEAR_DELAY = 1000; // time in milliseconds when crashed mandelbrot sorting algorythm version before sorting algorithm music will play (Timo Bingmann: 15 Sorting Algorithms in 6 Minutes (https://www.youtube.com/watch?v=kPRA0W1kECg))
let SORTING_ALGOS_CREDITATION_LETTER_DELAY = 30; // time in milliseconds for each letter to appear

/*
  See features-and-todo.txt for features and todo
*/

if (PRESENTATION_MODE) {
  function performFancyZoom(x, y, endScale, zoomSpeed, startingDelay) {
    AUTOHIDE_STARTING_PROMPT = true;
    X = x;
    Y = y;
    SUBPIXEL_SCALE = 2;
    INERTIA_ZOOM_FACTOR = 1;
    document.body.removeChild(settings_btn);
    
    window.addEventListener('load', () => {
      setTimeout(async () => {
        pMouseX = Math.floor(realCanvasWidth / 2);
        pMouseY = Math.floor(realCanvasHeight / 2);
        
        let scaleRatio = endScale / SCALE;
        let zoomItersFloat = Math.log(scaleRatio) / Math.log(ZOOM_SCALE_FACTOR) / zoomSpeed;
        let zoomIters = Math.floor(zoomItersFloat);
        let zoomItersExtra = zoomItersFloat - zoomIters;
        
        for (var i = 0; i < zoomIters; i++) {
          events.wheel(zoomSpeed);
          X = x;
          Y = y;
          
          await new Promise(r => setTimeout(r, 50));
        }
        
        if (zoomItersExtra > 0) {
          events.wheel(zoomSpeed * zoomItersExtra);
          X = x;
          Y = y;
        }
      }, startingDelay);
    });
  }
  
  let zoomX = -0.5480711427318311;
  let zoomY = 0.5332889853014647;
  let zoomEndScale = 0.000095;
  let zoomSpeed = 20;
  let zoomStartingDelay = 2000;
  
  performFancyZoom(zoomX, zoomY, zoomEndScale, zoomSpeed, zoomStartingDelay);
}
