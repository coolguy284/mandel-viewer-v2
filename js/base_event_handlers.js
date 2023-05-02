function cancelRemarketing() {
  if (remarketingInputCurrentIndex) {
    remarketingInputCurrentIndex = 0;
  }
  
  if (konami_progress.style.display == '') {
    konami_progress.style.display = 'none';
    konami_progress.innerHTML = '';
  }
}

function cancelRemarketingTimeout() {
  if (remarketingInputTimeout) {
    clearTimeout(remarketingInputTimeout);
    
    remarketingInputTimeout = null;
  }
}

function cancelRemarketingAndTimeout() {
  cancelRemarketingTimeout();
  
  cancelRemarketing();
}

let events = {
  mouseDown: (x, y) => {
    mouseDown = true;
    
    pMouseX = x;
    pMouseY = y;
  },
  
  mouseUp: () => {
    timeUnclicked = performance.now();
    
    if (INERTIA) {
      let minValidTime = timeUnclicked - PREV_MOUSE_BUFFER_TIMESPAN;
      
      let mouseDragSum = previousMouseDrags.filter(x => x[2] > minValidTime).reduce((a, c) => [a[0] + c[0], a[1] + c[1]], [0, 0]);
      let mouseDrag = previousMouseDrags.length ? [mouseDragSum[0] / previousMouseDrags.length, mouseDragSum[1] / previousMouseDrags.length] : [0, 0];
      
      velX = mouseDrag[0];
      velY = mouseDrag[1];
      
      previousMouseDrags.splice(0, Infinity);
    }
    
    mouseDown = false;
  },
  
  mouseMove: (x, y) => {
    if (INERTIA) {
      if (mouseDown) {
        velX = x - pMouseX;
        velY = -y + pMouseY;
        
        velMag = Math.hypot(velX, velY);
        
        if (typeof X == 'object') {
          // math.js coordinates
          X = math.subtract(X, math.multiply(math.bignumber(velX / realCanvasHeight), SCALE));
          Y = math.subtract(Y, math.multiply(math.bignumber(velY / realCanvasHeight), SCALE));
        } else {
          // regular coordinates
          X -= velX / realCanvasHeight * SCALE;
          Y -= velY / realCanvasHeight * SCALE;
        }
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
        
        if (typeof X == 'object') {
          // math.js coordinates
          X = math.subtract(X, math.multiply(math.bignumber(deltaX / realCanvasHeight), SCALE));
          Y = math.subtract(Y, math.multiply(math.bignumber(deltaY / realCanvasHeight), SCALE));
        } else {
          // regular coordinates
          X -= deltaX / realCanvasHeight * SCALE;
          Y -= deltaY / realCanvasHeight * SCALE;
        }
        
        render();
      }
      
      pMouseX = x;
      pMouseY = y;
    }
  },
  
  wheel: (wheelDelta) => {
    if (INERTIA) {
      if (typeof X == 'object') {
        // math.js coordinates
        let scaleFactor = math.bignumber(ZOOM_SCALE_FACTOR ** wheelDelta);
        
        targetScale = math.multiply(targetScale, scaleFactor);
      } else {
        // regular coordinates
        let scaleFactor = ZOOM_SCALE_FACTOR ** wheelDelta;
        
        targetScale *= scaleFactor;
      }
      targetScalePMouseX = pMouseX;
      targetScalePMouseY = pMouseY;
      
      if (!mouseDown) {
        velX = 0;
        velY = 0;
      }
      
      movementLoop();
    } else {
      if (typeof X == 'object') {
        // math.js coordinates
        let scaleFactor = math.bignumber(ZOOM_SCALE_FACTOR ** wheelDelta);
        
        let cxCursor = math.add(X, math.multiply(math.divide(math.subtract(pMouseX, math.bignumber(realCanvasWidth / 2)), realCanvasHeight), SCALE));
        let cyCursor = math.add(Y, math.multiply(math.divide(math.unaryMinus(math.subtract(pMouseY, math.bignumber(realCanvasHeight / 2))), realCanvasHeight), SCALE));
        
        let cxDiff = math.subtract(cxCursor, X);
        let cyDiff = math.subtract(cyCursor, Y);
        
        let cxScaleDiff = math.subtract(cxDiff, math.multiply(cxDiff, scaleFactor));
        let cyScaleDiff = math.subtract(cyDiff, math.multiply(cyDiff, scaleFactor));
        
        X = math.add(X, cxScaleDiff);
        Y = math.add(Y, cyScaleDiff);
        
        SCALE = math.multiply(SCALE, scaleFactor);
      } else {
        // regular coordinates
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
      }
      
      render();
    }
  },
  
  escapeKey: () => {
    if (!startingPopupClosed) {
      closeStartingPopup();
    } else if (SHOW_SETTINGS) {
      closeSettings();
    } else if (SHOW_REMARKETING) {
      if (remarketing_popup_phase_2.style.display == '') {
        setRemarketingPhase(0);
      } else {
        closeRemarketing();
      }
    } else if (CRASHED) {
      if (crashEscapeTimeout) {
        clearTimeout(crashEscapeTimeout);
        crashEscapeTimeout = null;
      }
      
      crashEscapeVal++;
      
      if (crashEscapeVal >= CRASH_KEYS_ESCAPE_THRESHOLD) {
        crashEscapeVal = 0;
        stopCrash();
        escapeKeyEnabled = false;
        if (escapeKeyLockoutTimeout) {
          escapeKeyLockoutTimeout = null;
        }
        escapeKeyLockoutTimeout = setTimeout(() => {
          escapeKeyEnabled = true;
          escapeKeyLockoutTimeout = null;
        }, CRASH_KEYS_ESCAPE_LOCKOUT);
      } else {
        crashEscapeTimeout = setTimeout(() => {
          crashEscapeVal = 0;
          crashEscapeTimeout = null;
        }, CRASH_KEYS_ESCAPE_TIMEOUT);
      }
    } else if (escapeKeyEnabled) {
      if (INERTIA) {
        velX = 0;
        velY = 0;
        if (typeof X == 'object') {
          // math.js coordinates
          X = math.bignumber('0');
          Y = math.bignumber('0');
          SCALE = math.bignumber('4');
          targetScale = math.bignumber('4');
        } else {
          // regular coordinates
          X = 0;
          Y = 0;
          SCALE = 4;
          targetScale = 4;
        }
      } else {
        if (typeof X == 'object') {
          // math.js coordinates
          X = math.bignumber('0');
          Y = math.bignumber('0');
          SCALE = math.bignumber('4');
        } else {
          // regular coordinates
          X = 0;
          Y = 0;
          SCALE = 4;
        }
      }
      
      render();
    }
  },
  
  remarketing: (evtCode) => {
    if (movementUnlocked) {
      if (evtCode == REMARKETING_INPUT_SEQUENCE[remarketingInputCurrentIndex]) {
        remarketingInputCurrentIndex++;
        
        if (remarketingInputCurrentIndex >= REMARKETING_INPUT_SEQUENCE.length) {
          remarketingInputCurrentIndex = 0;
          
          if (konami_progress.style.display == '') {
            konami_progress.style.display = 'none';
            konami_progress.innerHTML = '';
          }
          
          cancelRemarketingTimeout();
          
          revealRemarketing();
        } else {
          if (konami_progress.style.display == 'none') {
            konami_progress.style.display = '';
          }
          
          konami_progress.innerHTML = `${remarketingInputCurrentIndex}/${REMARKETING_INPUT_SEQUENCE.length}`;
          
          cancelRemarketingTimeout();
          
          remarketingInputTimeout = setTimeout(() => {
            cancelRemarketing();
          }, REMARKETING_INPUT_SEQUENCE_TIMEOUT);
        }
      } else {
        cancelRemarketingAndTimeout();
      }
    }
  },
  
  remarketing_fail: () => {
    cancelRemarketingAndTimeout();
  },
  
  crashCheck: (evtCode) => {
    if (movementUnlocked) {
      crashKeys.push(evtCode);
      crashVal = new Set(crashKeys).size;
      
      if (crashVal >= CRASH_KEYS_THRESHOLD) {
        // mandelbrot set has crashed. please see the manual to continue. (crash again to reset)
        crashKeys.splice(0, Infinity);
        crashVal = 0;
        toggleCrashed();
      } else {
        crashLoop();
      }
    }
  },
};
