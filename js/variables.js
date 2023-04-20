let SHOW_SETTINGS = false; // whether settings menu is shown
let SHOW_REMARKETING = false; // whether remarketing menu is shown
let AUTOHIDE_STARTING_PROMPT = false; // if true, hides startup prompt automatically

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

/*
  1. simple canvas test
  2. simple mandel rendering
  3. movement support
  4. scrolling support
  5. updating header numbers
  6. updating header numbers with good precision
  7. normalized iteration count
  8. fix coordinate flip
  9. inertia on scrolling
  10. fix coordinates becoming NaN on inertia due to velMag being 0 (thus division by 0)
  11. make event handlers prevent default action (primarily for scrolling if it is embedded in an iframe)
  12. add random fuzzing / artifical banding support
  13. zoom smoothly
  14. remove preventdefault on mousedown, up, move
  15. update log rendering mode
  16. add other color palletes
  17. esc key to reset position
  18. touch support
  19. settings menu
  20. add reset button to settings menu
  21. add basic webgl implementation and fix resizing webgl canvas
  22. gpu support
  23. feature complete the shader
  24. add starting prompt that explains what site is and that double click for settings menu
  25. make settings menu cog
  26. fix pmousex and y not set before zoom operation
  27. escape to close popups
  28. add basic math.js support
  29. add math.js js perturbation calculation mode
  30. remove unnecessary debug_log element
  31. fix coord element wrapping
  32. add math.js inertia support
  33. mark perturbation calculations as beta
  34. add math.js webgl perturbation calculation mode
  35. slightly adjust perturbation thresholds
  36. add remarketing menu (easter egg 1; currently inaccessible)
  37. add special keybind sequence for remarketing menu (easter egg 1)
  38. add visual indicator for konami code progress (easter egg 1)
  39. make konami code timeout after a while (easter egg 1)
  proper ui size on mobile
  localstorage support
  add log render and complete all features of perturbation mode
  add settings for artificial banding
  add sliding precision interval
  
  add escape key or reset button on settings to reset
  
  use screenspace texture instead of perfectly positioned 3d space texture
  proper webgl canvas resizing
  
  add multithreaded cpu mode
  
  bug when zooming after changing page zoom; zoom is relative to point outside screen (zooming in) or much closer to center (zooming out)
  bug on move and zoom; one frame delay on move and zoom before motion occurs, especially noticeable when render takes 1/5 second
  bug when switching between 2d and webgl canvases; deleting and recreating canvas, and opengl stuff, causes memory leak
  
  extended todo:
    histogram coloring
    calculate average image divergence ratio
    add sliding iteration count interval
*/
