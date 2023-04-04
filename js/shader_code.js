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
  uniform int normalize;
  
  uniform int maxIters;
  uniform float escapeRadius;
  
  uniform int randomColorFuzzing;
  uniform int doArtificialBanding;
  uniform int artificialBandingFactor;
  
  out vec4 outColor;
  
  int getMandelIterct(float cx, float cy) {
    float qt1 = cx - 0.25;
    float q = qt1 * qt1 + cy * cy;
    if (q * (q + (cx - 0.25)) < 0.25 * cy * cy) {
      return maxIters;
    }
    
    float t1 = cx + 1.0;
    if (t1 * t1 + cy * cy < (1.0 / 16.0)) {
      return maxIters;
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
    
    return iterCount;
  }
  
  void main() {
    //outColor = vec4(gl_FragCoord.x / iResolution.x, 1.0, 0.0, 1.0);
    
    float px = gl_FragCoord.x;
    float py = gl_FragCoord.y;
    
    float normPx = (px - iResolution.x / 2.0) / iResolution.y;
    float normPy = (py - iResolution.y / 2.0) / iResolution.y;
    
    float cx;
    float cy;
    
    if (logRender == 0) {
      cx = normPx * scale + coords.x;
      cy = normPy * scale + coords.y;
    } else if (logRender == 1) {
    
    } else if (logRender == 2) {
      
    }
    
    int iters = getMandelIterct(cx, cy);
    
    if (pallete >= 0 && pallete <= 2) {
      float colorVal = min(-cos((float(iters) * 6.0 / 256.0) * 3.14159265358979 * 2.0) * 88.0 + 148.0, 256.0);
      
      float processedColorVal;
      
      if (iters < maxIters) {
        processedColorVal = colorVal / 256.0;
      } else {
        processedColorVal = 0.0;
      }
      
      if (pallete == 0) {
        outColor = vec4(0.0, 0.0, processedColorVal, 1.0);
      } else if (pallete == 1) {
        
      } else if (pallete == 2) {
        
      }
    }
  }
`;
