let events = {
  mouseDown: (x, y) => {//debug_log.innerHTML+='<br>mousedown ' + ' ' + JSON.stringify(touchPoints);
    let currentTime = performance.now();
    
    mouseDown = true;
    
    pMouseX = x;
    pMouseY = y;//debug_log.innerHTML+='<br>mousedown2 ' + ' ' + JSON.stringify(touchPoints);
  },
  
  mouseUp: () => {//debug_log.innerHTML+='<br>mouseup ' + ' ' + JSON.stringify(touchPoints);
    timeUnclicked = performance.now();
    
    if (INERTIA) {
      let minValidTime = timeUnclicked - PREV_MOUSE_BUFFER_TIMESPAN;
      
      let mouseDragSum = previousMouseDrags.filter(x => x[2] > minValidTime).reduce((a, c) => [a[0] + c[0], a[1] + c[1]], [0, 0]);
      let mouseDrag = previousMouseDrags.length ? [mouseDragSum[0] / previousMouseDrags.length, mouseDragSum[1] / previousMouseDrags.length] : [0, 0];
      
      velX = mouseDrag[0];
      velY = mouseDrag[1];
      
      previousMouseDrags.splice(0, Infinity);
    }
    
    mouseDown = false;//debug_log.innerHTML+='<br>mouseup2 ' + ' ' + JSON.stringify(touchPoints);
  },
  
  mouseMove: (x, y) => {
    if (INERTIA) {
      if (mouseDown) {
        velX = x - pMouseX;
        velY = -y + pMouseY;
        
        velMag = Math.hypot(velX, velY);
        
        X -= velX / realCanvasHeight * SCALE;
        Y -= velY / realCanvasHeight * SCALE;
      }
      
      pMouseX = x;
      pMouseY = y;
      
      previousMouseDrags.push([velX, velY, performance.now()]);
      if (previousMouseDrags.length > PREV_MOUSE_BUFFER_LENGTH) {
        previousMouseDrags.splice(0, 1);
      }
      
      if (mouseDown) {
        movementLoop();
      }
    } else {
      if (mouseDown) {
        let deltaX = x - pMouseX, deltaY = -y + pMouseY;
        
        X -= deltaX / realCanvasHeight * SCALE;
        Y -= deltaY / realCanvasHeight * SCALE;
        
        render();
      }
      
      pMouseX = x;
      pMouseY = y;
    }
  },
  
  wheel: (wheelDelta) => {
    if (INERTIA) {
      let scaleFactor = ZOOM_SCALE_FACTOR ** wheelDelta;
      
      targetScale *= scaleFactor;
      targetScalePMouseX = pMouseX;
      targetScalePMouseY = pMouseY;
      
      if (!mouseDown) {
        velX = 0;
        velY = 0;
      }
      
      movementLoop();
    } else {
      let scaleFactor = ZOOM_SCALE_FACTOR ** wheelDelta;
      
      let cxCursor = X + (pMouseX - realCanvasWidth / 2) / realCanvasHeight * SCALE;
      let cyCursor = Y + -(pMouseY - realCanvasHeight / 2) / realCanvasHeight * SCALE;
      
      let cxDiff = cxCursor - X;
      let cyDiff = cyCursor - Y;
      
      let cxScaleDiff = cxDiff - cxDiff * scaleFactor;
      let cyScaleDiff = cyDiff - cyDiff * scaleFactor;
      
      X += cxScaleDiff;
      Y += cyScaleDiff;
      
      SCALE *= scaleFactor;
      
      render();
    }
  },
  
  escapeKey: () => {
    if (!startingPopupClosed) {
      closeStartingPopup();
    } else if (SHOW_SETTINGS) {
      closeSettings();
    } else {
      if (INERTIA) {
        velX = 0;
        velY = 0;
        X = 0;
        Y = 0;
        SCALE = 4;
        targetScale = 4;
      } else {
        X = 0;
        Y = 0;
        SCALE = 4;
      }
      
      render();
    }
  },
};
