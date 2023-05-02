// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
let mandelVertTestShader = `
  attribute vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`, mandelFragTestShader = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
  }
`, mandelVertShader = `#version 300 es
  in vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`, mandelFragShader = `#version 300 es
  precision highp float;
  
  uniform vec2 iResolution;
  
  uniform vec2 coords;
  uniform float scale;
  
  uniform int pallete;
  uniform int logRender;
  uniform int smoothIters;
  
  uniform int maxIters;
  uniform float escapeRadius;
  
  uniform int randomColorFuzzing;
  uniform int doArtificialBanding;
  uniform int artificialBandingFactor;
  
  uniform int crashed;
  
  out vec4 outColor;
  
  // https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
  // A single iteration of Bob Jenkins' One-At-A-Time hashing algorithm.
  int hash(int x) {
    x = x + (x << 10) << 0;
    x ^= x >> 6;
    x = x + (x << 3) << 0;
    x ^= x >> 11;
    x = x + (x << 15) << 0;
    return x & 0xffff;
  }
  
  float hashWrap(float x) {
    return float(hash(int(x))) / 65536.0f;
  }
  
  vec3 getRainbowIntIterColor(int iters) {
    if (iters < 0 || iters >= maxIters) return vec3(0.0, 0.0, 0.0);
    
    int itersMod = (-(iters - 1) % 24 + 24) % 24; // minus sign at front because backwards rainbow looks better
    
    switch (itersMod) {
      case 0: return vec3(1.0, 0.0, 0.0);
      case 1: return vec3(1.0, 0.25, 0.0);
      case 2: return vec3(1.0, 0.5, 0.0);
      case 3: return vec3(1.0, 0.75, 0.0);
      case 4: return vec3(1.0, 1.0, 0.0);
      case 5: return vec3(0.75, 1.0, 0.0);
      case 6: return vec3(0.5, 1.0, 0.0);
      case 7: return vec3(0.25, 1.0, 0.0);
      case 8: return vec3(0.0, 1.0, 0.0);
      case 9: return vec3(0.0, 1.0, 0.25);
      case 10: return vec3(0.0, 1.0, 0.5);
      case 11: return vec3(0.0, 1.0, 0.75);
      case 12: return vec3(0.0, 1.0, 1.0);
      case 13: return vec3(0.0, 0.75, 1.0);
      case 14: return vec3(0.0, 0.5, 1.0);
      case 15: return vec3(0.0, 0.25, 1.0);
      case 16: return vec3(0.0, 0.0, 1.0);
      case 17: return vec3(0.25, 0.0, 1.0);
      case 18: return vec3(0.5, 0.0, 1.0);
      case 19: return vec3(0.75, 0.0, 1.0);
      case 20: return vec3(1.0, 0.0, 1.0);
      case 21: return vec3(1.0, 0.0, 0.75);
      case 22: return vec3(1.0, 0.0, 0.5);
      case 23: return vec3(1.0, 0.0, 0.25);
      default: return vec3(0.0, 0.0, 0.0); // should be impossible branch but here to remove the warning
    }
  }
  
  vec3 getRainbowIterColor(float iters) {
    if (floor(iters) == iters) {
      return getRainbowIntIterColor(int(iters));
    }
    
    float itersFloorFloat = floor(iters);
    int itersFloor = int(itersFloorFloat);
    int itersCeil = int(ceil(iters));
    float itersFrac = iters - itersFloorFloat;
    
    vec3 itersFloorColor = getRainbowIntIterColor(itersFloor);
    vec3 itersCeilColor = getRainbowIntIterColor(itersCeil);
    
    return itersFloorColor + (itersCeilColor - itersFloorColor) * itersFrac;
  }
  
  float getMandelIterct(float cx, float cy) {
    float qt1 = cx - 0.25;
    float q = qt1 * qt1 + cy * cy;
    if (q * (q + (cx - 0.25)) < 0.25 * cy * cy) {
      return float(maxIters);
    }
    
    float t1 = cx + 1.0;
    if (t1 * t1 + cy * cy < (1.0 / 16.0)) {
      return float(maxIters);
    }
    
    float zx = 0.0;
    float zy = 0.0;
    float zx2 = 0.0;
    float zy2 = 0.0;
    
    int iterCount = 0;
    
    while (zx2 + zy2 < escapeRadius && iterCount < maxIters) {
      zy = (zx + zx) * zy + cy;
      zx = zx2 - zy2 + cx;
      zx2 = zx * zx;
      zy2 = zy * zy;
      
      iterCount++;
    }
    
    float iterCountFloat = float(iterCount);
    
    if (smoothIters > 0 && iterCount < maxIters) {
      float log_zn = log(zx2 + zy2) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      
      iterCountFloat = iterCountFloat + 1.0 - nu;
    }
    
    return iterCountFloat;
  }
  
  void main() {
    //outColor = vec4(gl_FragCoord.x / iResolution.x, 1.0, 0.0, 1.0);
    
    float px = gl_FragCoord.x;
    float py = gl_FragCoord.y;
    
    float altNormPx = px / iResolution.x;
    float altNormPy = py / iResolution.y;
    
    float normPx = (px - iResolution.x / 2.0) / iResolution.y;
    float normPy = (py - iResolution.y / 2.0) / iResolution.y;
    
    bool doRest = true;
    
    if (crashed > 0) {
      if (normPx > 0.55f) {
        outColor = vec4(0.5f + sin(gl_FragCoord.x * 1.5f) * 0.2f, 0.3f, 0.0f, 1.0f);
        doRest = false;
      }
      
      normPx *= 0.9;
      normPx += sin(normPy * 50.0f) * 0.02f;
      normPy -= sin(normPx * 200.0f) * 0.005f;
      normPx = -pow(-normPx + 0.5f, 1.3f) + 0.5f;
    }
    
    if (doRest) {
      float cx;
      float cy;
      
      switch (logRender) {
        case 0:
          cx = normPx * scale + coords.x;
          cy = normPy * scale + coords.y;
          break;
        
        case 1: {
          float dist = sqrt(normPx * normPx + normPy * normPy);
          float ang = atan(normPy, normPx); // 2 argument atan is just the standard atan2
          
          cx = cos(ang) * (pow(2.0, dist * (-log2(scale) + 4.0)) - 1.0) * scale + coords.x;
          cy = sin(ang) * (pow(2.0, dist * (-log2(scale) + 4.0)) - 1.0) * scale + coords.y;
          } break;
        
        case 2: {
          float dist = sqrt(normPx * normPx + normPy * normPy) * 2.0;
          float ang = atan(normPy, normPx); // 2 argument atan is just the standard atan2
          
          cx = cos(ang) * (pow(2.0, dist * (-log2(min(scale, 1.0)) + 1.7)) - 1.0) * scale + coords.x;
          cy = sin(ang) * (pow(2.0, dist * (-log2(min(scale, 1.0)) + 1.7)) - 1.0) * scale + coords.y;
          } break;
      }
      
      float iters = getMandelIterct(cx, cy);
      
      if (pallete >= 0 && pallete <= 2) {
        float colorVal = min(-cos((iters * 6.0 / 256.0) * 3.14159265358979 * 2.0) * 88.0 + 148.0, 256.0);
        
        float processedColorVal;
        
        if (iters < float(maxIters)) {
          processedColorVal = colorVal / 256.0;
        } else {
          processedColorVal = 0.0;
        }
        
        switch (pallete) {
          case 0:
            outColor = vec4(0.0, 0.0, processedColorVal, 1.0);
            break;
          
          case 1:
            outColor = vec4(0.0, processedColorVal, 0.0, 1.0);
            break;
          
          case 2:
            outColor = vec4(processedColorVal, 0.0, 0.0, 1.0);
            break;
        }
      } else if (pallete == 3) {
        vec3 color = getRainbowIterColor(iters);
        
        outColor = vec4(color, 1.0);
      }
    }
    
    if (crashed > 0) {
      if (doRest) {
        outColor.r = outColor.r * 0.15f + 0.6f;
        outColor.g = outColor.g * 0.15f + 0.3f;
      }
      
      if (altNormPx > 0.795f - hashWrap(altNormPy * 3723.0f + altNormPx * 5421.0f) / 50.0f - pow(2.0f, altNormPy * 200.0f - 198.0f) / 10.0f && altNormPy > 0.8f - hashWrap(altNormPx * 3723.0f + altNormPy * 5421.0f) / 50.0f - pow(2.0f, altNormPx * 200.0f - 198.0f) / 10.0f) {
        outColor.r = float(hash(hash(int(mod(coords.x, scale) / scale * 2412.0f + mod(coords.y, scale) / scale * 7134681.0f)) + hash(int(gl_FragCoord.x)))) / 65536.0f;
        outColor.g = float(hash(hash(int(mod(coords.x, scale) / scale * 2412.0f + mod(coords.y, scale) / scale * 7134681.0f)) + hash(int(gl_FragCoord.x + gl_FragCoord.y * 329.0f + 35122.0f)))) / 65536.0f;
        outColor.b = float(hash(hash(int(mod(coords.x, scale) / scale * 2412.0f + mod(coords.y, scale) / scale * 7134681.0f)) + hash(int(gl_FragCoord.x + gl_FragCoord.y * 329.0f + 91232.0f)))) / 65536.0f;
      }
    }
  }
