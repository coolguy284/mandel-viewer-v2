function ensureCanvasContext(ctxName) {
  switch (ctxName) {
    case '2d':
      if (ctxType != '2d') {
        if (ctxType?.startsWith('webgl')) {
          resetCanvas();
        }
        
        ctxType = '2d';
        ctx = canvas.getContext('2d');
      }
      break;
    
    case 'webgl-test':
      if (ctxType != 'webgl-test') {
        if (ctxType == '2d') {
          resetCanvas();
        }
        
        ctxType = 'webgl-test';
        ctx = canvas.getContext('webgl2');
        
        if (!ctx) {
          alert('Your browser or device does not support WebGL, reverting to CPU-based rendering');
          
          abortGPURendering();
          
          return;
        }
      }
      
      // create shaders if not in render method 2
      if (RENDER_METHOD == 3) {
        shaderProgram = initShaderProgram();

        shaderProgramInfo = {
          attribLocations: {
            vertexPosition: ctx.getAttribLocation(shaderProgram, 'aVertexPosition'),
          },
          uniformLocations: {
            projectionMatrix: ctx.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: ctx.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
          },
        };
      }
      break;
    
    case 'webgl-real':
      if (ctxType != 'webgl-real') {
        if (ctxType == '2d') {
          resetCanvas();
        }
        
        ctxType = 'webgl-real';
        ctx = canvas.getContext('webgl2');
        
        if (!ctx) {
          alert('Your browser or device does not support WebGL, reverting to CPU-based rendering');
          
          abortGPURendering();
          
          return;
        }
      }
      
      // create shaders if not in render method 2
      shaderProgram = initShaderProgram();

      shaderProgramInfo = {
        attribLocations: {
          vertexPosition: ctx.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
          projectionMatrix: ctx.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          modelViewMatrix: ctx.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
          
          iResolution: ctx.getUniformLocation(shaderProgram, 'iResolution'),
          
          coords: ctx.getUniformLocation(shaderProgram, 'coords'),
          scale: ctx.getUniformLocation(shaderProgram, 'scale'),
          
          pallete: ctx.getUniformLocation(shaderProgram, 'pallete'),
          logRender: ctx.getUniformLocation(shaderProgram, 'logRender'),
          smoothIters: ctx.getUniformLocation(shaderProgram, 'smoothIters'),
          
          maxIters: ctx.getUniformLocation(shaderProgram, 'maxIters'),
          escapeRadius: ctx.getUniformLocation(shaderProgram, 'escapeRadius'),
          
          randomColorFuzzing: ctx.getUniformLocation(shaderProgram, 'randomColorFuzzing'),
          doArtificialBanding: ctx.getUniformLocation(shaderProgram, 'doArtificialBanding'),
          artificialBandingFactor: ctx.getUniformLocation(shaderProgram, 'artificialBandingFactor'),
        },
      };
      break;
  }
}

function ensureHighPrecVars(highPrecision) {
  if (highPrecision) {
    if (typeof X == 'number') {
      X = math.bignumber(X);
      Y = math.bignumber(Y);
      SCALE = math.bignumber(SCALE);
    }
  } else {
    if (typeof X == 'object') {
      X = math.number(X);
      Y = math.number(Y);
      SCALE = math.number(SCALE);
    }
  }
}

function render() {
  let width = canvas.width, height = canvas.height;
  
  switch (RENDER_METHOD) {
    case 0:
      ensureCanvasContext('2d');
      ensureHighPrecVars(false);
      
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, width, height);
      
      break;
    
    case 1: {
      ensureCanvasContext('2d');
      ensureHighPrecVars(false);
      
      let pixelData = ctx.createImageData(width, height);
      
      fillMandelPixelArray(X, Y, SCALE, width, height, pixelData);
      
      ctx.putImageData(pixelData, 0, 0);
      
      } break;
    
    case 2:
      ensureCanvasContext('webgl-test');
      ensureHighPrecVars(false);
      
      if (!ctx) {
        alert('Your browser or device does not support WebGL, reverting to CPU-based rendering');
        
        abortGPURendering();
        
        return;
      }
      
      ctx.clearColor(1.0, 0.5, 0.0, 1.0);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      
      break;
    
    case 3: {
      ensureCanvasContext('webgl-test');
      ensureHighPrecVars(false);
      
      if (!ctx) {
        alert('Your browser or device does not support WebGL, reverting to CPU-based rendering');
        
        abortGPURendering();
        
        return;
      }
      
      let buffers = initGLBuffers();
      
      drawGLScene(buffers);
      
      } break;
    
    case 4: {
      ensureCanvasContext('webgl-real');
      ensureHighPrecVars(false);
      
      if (!ctx) {
        alert('Your browser or device does not support WebGL, reverting to CPU-based rendering');
        
        abortGPURendering();
        
        return;
      }
      
      let buffers = initGLBuffers();
      
      drawGLScene(buffers);
      
      } break;
    
    case 5: {
      ensureCanvasContext('2d');
      ensureHighPrecVars(true);
      
      let pixelData = ctx.createImageData(width, height);
      
      MathJSFillMandelPixelArray(X, Y, SCALE, width, height, pixelData);
      
      ctx.putImageData(pixelData, 0, 0);
      
      } break;
  }
  
  showCoordinates();
  
  showSettings();
}
