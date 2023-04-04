// randomly rounds up or down, biased toward the side the number is closer to
function randomRound(val, i) {
  if (Number.isInteger(val)) {
    return val;
  }
  
  let bottom = Math.floor(val);
  let top = Math.ceil(val);
  let fraction = val - bottom;
  
  if (hash(i) > fraction) {
    return bottom;
  } else {
    return top;
  }
}

// https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
// A single iteration of Bob Jenkins' One-At-A-Time hashing algorithm.
function hash(x) {
  x = x + (x << 10) << 0;
  x ^= x >> 6;
  x = x + (x << 3) << 0;
  x ^= x >> 11;
  x = x + (x << 15) << 0;
  return (x & 0xffff) / 0x10000;
}

function getRainbowIntIterColor(iters) {
  //return [float(iters) / float(MAX_ITERS) * 5.0, 0, 0];
  
  if (iters < 0 || iters >= MAX_ITERS) return [0, 0, 0];
  
  let itersMod = (-(iters - 1) % 24 + 24) % 24;  // minus sign at front because backwards rainbow looks better
  
  switch (itersMod) {
    case 0: return [1, 0, 0];
    case 1: return [1, 0.25, 0];
    case 2: return [1, 0.5, 0];
    case 3: return [1, 0.75, 0];
    case 4: return [1, 1, 0];
    case 5: return [0.75, 1, 0];
    case 6: return [0.5, 1, 0];
    case 7: return [0.25, 1, 0];
    case 8: return [0, 1, 0];
    case 9: return [0, 1, 0.25];
    case 10: return [0, 1, 0.5];
    case 11: return [0, 1, 0.75];
    case 12: return [0, 1, 1];
    case 13: return [0, 0.75, 1];
    case 14: return [0, 0.5, 1];
    case 15: return [0, 0.25, 1];
    case 16: return [0, 0, 1];
    case 17: return [0.25, 0, 1];
    case 18: return [0.5, 0, 1];
    case 19: return [0.75, 0, 1];
    case 20: return [1, 0, 1];
    case 21: return [1, 0, 0.75];
    case 22: return [1, 0, 0.5];
    case 23: return [1, 0, 0.25];
    default: return [0, 0, 0]; // should be impossible branch but here to remove the warning
  }
}

function getRainbowIterColor(iters) {
  if (Number.isInteger(iters)) {
    return getRainbowIntIterColor(iters);
  }
  
  let itersFloor = Math.floor(iters);
  let itersCeil = Math.ceil(iters);
  let itersFrac = iters - itersFloor;
  
  let itersFloorColor = getRainbowIntIterColor(itersFloor);
  let itersCeilColor = getRainbowIntIterColor(itersCeil);
  
  return [
    itersFloorColor[0] + (itersCeilColor[0] - itersFloorColor[0]) * itersFrac,
    itersFloorColor[1] + (itersCeilColor[1] - itersFloorColor[1]) * itersFrac,
    itersFloorColor[2] + (itersCeilColor[2] - itersFloorColor[2]) * itersFrac,
  ];
}

// https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set
function getMandelIterct(cx, cy) {
  let qt1 = cx - 0.25;
  let q = qt1 * qt1 + cy * cy;
  if (q * (q + (cx - 0.25)) < 0.25 * cy * cy) {
    return MAX_ITERS;
  }
  
  let t1 = cx + 1.0;
  if (t1 * t1 + cy * cy < (1.0 / 16.0)) {
    return MAX_ITERS;
  }
  
  let zx = 0.0;
  let zy = 0.0;
  let zx2 = 0.0;
  let zy2 = 0.0;
  
  let iterCount = 0;
  
  while (zx2 + zy2 < ESCAPE_RADIUS && iterCount < MAX_ITERS) {
    zy = (zx + zx) * zy + cy;
    zx = zx2 - zy2 + cx;
    zx2 = zx * zx;
    zy2 = zy * zy;
    
    iterCount++;
  }
  
  if (SMOOTH_ITERS && iterCount < MAX_ITERS) {
    let log_zn = Math.log(zx2 + zy2) / 2.0;
    let nu = Math.log(log_zn / Math.log(2.0)) / Math.log(2.0);
    
    iterCount = iterCount + 1 - nu;
  }
  
  return iterCount;
}