`, mandelVertPerturbationShader = `#version 300 es
  in vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`, mandelFragPerturbationShader = `#version 300 es
  precision highp float;
  
  uniform vec2 iResolution;
  
  uniform vec2 coords;
  uniform vec2 zcoords_basis;
  uniform vec2 zcoords_2ndx;
  uniform vec2 zcoords_2ndy;
  uniform float scale;
  uniform int initialIterCount;
  
  uniform int pallete;
  uniform int logRender;
  uniform int smoothIters;
  
  uniform int maxIters;
  uniform float escapeRadius;
  
  uniform int randomColorFuzzing;
  uniform int doArtificialBanding;
  uniform int artificialBandingFactor;
  
  uniform int noPerturbation;
  
  out vec4 outColor;
  
  vec3 getRainbowIntIterColor(int iters) {
    if (iters < 0 || iters >= maxIters) return vec3(0.0, 0.0, 0.0);
    
    int itersMod = (-(iters - 1) % 24 + 24) % 24; // minus sign at front because backwards rainbow looks better
    
    switch (itersMod) {
      case 0: return vec3(1.0, 0.0, 0.0);
      case 1: return vec3(1.0, 0.25, 0.0);
      case 2: return vec3(1.0, 0.5, 0.0);
      case 3: return vec3(1.0, 0.75, 0.0);
      case 4: return vec3(1.0, 1.0, 0.0);
      case 5: return vec3(0.75, 1.0, 0.0);
      case 6: return vec3(0.5, 1.0, 0.0);
      case 7: return vec3(0.25, 1.0, 0.0);
      case 8: return vec3(0.0, 1.0, 0.0);
      case 9: return vec3(0.0, 1.0, 0.25);
      case 10: return vec3(0.0, 1.0, 0.5);
      case 11: return vec3(0.0, 1.0, 0.75);
      case 12: return vec3(0.0, 1.0, 1.0);
      case 13: return vec3(0.0, 0.75, 1.0);
      case 14: return vec3(0.0, 0.5, 1.0);
      case 15: return vec3(0.0, 0.25, 1.0);
      case 16: return vec3(0.0, 0.0, 1.0);
      case 17: return vec3(0.25, 0.0, 1.0);
      case 18: return vec3(0.5, 0.0, 1.0);
      case 19: return vec3(0.75, 0.0, 1.0);
      case 20: return vec3(1.0, 0.0, 1.0);
      case 21: return vec3(1.0, 0.0, 0.75);
      case 22: return vec3(1.0, 0.0, 0.5);
      case 23: return vec3(1.0, 0.0, 0.25);
      default: return vec3(0.0, 0.0, 0.0); // should be impossible branch but here to remove the warning
    }
  }
  
  vec3 getRainbowIterColor(float iters) {
    if (floor(iters) == iters) {
      return getRainbowIntIterColor(int(iters));
    }
    
    float itersFloorFloat = floor(iters);
    int itersFloor = int(itersFloorFloat);
    int itersCeil = int(ceil(iters));
    float itersFrac = iters - itersFloorFloat;
    
    vec3 itersFloorColor = getRainbowIntIterColor(itersFloor);
    vec3 itersCeilColor = getRainbowIntIterColor(itersCeil);
    
    return itersFloorColor + (itersCeilColor - itersFloorColor) * itersFrac;
  }
  
  float getMandelIterctNormal(float cx, float cy) {
    float qt1 = cx - 0.25;
    float q = qt1 * qt1 + cy * cy;
    if (q * (q + (cx - 0.25)) < 0.25 * cy * cy) {
      return float(maxIters);
    }
    
    float t1 = cx + 1.0;
    if (t1 * t1 + cy * cy < (1.0 / 16.0)) {
      return float(maxIters);
    }
    
    float zx = 0.0;
    float zy = 0.0;
    float zx2 = 0.0;
    float zy2 = 0.0;
    
    int iterCount = 0;
    
    while (zx2 + zy2 < escapeRadius && iterCount < maxIters) {
      zy = (zx + zx) * zy + cy;
      zx = zx2 - zy2 + cx;
      zx2 = zx * zx;
      zy2 = zy * zy;
      
      iterCount++;
    }
    
    float iterCountFloat = float(iterCount);
    
    if (smoothIters > 0 && iterCount < maxIters) {
      float log_zn = log(zx2 + zy2) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      
      iterCountFloat = iterCountFloat + 1.0 - nu;
    }
    
    return iterCountFloat;
  }
  
  void mainNormal() {
    float px = gl_FragCoord.x;
    float py = gl_FragCoord.y;
    
    float normPx = (px - iResolution.x / 2.0) / iResolution.y;
    float normPy = (py - iResolution.y / 2.0) / iResolution.y;
    
    float cx;
    float cy;
    
    switch (logRender) {
      case 0:
        cx = normPx * scale + coords.x;
        cy = normPy * scale + coords.y;
        break;
      
      case 1: {
        float dist = sqrt(normPx * normPx + normPy * normPy);
        float ang = atan(normPy, normPx); // 2 argument atan is just the standard atan2
        
        cx = cos(ang) * (pow(2.0, dist * (-log2(scale) + 4.0)) - 1.0) * scale + coords.x;
        cy = sin(ang) * (pow(2.0, dist * (-log2(scale) + 4.0)) - 1.0) * scale + coords.y;
        } break;
      
      case 2: {
        float dist = sqrt(normPx * normPx + normPy * normPy) * 2.0;
        float ang = atan(normPy, normPx); // 2 argument atan is just the standard atan2
        
        cx = cos(ang) * (pow(2.0, dist * (-log2(min(scale, 1.0)) + 1.7)) - 1.0) * scale + coords.x;
        cy = sin(ang) * (pow(2.0, dist * (-log2(min(scale, 1.0)) + 1.7)) - 1.0) * scale + coords.y;
        } break;
    }
    
    float iters = getMandelIterctNormal(cx, cy);
    
    if (pallete >= 0 && pallete <= 2) {
      float colorVal = min(-cos((iters * 6.0 / 256.0) * 3.14159265358979 * 2.0) * 88.0 + 148.0, 256.0);
      
      float processedColorVal;
      
      if (iters < float(maxIters)) {
        processedColorVal = colorVal / 256.0;
      } else {
        processedColorVal = 0.0;
      }
      
      switch (pallete) {
        case 0:
          outColor = vec4(0.0, 0.0, processedColorVal, 1.0);
          break;
        
        case 1:
          outColor = vec4(0.0, processedColorVal, 0.0, 1.0);
          break;
        
        case 2:
          outColor = vec4(processedColorVal, 0.0, 0.0, 1.0);
          break;
      }
    } else if (pallete == 3) {
      vec3 color = getRainbowIterColor(iters);
      
      outColor = vec4(color, 1.0);
    }
  }
  
  float getMandelIterct(float cx, float cy, float zx, float zy, int iterCount) {
    float qt1 = cx - 0.25;
    float q = qt1 * qt1 + cy * cy;
    if (q * (q + (cx - 0.25)) < 0.25 * cy * cy) {
      return float(maxIters);
    }
    
    float t1 = cx + 1.0;
    if (t1 * t1 + cy * cy < (1.0 / 16.0)) {
      return float(maxIters);
    }
    
    float zx2 = zx * zx;
    float zy2 = zy * zy;
    
    while (zx2 + zy2 < escapeRadius && iterCount < maxIters) {
      zy = (zx + zx) * zy + cy;
      zx = zx2 - zy2 + cx;
      zx2 = zx * zx;
      zy2 = zy * zy;
      
      iterCount++;
    }
    
    float iterCountFloat = float(iterCount);
    
    if (smoothIters > 0 && iterCount < maxIters) {
      float log_zn = log(zx2 + zy2) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      
      iterCountFloat = iterCountFloat + 1.0 - nu;
    }
    
    return iterCountFloat;
  }
  
  void main() {
    if (noPerturbation > 0) {
      mainNormal();
      return;
    }
    
    float px = gl_FragCoord.x;
    float py = gl_FragCoord.y;
    
    float adjPx = (px - iResolution.x / 2.0);
    float adjPy = (py - iResolution.y / 2.0);
    
    float cx = coords.x;
    float cy = coords.y;
    
    /*switch (logRender) {
      case 0:
        
        break;
    }*/
    
    float iters = getMandelIterct(
      cx,
      cy,
      zcoords_basis.x + adjPx * zcoords_2ndx.x + adjPy * zcoords_2ndx.y,
      zcoords_basis.y + adjPx * zcoords_2ndy.x + adjPy * zcoords_2ndy.y,
      initialIterCount
    );
    
    if (pallete >= 0 && pallete <= 2) {
      float colorVal = min(-cos((iters * 6.0 / 256.0) * 3.14159265358979 * 2.0) * 88.0 + 148.0, 256.0);
      
      float processedColorVal;
      
      if (iters < float(maxIters)) {
        processedColorVal = colorVal / 256.0;
      } else {
        processedColorVal = 0.0;
      }
      
      switch (pallete) {
        case 0:
          outColor = vec4(0.0, 0.0, processedColorVal, 1.0);
          break;
        
        case 1:
          outColor = vec4(0.0, processedColorVal, 0.0, 1.0);
          break;
        
        case 2:
          outColor = vec4(processedColorVal, 0.0, 0.0, 1.0);
          break;
      }
    } else if (pallete == 3) {
      vec3 color = getRainbowIterColor(iters);
      
      outColor = vec4(color, 1.0);
    }
  }
`;
