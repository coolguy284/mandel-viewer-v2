window.addEventListener('load', () => {
  resizeCanvas();
  render();
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
  //debug_log.innerHTML+='<br>mousestart ' + JSON.stringify(touchPoints);
  if (!SHOW_SETTINGS) {
    touchPoints.mouse = { x: e.x, y: e.y };
    
    touchEvents.down();
  }
  //debug_log.innerHTML+='<br>mousestart2 ' + JSON.stringify(touchPoints);
});

window.addEventListener('mouseup', e => {
  //debug_log.innerHTML+='<br>mouseend ' + JSON.stringify(touchPoints);
  if (!SHOW_SETTINGS || mouseDown) {
    delete touchPoints.mouse;
    
    touchEvents.up();
  }
  //debug_log.innerHTML+='<br>mouseend2 ' + JSON.stringify(touchPoints);
});

window.addEventListener('mousemove', e => {
  if (!SHOW_SETTINGS) {
    if (touchPoints.mouse) {
      touchPoints.mouse.x = e.x;
      touchPoints.mouse.y = e.y;
      
      touchEvents.move();
    } else {
      events.mouseMove(e.x, e.y);
    }
  }
});

window.addEventListener('wheel', e => {
  if (!SHOW_SETTINGS) {
    events.wheel(e.wheelDelta);
    
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('keydown', e => {
  if (!SHOW_SETTINGS && e.keyCode == 27) {
    // escape key pressed
    
    events.escapeKey();
  }
});

window.addEventListener('touchstart', e => {
  //debug_log.innerHTML+='<br>touchstart ' + JSON.stringify(touchPoints);
  if (!SHOW_SETTINGS) {
    for (let touch of e.changedTouches) {
      touchPoints[touch.identifier] = { x: touch.pageX, y: touch.pageY };
    }
    //debug_log.innerHTML+='<br>touchstart2 ' + JSON.stringify(touchPoints);
    
    touchEvents.down();
    
    e.preventDefault();
  }
});

window.addEventListener('touchmove', e => {
  if (!SHOW_SETTINGS) {
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
  //debug_log.innerHTML+='<br>touchend ' + JSON.stringify(touchPoints);
  if (!SHOW_SETTINGS || Object.keys(touchPoints).length > 0) {
    for (let touch of e.changedTouches) {
      delete touchPoints[touch.identifier];
    }
    //debug_log.innerHTML+='<br>touchend2 ' + JSON.stringify(touchPoints);
    
    touchEvents.up();
    
    e.preventDefault();
  }
};

window.addEventListener('touchend', touchEndHandler);

window.addEventListener('touchcancel', touchEndHandler);