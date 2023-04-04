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
  
  localstorage support
  proper webgl canvas resizing
  
  bug when zooming after changing page zoom; zoom is relative to point outside screen (zooming in) or much closer to center (zooming out)
  bug on move and zoom; one frame delay on move and zoom before motion occurs, especially noticeable when render takes 1/5 second
  bug when switching between 2d and webgl canvases; deleting and recreating canvas, and opengl stuff, causes memory leak
*/

let X = 0, Y = 0, SCALE = 4; // coordinates for mandelbrot set
/*
  interesting places:
  X = -0.10109636384562178, Y = 0.9562865108091415, SCALE = 9.603811037451508e-15; LOG_ZOOM = 2; top spiral
*/

let PALLETE = 0; // 0 - blue, 1 - green, 2 - red, 3 - rainbow
let LOG_RENDER = 0; // convert distance from center of screen to an exponential coordinate, allows most of mandelbrot zoom to be viewed at once; 0 - no log render, 1 - 50% of mandelbrot set zoom is visible, 2 - full mandelbrot set is always visible, albeit distorted
let SMOOTH_ITERS = true; // calculate fractional iteration count and color smoothly

let RENDER_METHOD = 4; // 0 - fillRect canvas test, 1 - js calculations and manual pixel setting, 2 - webgl test, 3 - webgl shader test, 4 - webgl shader
let MAX_ITERS = 1024; // depth of mandelbrot calculation
let ESCAPE_RADIUS = 256.0; // distance beyond which a point is considered escaped from the mandelbrot set
let INERTIA = true; // smooth movement and scroll
let SHOW_COORDINATES = false; // whether coordinates are shown in bottom right hand corner
let SHOW_SETTINGS = false; // whether settings menu is shown

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
