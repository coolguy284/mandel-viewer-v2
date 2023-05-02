let movementLoopRunning = false;

function movementLoop(timestamp) {
  if (movementLoopRunning && !timestamp) return;
  
  movementLoopRunning = true;
  
  let processMovement, processZoom;
  if (typeof X == 'object') {
    // math.js coordinates
    processMovement = math.largerEq(math.abs(velX), INERTIA_MOVE_THRESHOLD) ||
      math.largerEq(math.abs(velY), INERTIA_MOVE_THRESHOLD);
    processZoom = math.largerEq(math.abs(math.log(targetScale / SCALE)), INERTIA_ZOOM_THRESHOLD);
  } else {
    // regular coordinates
    processMovement = Math.abs(velX) >= INERTIA_MOVE_THRESHOLD ||
      Math.abs(velY) >= INERTIA_MOVE_THRESHOLD;
    processZoom = Math.abs(Math.log(targetScale / SCALE)) >= INERTIA_ZOOM_THRESHOLD;
  }
  
  let lastFrameTime;
  if (pTimestamp) {
    lastFrameTime = (timestamp - pTimestamp) / 1000;
  }
  
  // movement processing
  
  if (processMovement) {
    if (!mouseDown) {
      if (typeof X == 'object') {
        // math.js coordinates
        X = math.subtract(X, math.multiply(math.bignumber(velX / realCanvasHeight), SCALE));
        Y = math.subtract(Y, math.multiply(math.bignumber(velY / realCanvasHeight), SCALE));
      } else {
        // regular coordinates
        X -= velX / realCanvasHeight * SCALE;
        Y -= velY / realCanvasHeight * SCALE;
      }
      
      if (pTimestamp) {
        let newVelMag;
        let timeSinceUnclicked = (timestamp - timeUnclicked) / 1000;
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
  
  if (typeof X == 'object') {
    // math.js coordinates
    if (processZoom && pTimestamp) {
      let scaleFactor = math.exp(math.multiply(math.log(math.divide(targetScale, SCALE)), math.bignumber(Math.min(INERTIA_ZOOM_FACTOR * lastFrameTime, 1))));
      
      let cxCursor = math.add(X, math.multiply(math.bignumber((targetScalePMouseX - realCanvasWidth / 2) / realCanvasHeight), SCALE));
      let cyCursor = math.add(Y, math.multiply(math.bignumber(-(targetScalePMouseY - realCanvasHeight / 2) / realCanvasHeight), SCALE));
      
      let cxDiff = math.subtract(cxCursor, X);
      let cyDiff = math.subtract(cyCursor, Y);
      
      let cxScaleDiff = math.subtract(cxDiff, math.multiply(cxDiff, scaleFactor));
      let cyScaleDiff = math.subtract(cyDiff, math.multiply(cyDiff, scaleFactor));
      
      X = math.add(X, cxScaleDiff);
      Y = math.add(Y, cyScaleDiff);
      
      SCALE = math.multiply(SCALE, scaleFactor);
    }
  } else {
    // regular coordinates
    if (processZoom && pTimestamp) {
      let scaleFactor = Math.exp(Math.log(targetScale / SCALE) * Math.min(INERTIA_ZOOM_FACTOR * lastFrameTime, 1));
      
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
  }
  
  // render
  
  render();
  
  // call next iteration of loop
  
  if (typeof X == 'object') {
    if (Math.abs(velX) < INERTIA_MOVE_THRESHOLD &&
        Math.abs(velY) < INERTIA_MOVE_THRESHOLD &&
        math.smaller(math.abs(math.log(math.divide(targetScale, SCALE))), INERTIA_ZOOM_THRESHOLD)) {
      movementLoopRunning = false;
      pTimestamp = null;
    } else {
      pTimestamp = timestamp;
      requestAnimationFrame(movementLoop);
    }
  } else {
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
}

let crashLoopRunning = false;

async function crashLoop() {
  if (crashLoopRunning) return;
  
  crashLoopRunning = true;
  
  await new Promise(r => setTimeout(r, CRASH_KEYS_DROP_DELAY));
  
  while (crashKeys.length > 0) {
    crashKeys.splice(0, 1);
    crashVal = new Set(crashKeys).size;console.log(crashKeys, crashVal);
    await new Promise(r => setTimeout(r, CRASH_KEYS_DROP_DELAY));
  }
  
  crashLoopRunning = false;
}
