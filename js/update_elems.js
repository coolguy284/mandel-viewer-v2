function resizeCanvas() {
  if (ctxType?.startsWith('webgl')) {
    resetCanvas();
  }
  
  let style = getComputedStyle(canvas);
  
  realCanvasWidth = parseInt(style.width);
  realCanvasHeight = parseInt(style.height);
  
  canvas.width = Math.floor(realCanvasWidth * SUBPIXEL_SCALE);
  canvas.height = Math.floor(realCanvasHeight * SUBPIXEL_SCALE);
}
