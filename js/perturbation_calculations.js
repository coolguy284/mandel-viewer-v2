// only takes input in the form of bignumbers
function MathJSGetMandelArrIterct(arr, thresholdDist) {
  // create copy of input array as working copy
  arr = arr.map(x => ({
    cx : x.cx,
    cy: x.cy,
    
    zx: math.bignumber('0'),
    zy: math.bignumber('0'),
    zx2: math.bignumber('0'),
    zy2: math.bignumber('0'),
    loopExited: false,
    beyondPerturbation: false,
    
    iters: null,
  }));
  
  for (let entry of arr) {
    let qt1 = math.subtract(entry.cx, math.bignumber('0.25'));
    let q = math.add(math.multiply(qt1, qt1), math.multiply(entry.cy, entry.cy));
    if (math.smaller(math.multiply(q, math.add(q, math.subtract(entry.cx, math.bignumber('0.25')))), math.multiply(math.multiply(math.bignumber('0.25'), entry.cy), entry.cy))) {
      entry.loopExited = true;
      entry.iters = MAX_ITERS;
      continue;
    }
    
    let t1 = math.add(entry.cx, 1.0);
    if (math.smaller(math.add(math.multiply(t1, t1), math.multiply(entry.cy, entry.cy)), math.bignumber(math.fraction(1, 16)))) {
      entry.loopExited = true;
      entry.iters = MAX_ITERS;
      continue;
    }
  }
  
  let workingArr = [...arr];
  
  while (workingArr.length > 0) {
    for (let i = workingArr.length - 1; i >= 0; i--) {
      let entry = workingArr[i];
      
      entry.zy = math.add(math.multiply(math.add(entry.zx, entry.zx), entry.zy), entry.cy);
      entry.zx = math.add(math.subtract(entry.zx2, entry.zy2), entry.cx);
      entry.zx2 = math.multiply(entry.zx, entry.zx);
      entry.zy2 = math.multiply(entry.zy, entry.zy);
      
      entry.iters++;
      
      if (math.largerEq(math.add(entry.zx2, entry.zy2), ESCAPE_RADIUS) || entry.iters >= MAX_ITERS) {
        entry.loopExited = true;
        workingArr.splice(i, 1);
      }
    }
    
    if (workingArr.length > 1) {
      let initialEntry = workingArr[0];
      
      let stopCalculation = false;
      
      for (let i = workingArr.length - 1; i >= 0; i--) {
        let entry = workingArr[i];
        
        if (math.largerEq(math.add(math.square(math.subtract(entry.zx, initialEntry.zx)), math.square(math.subtract(entry.zy, initialEntry.zy))), thresholdDist)) {
          entry.beyondPerturbation = true;
          stopCalculation = true;
          break;
        }
      }
      
      if (stopCalculation) {
        break;
      }
    }
  }
  
  return arr;
}

/*
(() => {
  let cx = math.bignumber("-1.296355138173036216552967546899076797655272531353041380433865418");
  let cy = math.bignumber("0.441851605735196601077911017224272712708313976456904128704533679");
  let scale = math.bignumber("4.372718980588188203377448666486052544169107365814442416209028654e-18");
  
  let pixelScale = math.divide(scale, canvas.height);
  let pixelScale2 = math.multiply(pixelScale, 2);
  
  let input = [
    {
      cx,
      cy,
    },
    {
      cx: math.add(cx, pixelScale2),
      cy,
    },
    {
      cx,
      cy: math.add(cy, pixelScale2),
    },
    {
      cx: math.add(cx, pixelScale),
      cy,
    },
    {
      cx,
      cy: math.add(cy, pixelScale),
    },
    {
      cx: math.subtract(cx, pixelScale),
      cy,
    },
    {
      cx,
      cy: math.subtract(cy, pixelScale),
    },
  ];
  
  let output = MathJSGetMandelArrIterct(input, PERTURBATION_THRESHOLD_FLOAT_SQ);
  
  let latexFormat = x => {
    x = x.toString();
    if (x.includes('e')) {
      x = x.split('e');
      return `${x[0]}\\cdot10^{${x[1]}}`;
    } else {
      return x;
    }
  };
  
  console.log(`\\left[${output.map(x => `\\left(${latexFormat(Number(x.zx.toString())-Number(output[0].zx.toString()))},${latexFormat(Number(x.zy.toString())-Number(output[0].zy.toString()))}\\right)`)}\\right]\n\\left[${output.map(x => `\\left(${latexFormat(math.subtract(x.cx,output[0].cx))},${latexFormat(math.subtract(x.cy,output[0].cy))}\\right)`)}\\right]`);
})();
*/

// https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set
function getMandelIterct_withZ(cx, cy, zx, zy, iterCount) {
  let qt1 = cx - 0.25;
  let q = qt1 * qt1 + cy * cy;
  if (q * (q + (cx - 0.25)) < 0.25 * cy * cy) {
    return MAX_ITERS;
  }
  
  let t1 = cx + 1.0;
  if (t1 * t1 + cy * cy < (1.0 / 16.0)) {
    return MAX_ITERS;
  }
  
  let zx2 = zx * zx;
  let zy2 = zy * zy;
  
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

function MathJS_PerturbJS_FillMandelPixelArray(x, y, scale, width, height, pixelData) {
  let pixelScale = math.divide(scale, height);
  
  let inputPoints = [
    { cx: x, cy: y }, // base point
    { cx: math.add(x, pixelScale), cy: y }, // x basis vector
    { cx: x, cy: math.add(y, pixelScale) }, // y basis vector
  ];
  
  let divergedZValues = MathJSGetMandelArrIterct(inputPoints, PERTURBATION_THRESHOLD_DOUBLE_SQ);
  
  let cx = math.number(x), cy = math.number(y);
  
  let zx_basis = math.number(divergedZValues[0].zx),
    zy_basis = math.number(divergedZValues[0].zy),
    zx_x = math.number(math.subtract(divergedZValues[1].zx, divergedZValues[0].zx)),
    zx_y = math.number(math.subtract(divergedZValues[1].zy, divergedZValues[0].zy)),
    zy_x = math.number(math.subtract(divergedZValues[2].zx, divergedZValues[0].zx)),
    zy_y = math.number(math.subtract(divergedZValues[2].zy, divergedZValues[0].zy));
  
  let startingIters = divergedZValues[0].iters;
  
  for (var i = 0; i < width * height * 4; i += 4) {
    let px = Math.floor(i / 4) % width,
      py = Math.floor(i / width / 4);
    let adjPx = (px - width / 2),
      adjPy = -(py - height / 2);
    
    let zx = zx_basis + adjPx * zx_x + adjPy * zy_x,
      zy = zy_basis + adjPx * zx_y + adjPy * zy_y;
    
    /*switch (LOG_RENDER) {
      case 0:
        
        break;
    }*/
    
    let iters = getMandelIterct_withZ(cx, cy, zx, zy, startingIters);
    
    fillMandelPixelArray_setPallete(iters, pixelData, i);
  }
}
