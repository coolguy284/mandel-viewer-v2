function abortGPURendering() {
  switch (RENDER_METHOD) {
    case 2:
    case 3:
      RENDER_METHOD = 0;
      break;
    
    case 4:
    case 7:
      RENDER_METHOD = 1;
      break;
  }
  
  render();
}

function resetCanvas() {
  let canvasCode = canvas_div.innerHTML;
  canvas_div.innerHTML = '';
  canvas_div.innerHTML = canvasCode;
  
  ctx = null;
  ctxType = null;
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
function loadShader(ctx, type, source) {
  let shader = ctx.createShader(type);
  
  // send source code to shader object on gpu
  ctx.shaderSource(shader, source);
  
  // compile the shader program
  ctx.compileShader(shader);
  
  if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
    alert(`Error compiling OpenGL shader: ${ctx.getShaderInfoLog(shader)}`);
    
    ctx.deleteShader(shader);
    
    abortGPURendering();
    
    return null;
  }
  
  return shader;
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
function initShaderProgram() {
  let shaderProgram;
  
  let vertexCode;
  let fragmentCode;
  
  switch (RENDER_METHOD) {
    case 3:
      vertexCode = mandelVertTestShader;
      fragmentCode = mandelFragTestShader;
      break;
    
    case 4:
      vertexCode = mandelVertShader;
      fragmentCode = mandelFragShader;
      break;
    
    case 7:
      vertexCode = mandelVertPerturbationShader;
      fragmentCode = mandelFragPerturbationShader;
      break;
  }
  
  let vertexShader = loadShader(ctx, ctx.VERTEX_SHADER, vertexCode);
  let fragmentShader = loadShader(ctx, ctx.FRAGMENT_SHADER, fragmentCode);
  
  shaderProgram = ctx.createProgram();
  ctx.attachShader(shaderProgram, vertexShader);
  ctx.attachShader(shaderProgram, fragmentShader);
  ctx.linkProgram(shaderProgram);
  
  if (!ctx.getProgramParameter(shaderProgram, ctx.LINK_STATUS)) {
    alert(`Cannot initialize OpenGL shader program, reverting to CPU-based rendering: ${ctx.getProgramInfoLog(shaderProgram)}`);
    
    abortGPURendering();
    
    return null;
  }
  
  return shaderProgram;
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
function initGLBuffers() {
  let positionBuffer = ctx.createBuffer();
  
  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
  
  let positions = new Float32Array([
    // (x, y), make sure x coord is equal to plus or minus aspect (declared below in glResize), for screen to be fully filled
    1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    -1.0, -1.0,
  ]);
  
  ctx.bufferData(ctx.ARRAY_BUFFER, positions, ctx.STATIC_DRAW);
  
  return {
    position: positionBuffer,
  };
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
function setPositionAttribute(buffers) {
  let numComponents = 2;
  let type = ctx.FLOAT;
  let normalize = false;
  let stride = 0;
  let offset = 0;
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffers.position);
  ctx.vertexAttribPointer(
    shaderProgramInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  ctx.enableVertexAttribArray(shaderProgramInfo.attribLocations.vertexPosition);
}

function glResize(buffers) {
  let fieldOfView = (45 * Math.PI) / 180;
  let aspect = 1.0; // aspect ratio of 3d view (width/height)
  let zNear = 0.1;
  let zFar = 100.0;
  
  let projectionMatrix = mat4.create();
  
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  
  let modelViewMatrix = mat4.create();
  
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -2.413]);
  
  setPositionAttribute(buffers);
  
  ctx.useProgram(shaderProgram);
  
  ctx.uniformMatrix4fv(
    shaderProgramInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  ctx.uniformMatrix4fv(
    shaderProgramInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );
  ctx.uniform2fv(shaderProgramInfo.uniformLocations.iResolution, [canvas.width, canvas.height]);
  
  ctx.viewport(0, 0, canvas.width, canvas.height);
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
function drawGLScene(perturbationsNeeded) {
  ctx.clearColor(0.0, 0.0, 0.0, 0.0);
  ctx.clearDepth(1.0);
  ctx.enable(ctx.DEPTH_TEST);
  ctx.depthFunc(ctx.LEQUAL);
  
  ctx.clear(ctx.COLOR_BUFFER_BUT | ctx.DEPTH_BUFFER_BIT);
  
  if (RENDER_METHOD == 7) {
    ctx.uniform2fv(shaderProgramInfo.uniformLocations.coords, [math.number(X), math.number(Y)]);
    ctx.uniform1f(shaderProgramInfo.uniformLocations.scale, math.number(SCALE));
  } else {
    ctx.uniform2fv(shaderProgramInfo.uniformLocations.coords, [X, Y]);
    ctx.uniform1f(shaderProgramInfo.uniformLocations.scale, SCALE);
  }
  
  ctx.uniform1i(shaderProgramInfo.uniformLocations.pallete, PALLETE);
  ctx.uniform1i(shaderProgramInfo.uniformLocations.logRender, LOG_RENDER);
  ctx.uniform1i(shaderProgramInfo.uniformLocations.smoothIters, Number(SMOOTH_ITERS));
  
  ctx.uniform1i(shaderProgramInfo.uniformLocations.maxIters, MAX_ITERS);
  ctx.uniform1f(shaderProgramInfo.uniformLocations.escapeRadius, ESCAPE_RADIUS);
  
  ctx.uniform1i(shaderProgramInfo.uniformLocations.randomColorFuzzing, Number(RANDOM_COLOR_FUZZING));
  ctx.uniform1i(shaderProgramInfo.uniformLocations.doArtificialBanding, Number(DO_ARTIFICIAL_BANDING));
  ctx.uniform1i(shaderProgramInfo.uniformLocations.artificialBandingFactor, ARTIFICIAL_BANDING_FACTOR);
  
  ctx.uniform1i(shaderProgramInfo.uniformLocations.crashed, Number(CRASHED));
  
  if (RENDER_METHOD == 7) {
    setPerturbationVarsGL(X, Y, SCALE, canvas.height, perturbationsNeeded);
  }
  
  let offset = 0;
  let vertexCount = 4;
  ctx.drawArrays(ctx.TRIANGLE_STRIP, offset, vertexCount);
  
  // https://stackoverflow.com/questions/62836595/webgl-performance-differences-between-firefox-and-chrome
  // Force the webpage to wait for the GPU process
  //ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, new Uint8Array(4));
}
