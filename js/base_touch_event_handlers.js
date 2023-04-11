let touchPoints = {};

let touchEvents = {
  down: () => {
    let entries = Object.entries(touchPoints);
    
    if (entries.length == 0) return;
    
    if (entries.length == 1) {
      events.mouseDown(entries[0][1].x, entries[0][1].y);
    } else {
      let posSum = entries.reduce((a, c) => [a[0] + c[1].x, a[1] + c[1].y], [0, 0]);
      
      let posAvg = [posSum[0] / entries.length, posSum[1] / entries.length];
      
      pMouseX = posAvg[0];
      pMouseY = posAvg[1];
    }
  },
  
  up: () => {
    let entries = Object.entries(touchPoints);
    
    if (entries.length == 0) {
      events.mouseUp();
    } else {
      let posSum = entries.reduce((a, c) => [a[0] + c[1].x, a[1] + c[1].y], [0, 0]);
      
      let posAvg = [posSum[0] / entries.length, posSum[1] / entries.length];
      
      pMouseX = posAvg[0];
      pMouseY = posAvg[1];
    }
  },
  
  move: () => {
    let entries = Object.entries(touchPoints);
    
    if (entries.length == 0) return;
    
    if (entries.length == 1) {
      events.mouseMove(entries[0][1].x, entries[0][1].y);
    } else if (entries.length == 2) {
      let posSum = entries.reduce((a, c) => [a[0] + c[1].x, a[1] + c[1].y], [0, 0]);
      
      let posAvg = [posSum[0] / entries.length, posSum[1] / entries.length];
      
      events.mouseMove(...posAvg);
      
      let dist = Math.hypot(
        entries[1][1].x - entries[0][1].x,
        entries[1][1].y - entries[0][1].y
      );
      
      let pDist = Math.hypot(
        (entries[1][1].px ?? entries[1][1].x) - (entries[0][1].px ?? entries[0][1].x),
        (entries[1][1].py ?? entries[1][1].y) - (entries[0][1].py ?? entries[0][1].y)
      );
      
      let wheelDelta = -Math.log(dist / pDist) / logZoomScaleFactor;
      
      events.wheel(wheelDelta);
    } else {
      let posSum = entries.reduce((a, c) => [a[0] + c[1].x, a[1] + c[1].y], [0, 0]);
      
      let posAvg = [posSum[0] / entries.length, posSum[1] / entries.length];
      
      events.mouseMove(...posAvg);
    }
  },
};
