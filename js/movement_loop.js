let movementLoopRunning = false;

function movementLoop(timestamp) {
  if (movementLoopRunning && !timestamp) return;
  
  movementLoopRunning = true;
  
  let processMovement = Math.abs(velX) >= INERTIA_MOVE_THRESHOLD ||
    Math.abs(velY) >= INERTIA_MOVE_THRESHOLD;
  let processZoom = Math.abs(Math.log(targetScale / SCALE)) >= INERTIA_ZOOM_THRESHOLD;
  
  let lastFrameTime;
  if (pTimestamp) {
    lastFrameTime = (timestamp - pTimestamp) / 1000;
  }
  
  // movement processing
  
  if (processMovement) {
    if (!mouseDown) {
      X -= velX / realCanvasHeight * SCALE;
      Y -= velY / realCanvasHeight * SCALE;
    
      if (pTimestamp) {
        let newVelMag;
        let timeSinceUnclicked =  (timestamp - timeUnclicked) / 1000;
        if (timeSinceUnclicked > INERTIA_FASTSLOWDOWN_TIME_THRESHOLD && velMag > INERTIA_FASTSLOWDOWN_VEL_THRESHOLD) {
          // bigger for fast speeds
          newVelMag = Math.max((velMag - INERTIA_SLOWDOWN * lastFrameTime) * INERTIA_SLOWDOWN_FACTOR ** lastFrameTime, 0);
        } else {
          // linear for slow speeds
          newVelMag = Math.max(velMag - INERTIA_SLOWDOWN * lastFrameTime, 0);
        }
        
        let slowdownFactor = velMag != 0 ? newVelMag / velMag : 0;
        
        velX *= slowdownFactor;
        velY *= slowdownFactor;
        
        velMag = newVelMag;
      }
    }
  }
  
  // zoom processing
  
  if (processZoom && pTimestamp) {
    let scaleFactor = Math.E ** (Math.log(targetScale / SCALE) * Math.min(INERTIA_ZOOM_FACTOR * lastFrameTime, 1));
    
    let cxCursor = X + (targetScalePMouseX - realCanvasWidth / 2) / realCanvasHeight * SCALE;
    let cyCursor = Y + -(targetScalePMouseY - realCanvasHeight / 2) / realCanvasHeight * SCALE;
    
    let cxDiff = cxCursor - X;
    let cyDiff = cyCursor - Y;
    
    let cxScaleDiff = cxDiff - cxDiff * scaleFactor;
    let cyScaleDiff = cyDiff - cyDiff * scaleFactor;
    
    X += cxScaleDiff;
    Y += cyScaleDiff;
    
    SCALE *= scaleFactor;
  }
  
  // render
  
  render();
  
  if (Math.abs(velX) < INERTIA_MOVE_THRESHOLD &&
      Math.abs(velY) < INERTIA_MOVE_THRESHOLD &&
      Math.abs(Math.log(targetScale / SCALE)) < INERTIA_ZOOM_THRESHOLD) {
    movementLoopRunning = false;
    pTimestamp = null;
  } else {
    pTimestamp = timestamp;
    requestAnimationFrame(movementLoop);
  }
}
