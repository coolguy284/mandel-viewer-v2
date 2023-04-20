window.addEventListener('load', () => {
  if (AUTOHIDE_STARTING_PROMPT) {
    closeStartingPopup();
  }
  
  setupRemarketing();
  
  resizeCanvas();
  render();
  
  showSettings();
  showRemarketing();
});

let webGLResizeTimeout;

window.addEventListener('resize', () => {
  if (ctxType.startsWith('webgl')) {
    if (webGLResizeTimeout) {
      clearTimeout(webGLResizeTimeout);
    }
    
    webGLResizeTimeout = setTimeout(() => {
      resizeCanvas();
      render();
      webGLResizeTimeout = null;
    }, WEBGL_CANVAS_RESIZE_WAIT);
  } else {
    resizeCanvas();
    render();
  }
});

window.addEventListener('mousedown', e => {
  if (movementUnlocked && startingPopupClosed) {
    touchPoints.mouse = { x: e.x, y: e.y };
    
    touchEvents.down();
  }
});

window.addEventListener('mouseup', e => {
  if (movementUnlocked && startingPopupClosed || mouseDown) {
    delete touchPoints.mouse;
    
    touchEvents.up();
  }
});

window.addEventListener('mousemove', e => {
  if (touchPoints.mouse) {
    touchPoints.mouse.x = e.x;
    touchPoints.mouse.y = e.y;
    
    touchEvents.move();
  } else {
    events.mouseMove(e.x, e.y);
  }
});

window.addEventListener('wheel', e => {
  if (movementUnlocked && startingPopupClosed) {
    if (pMouseX != e.x || pMouseY != e.y) {
      events.mouseMove(e.x, e.y);
    }
    
    events.wheel(e.wheelDelta);
    
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('keydown', e => {
  if (e.code == 'Escape') {
    // escape key pressed
    
    events.escapeKey();
  } else if (remarketingInputSequenceSet.has(e.code)) {
    if (movementUnlocked) {
      if (e.code == REMARKETING_INPUT_SEQUENCE[remarketingInputCurrentIndex]) {
        remarketingInputCurrentIndex++;
        
        if (remarketingInputCurrentIndex >= REMARKETING_INPUT_SEQUENCE.length) {
          remarketingInputCurrentIndex = 0;
          
          if (konami_progress.style.display == '') {
            konami_progress.style.display = 'none';
            konami_progress.innerHTML = '';
          }
          
          revealRemarketing();
        } else {
          if (konami_progress.style.display == 'none') {
            konami_progress.style.display = '';
          }
          
          konami_progress.innerHTML = `${remarketingInputCurrentIndex}/${REMARKETING_INPUT_SEQUENCE.length}`;
        }
      } else {
        if (remarketingInputCurrentIndex) {
          remarketingInputCurrentIndex = 0;
        }
        
        if (konami_progress.style.display == '') {
          konami_progress.style.display = 'none';
          konami_progress.innerHTML = '';
        }
      }
    }
  } else {
    if (remarketingInputCurrentIndex) {
      remarketingInputCurrentIndex = 0;
    }
    
    if (konami_progress.style.display == '') {
      konami_progress.style.display = 'none';
      konami_progress.innerHTML = '';
    }
  }
});

window.addEventListener('touchstart', e => {
  if (movementUnlocked && startingPopupClosed) {
    for (let touch of e.changedTouches) {
      touchPoints[touch.identifier] = { x: touch.pageX, y: touch.pageY };
    }
    
    touchEvents.down();
    
    e.preventDefault();
  }
});

window.addEventListener('touchmove', e => {
  if (movementUnlocked && startingPopupClosed) {
    for (let touch of e.changedTouches) {
      touchPoints[touch.identifier].px = touchPoints[touch.identifier].x;
      touchPoints[touch.identifier].py = touchPoints[touch.identifier].y;
      touchPoints[touch.identifier].x = touch.pageX;
      touchPoints[touch.identifier].y = touch.pageY;
    }
    
    touchEvents.move();
    
    e.preventDefault();
  }
}, { passive: false });

let touchEndHandler = e => {
  if (movementUnlocked && startingPopupClosed || Object.keys(touchPoints).length > 0) {
    for (let touch of e.changedTouches) {
      delete touchPoints[touch.identifier];
    }
    
    touchEvents.up();
    
    e.preventDefault();
  }
};

window.addEventListener('touchend', touchEndHandler);

window.addEventListener('touchcancel', touchEndHandler);