function fillMandelPixelArray(x, y, scale, width, height, pixelData) {
  for (var i = 0; i < width * height * 4; i += 4) {
    let px = Math.floor(i / 4) % width,
      py = Math.floor(i / width / 4);
    let normPx = (px - width / 2) / height, // normalized to -0.5 - 0.5, NOT -1 - 1
      normPy = -(py - height / 2) / height; // normalized to -0.5 - 0.5, NOT -1 - 1
    
    let cx, cy;
    
    switch (LOG_RENDER) {
      case 0:
        cx = normPx * scale + x;
        cy = normPy * scale + y;
        break;
      
      case 1: {
        let dist = Math.hypot(normPx, normPy),
          ang = Math.atan2(normPy, normPx);
        
        cx = Math.cos(ang) * (2 ** (dist * (-Math.log2(scale) + 4)) - 1) * scale + x;
        cy = Math.sin(ang) * (2 ** (dist * (-Math.log2(scale) + 4)) - 1) * scale + y;
        } break;
      
      case 2: {
        let dist = Math.hypot(normPx, normPy) * 2,
          ang = Math.atan2(normPy, normPx);
        
        cx = Math.cos(ang) * (2 ** (dist * (-Math.log2(Math.min(scale, 1)) + 1.7)) - 1) * scale + x;
        cy = Math.sin(ang) * (2 ** (dist * (-Math.log2(Math.min(scale, 1)) + 1.7)) - 1) * scale + y;
        } break;
    }
    
    let iters = getMandelIterct(cx, cy);
    
    if (PALLETE >= 0 && PALLETE <= 2) {
      let processedColorVal;
      
      if (iters < MAX_ITERS) {
        let colorVal = Math.min(-Math.cos((iters * 6 / 256) * Math.PI * 2) * 88 + 148, 256);
        
        if (DO_ARTIFICIAL_BANDING) {
          if (RANDOM_COLOR_FUZZING) {
            processedColorVal = randomRound(colorVal / ARTIFICIAL_BANDING_FACTOR, i) * ARTIFICIAL_BANDING_FACTOR;
          } else {
            processedColorVal = Math.round(colorVal / ARTIFICIAL_BANDING_FACTOR) * ARTIFICIAL_BANDING_FACTOR;
          }
        } else {
          if (RANDOM_COLOR_FUZZING) {
            processedColorVal = randomRound(colorVal, i);
          } else {
            processedColorVal = colorVal; // special code path for more efficient rendering
          }
        }
      } else {
        processedColorVal = 0;
      }
      
      switch (PALLETE) {
        case 0: pixelData.data[i + 2] = processedColorVal; break;
        case 1: pixelData.data[i + 1] = processedColorVal; break;
        case 2: pixelData.data[i] = processedColorVal; break;
      }
    } else if (PALLETE == 3) {
      let color = getRainbowIterColor(iters);
      
      if (DO_ARTIFICIAL_BANDING) {
        if (RANDOM_COLOR_FUZZING) {
          pixelData.data[i] = randomRound(color[0] * 256 / ARTIFICIAL_BANDING_FACTOR, i) * ARTIFICIAL_BANDING_FACTOR;
          pixelData.data[i + 1] = randomRound(color[1] * 256 / ARTIFICIAL_BANDING_FACTOR, i) * ARTIFICIAL_BANDING_FACTOR;
          pixelData.data[i + 2] = randomRound(color[2] * 256 / ARTIFICIAL_BANDING_FACTOR, i) * ARTIFICIAL_BANDING_FACTOR;
        } else {
          pixelData.data[i] = Math.round(color[0] * 256 / ARTIFICIAL_BANDING_FACTOR) * ARTIFICIAL_BANDING_FACTOR;
          pixelData.data[i + 1] = Math.round(color[1] * 256 / ARTIFICIAL_BANDING_FACTOR) * ARTIFICIAL_BANDING_FACTOR;
          pixelData.data[i + 2] = Math.round(color[2] * 256 / ARTIFICIAL_BANDING_FACTOR) * ARTIFICIAL_BANDING_FACTOR;
        }
      } else {
        if (RANDOM_COLOR_FUZZING) {
          pixelData.data[i] = randomRound(color[0] * 256, i);
          pixelData.data[i + 1] = randomRound(color[1] * 256, i);
          pixelData.data[i + 2] = randomRound(color[2] * 256, i);
        } else {
          // special code path for more efficient rendering
          pixelData.data[i] = color[0] * 256;
          pixelData.data[i + 1] = color[1] * 256;
          pixelData.data[i + 2] = color[2] * 256;
        }
      }
    }
    
    pixelData.data[i + 3] = 255;
  }
}
