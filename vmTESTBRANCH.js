(function() {
  if (window._virtualMouse) return;
  if (!window.confirm("Activate the Virtual Mouse Overlay?\n\nYou will be able to control a fake mouse, autoclick, and more.\nA small menu will appear in the corner.")) return;
  window._virtualMouse = true;

  // --- Create the canvas for the virtual mouse ---
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

  // --- Auto-clicker state ---
  window.rmclick = false;
  window.rmclickinterval = 0.2;
  let autoclickTimer = null;

  // --- Menu state ---
  let menu, statusSpan, intervalInput, autoclickToggle, removeBtn, hideBtn, dragHandle;
  let dragging = false, dragOffsetX = 0, dragOffsetY = 0;

  // --- Functions ---
  function sendClick(xx, yy) {
    const element = document.elementFromPoint(xx, yy);
    if (element && element !== canvas && !menu.contains(element)) {
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

  function startAutoclicker() {
    if (autoclickTimer) clearInterval(autoclickTimer);
    autoclickTimer = setInterval(() => {
      if (window.rmclick) sendClick(x, y);
    }, Math.max(10, 1000 * window.rmclickinterval));
  }

  // Property hooks for menu sync
  Object.defineProperty(window, "rmclick", {
    set: function(v) {
      this._rmclick = !!v;
      if (autoclickToggle) autoclickToggle.checked = !!v;
      updateStatus();
      if (this._rmclick) startAutoclicker();
    },
    get: function() {
      return this._rmclick;
    }
  });
  Object.defineProperty(window, "rmclickinterval", {
    set: function(v) {
      this._rmclickinterval = parseFloat(v) || 0.2;
      if (intervalInput) intervalInput.value = this._rmclickinterval;
      updateStatus();
      startAutoclicker();
    },
    get: function() {
      return this._rmclickinterval;
    }
  });
  window.rmclick = false;
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
    if (e.key === ' ') sendClick(x, y);
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

  // --- Draggable tiny menu ---
  function createMenu() {
    menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.top = '30px';
    menu.style.left = '30px';
    menu.style.width = '194px';
    menu.style.background = 'rgba(34,34,34,0.98)';
    menu.style.color = '#fff';
    menu.style.padding = '10px 10px 8px 10px';
    menu.style.borderRadius = '8px';
    menu.style.zIndex = 1000000;
    menu.style.fontSize = '13px';
    menu.style.boxShadow = '0 2px 8px #0006';
    menu.style.userSelect = 'none';
    menu.style.fontFamily = 'system-ui,sans-serif';

    dragHandle = document.createElement('div');
    dragHandle.style.cursor = 'move';
    dragHandle.style.fontWeight = 'bold';
    dragHandle.style.margin = '-7px -7px 8px -7px';
    dragHandle.style.padding = '2px 7px 2px 7px';
    dragHandle.style.background = '#222';
    dragHandle.style.borderRadius = '6px 6px 0 0';
    dragHandle.textContent = '🖱️ Virtual Mouse';
    menu.appendChild(dragHandle);

    hideBtn = document.createElement('button');
    hideBtn.textContent = '×';
    hideBtn.title = 'Hide menu';
    hideBtn.style.position = 'absolute';
    hideBtn.style.top = '4px';
    hideBtn.style.right = '6px';
    hideBtn.style.background = '#333';
    hideBtn.style.color = '#fff';
    hideBtn.style.border = 'none';
    hideBtn.style.fontWeight = 'bold';
    hideBtn.style.borderRadius = '3px';
    hideBtn.style.cursor = 'pointer';
    hideBtn.style.fontSize = '15px';
    hideBtn.style.width = '22px';
    hideBtn.style.height = '22px';
    menu.appendChild(hideBtn);

    // Controls
    let controls = document.createElement('div');
    controls.style.marginBottom = '7px';
    controls.innerHTML =
      '<div style="margin-bottom: 7px;">' +
      '<label style="cursor:pointer;"><input type="checkbox" id="vm-autoclick" style="vertical-align:-2px;margin-right:5px;">Auto-Click</label></div>' +
      '<div style="margin-bottom: 7px;">' +
      'Interval: <input id="vm-interval" type="number" min="0.05" step="0.01" value="0.2" style="width:45px;padding:1px 2px; font-size:12px;border-radius:3px;border:1px solid #444;background:#222;color:#fff;outline:none;"> s' +
      '</div>';
    menu.appendChild(controls);

    // Status
    statusSpan = document.createElement('div');
    statusSpan.style.marginBottom = '7px';
    statusSpan.style.fontSize = '12px';
    menu.appendChild(statusSpan);

    // Keyboard instructions
    let kb = document.createElement('div');
    kb.style.fontSize = '11px';
    kb.style.lineHeight = '1.5';
    kb.style.color = '#B0BEC5';
    kb.style.marginBottom = '7px';
    kb.innerHTML = '<b>Controls:</b><br>' +
      'Move: <b>Arrows</b><br>' +
      'Click: <b>Space</b><br>' +
      'Remove: <b>ESC</b>';
    menu.appendChild(kb);

    // Remove button
    removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove Overlay';
    removeBtn.style.background = '#c62828';
    removeBtn.style.color = '#fff';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '4px';
    removeBtn.style.padding = '4px 12px';
    removeBtn.style.fontWeight = 'bold';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.fontSize = '13px';
    removeBtn.style.margin = '0 auto 1px auto';
    removeBtn.style.display = 'block';
    menu.appendChild(removeBtn);

    // Event wiring
    autoclickToggle = menu.querySelector('#vm-autoclick');
    intervalInput = menu.querySelector('#vm-interval');
    autoclickToggle.checked = !!window.rmclick;
    autoclickToggle.addEventListener('change', function() {
      window.rmclick = autoclickToggle.checked;
    });
    intervalInput.value = window.rmclickinterval;
    intervalInput.addEventListener('input', function() {
      let v = Math.max(0.05, parseFloat(intervalInput.value) || 0.2);
      window.rmclickinterval = v;
    });
    removeBtn.addEventListener('click', removeOverlay);
    hideBtn.addEventListener('click', function() {
      menu.style.display = 'none';
      setTimeout(() => {
        if (window._virtualMouse && confirm("Show the Virtual Mouse menu again?")) menu.style.display = '';
      }, 350);
    });

    // Drag events
    dragHandle.addEventListener('mousedown', dragStart, false);
    document.addEventListener('mousemove', dragMove, false);
    document.addEventListener('mouseup', dragEnd, false);

    document.body.appendChild(menu);
    updateStatus();
  }

  function updateStatus() {
    if (!statusSpan) return;
    statusSpan.innerHTML =
      '<span style="color:#90ee90;">Auto-clicking: ' +
      (window.rmclick ? '<b style="color:#43a047">ENABLED</b>' : '<b style="color:#c62828">DISABLED</b>')
      + '</span><br>' +
      '<span style="color:#b2d1ff;">Interval: <b>' + window.rmclickinterval + '</b> s</span>';
    if (autoclickToggle) autoclickToggle.checked = !!window.rmclick;
    if (intervalInput) intervalInput.value = window.rmclickinterval;
  }

  // --- Draggable logic ---
  function dragStart(e) {
    if (e.button !== 0) return;
    dragging = true;
    dragOffsetX = e.clientX - menu.getBoundingClientRect().left;
    dragOffsetY = e.clientY - menu.getBoundingClientRect().top;
    menu.style.transition = 'none';
    e.preventDefault();
  }
  function dragMove(e) {
    if (!dragging) return;
    let nx = e.clientX - dragOffsetX;
    let ny = e.clientY - dragOffsetY;
    menu.style.left = Math.max(0, Math.min(window.innerWidth - menu.offsetWidth, nx)) + 'px';
    menu.style.top = Math.max(0, Math.min(window.innerHeight - menu.offsetHeight, ny)) + 'px';
  }
  function dragEnd() {
    dragging = false;
    menu.style.transition = '';
  }

  // --- Remove everything (from button or ESC) ---
  function removeOverlay() {
    canvas.remove();
    menu && menu.remove();
    window._virtualMouse = false;
    if (autoclickTimer) clearInterval(autoclickTimer);
    window.rmclick = false;
    window.rmclickinterval = 0.2;
    window.removeOverlay = null;
    document.removeEventListener('mousemove', dragMove, false);
    document.removeEventListener('mouseup', dragEnd, false);
  }

  // --- ESC key removes everything ---
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      removeOverlay();
    }
  }, true);

  // --- Animation loop ---
  update();
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

  // --- Resize canvas if needed ---
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // --- Create the menu now ---
  createMenu();
})();
