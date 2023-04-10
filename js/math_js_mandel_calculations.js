// https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set
function MathJSGetMandelIterct(cx, cy) {
  let qt1 = math.subtract(cx, math.bignumber('0.25'));
  let q = math.add(math.multiply(qt1, qt1), math.multiply(cy, cy));
  if (math.smaller(math.multiply(q, math.add(q, math.subtract(cx, math.bignumber('0.25')))), math.multiply(math.multiply(math.bignumber('0.25'), cy), cy))) {
    return MAX_ITERS;
  }
  
  let t1 = math.add(cx, 1.0);
  if (math.smaller(math.add(math.multiply(t1, t1), math.multiply(cy, cy)), math.bignumber(math.fraction(1, 16)))) {
    return MAX_ITERS;
  }
  
  let zx = math.bignumber('0.0');
  let zy = math.bignumber('0.0');
  let zx2 = math.bignumber('0.0');
  let zy2 = math.bignumber('0.0');
  
  let iterCount = 0;
  
  while (math.smaller(math.add(zx2, zy2), ESCAPE_RADIUS) && iterCount < MAX_ITERS) {
    zy = math.add(math.multiply(math.add(zx, zx), zy), cy);
    zx = math.add(math.subtract(zx2, zy2), cx);
    zx2 = math.multiply(zx, zx);
    zy2 = math.multiply(zy, zy);
    
    iterCount++;
  }
  
  if (SMOOTH_ITERS && iterCount < MAX_ITERS) {
    let log_zn = Number(math.divide(math.log(math.add(zx2, zy2)), math.bignumber('2.0')).toString());
    let nu = Math.log(log_zn / Math.log(2.0)) / Math.log(2.0);
    
    iterCount = iterCount + 1 - nu;
  }
  
  return iterCount;
}

function MathJSFillMandelPixelArray(x, y, scale, width, height, pixelData) {
  scale = math.bignumber(scale);
  x = math.bignumber(x);
  y = math.bignumber(y);
  
  for (var i = 0; i < width * height * 4; i += 4) {
    let px = Math.floor(i / 4) % width,
      py = Math.floor(i / width / 4);
    let normPx = (px - width / 2) / height, // normalized to -0.5 - 0.5, NOT -1 - 1
      normPy = -(py - height / 2) / height; // normalized to -0.5 - 0.5, NOT -1 - 1
    
    let cx, cy;
    
    normPx = math.bignumber(normPx);
    normPy = math.bignumber(normPy);
    
    switch (LOG_RENDER) {
      case 0:
        cx = math.add(math.multiply(normPx, scale), x);
        cy = math.add(math.multiply(normPy, scale), y);
        break;
      
      case 1: {
        let dist = math.hypot(normPx, normPy),
          ang = math.atan2(normPy, normPx);
        
        let expPart = math.multiply(
          math.subtract(
            math.pow(
              math.bignumber('2'),
              math.multiply(
                dist,
                math.add(
                  math.unaryMinus(math.log2(scale)),
                  math.bignumber('4')
                )
              )
            ),
            math.bignumber('-1')
          ),
          scale
        );
        
        cx = math.add(math.multiply(math.cos(ang), expPart), x);
        cy = math.add(math.multiply(math.sin(ang), expPart), y);
        } break;
      
      case 2: {
        let dist = math.hypot(normPx, normPy),
          ang = math.atan2(normPy, normPx);
        
        let expPart = math.multiply(
          math.subtract(
            math.pow(
              math.bignumber('2'),
              math.multiply(
                dist,
                math.add(
                  math.unaryMinus(
                    math.log2(
                      math.min(scale, math.bignumber('1'))
                    )
                  ),
                  math.bignumber('1.7')
                )
              )
            ),
            math.bignumber('-1')
          ),
          scale
        );
        
        cx = math.add(math.multiply(math.cos(ang), expPart), x);
        cy = math.add(math.multiply(math.sin(ang), expPart), y);
        } break;
    }
    
    let iters = MathJSGetMandelIterct(cx, cy);
    
    fillMandelPixelArray_setPallete(iters, pixelData, i);
  }
}
