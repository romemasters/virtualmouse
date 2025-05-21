(function() {
  if (window._virtualMouse) return;
  window._virtualMouse = true;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 999999;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let x = canvas.width / 2, y = canvas.height / 2;
  const radius = 10, speed = 8;
  let clickEffect = false, clickTimer = 0;

  window.rmclick = false;
  window.rmclickinterval = 0.2; 
  let autoclickTimer = null;

  function sendClick(xx, yy) {
    const element = document.elementFromPoint(xx, yy);
    if (element && element !== canvas) {
      ["mousedown", "mouseup", "click"].forEach(eventType => {
        const event = new MouseEvent(eventType, {
          clientX: xx,
          clientY: yy,
          bubbles: true,
          cancelable: true,
          view: window
        });
        element.dispatchEvent(event);
      });
      clickEffect = true;
      clickTimer = 12;
    }
  }

  // lg
  function startAutoclicker() {
    if (autoclickTimer) clearInterval(autoclickTimer);
    autoclickTimer = setInterval(() => {
      if (window.rmclick) sendClick(x, y);
    }, Math.max(10, 1000 * window.rmclickinterval));
  }
  // wfc
  Object.defineProperty(window, "rmclick", {
    set: function(v) {
      this._rmclick = !!v;
      if (this._rmclick) startAutoclicker();
    },
    get: function() {
      return this._rmclick;
    }
  });
  Object.defineProperty(window, "rmclickinterval", {
    set: function(v) {
      this._rmclickinterval = parseFloat(v) || 0.2;
      startAutoclicker();
    },
    get: function() {
      return this._rmclickinterval;
    }
  });
  window.rmclick = false; // init
  window.rmclickinterval = 0.2;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#d32f2f";
    ctx.fill();
    if (clickEffect) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = "#43a047";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  const keys = {};
  window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();

    if (e.key === ' ') {
      sendClick(x, y);
    }
  }, true);

  window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
  }, true);

  function update() {
    if (keys['ArrowLeft']) x -= speed;
    if (keys['ArrowRight']) x += speed;
    if (keys['ArrowUp']) y -= speed;
    if (keys['ArrowDown']) y += speed;
    x = Math.max(radius, Math.min(canvas.width - radius, x));
    y = Math.max(radius, Math.min(canvas.height - radius, y));
    if (clickEffect) {
      clickTimer--;
      if (clickTimer <= 0) clickEffect = false;
    }
    draw();
    requestAnimationFrame(update);
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  update();

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      canvas.remove();
      window._virtualMouse = false;
      if (autoclickTimer) clearInterval(autoclickTimer);
      window.rmclick = false;
      clearInterval(consoleInterval);
      console.clear();
      console.log('%cVirtual Mouse Overlay removed.', 'color:#666');
    }
  }, true);

  // Console help, refreshed every 0.5s
  function printHelp() {
    console.clear();
    console.log('%cFake Mouse - RM. elementclickblock BP', 'color: #d32f2f; font-weight: bold;');
    console.log('- Move: Arrow keys');
    console.log('- Click: SPACE (real click)');
    console.log('- Remove: ESC\n');
    console.log('%cAuto-Clicker Controls:', 'color:#43a047; font-weight:bold;');
    console.log('window.rmclick = true      // Autoclicks');
    console.log('window.rmclick = false     // Stops ^ ');
    console.log('window.rmclickinterval = 1.2   // Autoclicking interval, can be changed with the previously stated string');
    console.log('');
    console.log('%cCurrent Status:', 'color:#2196f3; font-weight:bold;');
    console.log('Auto-clicking:', window.rmclick ? '%cENABLED' : '%cDISABLED',
      window.rmclick ? 'color:green;font-weight:bold;' : 'color:red;font-weight:bold;');
    console.log('Interval:', window.rmclickinterval + ' seconds');
  }
  const consoleInterval = setInterval(printHelp, 500);
  printHelp();
})();
