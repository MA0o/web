/**
 * viewer.js — Universal lightbox carousel.
 * Desktop: click to zoom 2× centred on cursor, drag to pan, click/Esc to exit.
 * Mobile:  pinch to zoom (dynamic scale), drag to pan, tap to exit, swipe to navigate.
 *          Brief tap-cursor feedback shows the relevant icon at the touch point.
 */
(function () {

  // ── CSS ──────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #vwr-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: #000; display: none;
      overflow-x: auto; overflow-y: hidden;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    #vwr-overlay.open { display: block; }
    body.vwr-open { overflow: hidden; }

    #vwr-track { display: flex; height: 100%; width: max-content; }
    #vwr-track img {
      width: 100vw; height: 100%; object-fit: contain;
      flex-shrink: 0; scroll-snap-align: start; display: block;
      pointer-events: none; user-select: none; -webkit-user-drag: none;
    }

    #vwr-close {
      position: fixed; top: 1rem; right: 1rem; z-index: 10001;
      background: none; border: none; color: #fff; cursor: none;
      padding: 0; line-height: 0;
    }
    #vwr-prev, #vwr-next {
      position: fixed; top: 50%; transform: translateY(-50%); z-index: 10001;
      background: none; border: none; color: #fff; cursor: none;
      padding: 0; line-height: 0; transition: opacity 0.2s;
    }
    #vwr-prev { left: 1rem; } #vwr-next { right: 1rem; }
    #vwr-prev.vwr-hidden, #vwr-next.vwr-hidden { opacity: 0; pointer-events: none; }
    #vwr-close svg, #vwr-prev svg, #vwr-next svg {
      width: clamp(2rem, 5vw, 4rem); height: clamp(2rem, 5vw, 4rem); display: block;
    }

    @media (max-width: 900px) {
      #vwr-prev, #vwr-next { display: none; }
      #vwr-close svg { width: 3.5rem; height: 3.5rem; }
      /* show cursor-dot briefly on tap — overrides page display:none */
      #cursor-dot { display: block !important; opacity: 0; transition: opacity 0.08s; }
      #cursor-dot.tap-flash { opacity: 1; }
    }

    #vwr-counter {
      position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);
      z-index: 10001; color: #fff;
      font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
      font-size: 0.75rem; opacity: 0.5; pointer-events: none; user-select: none;
    }

    img.vwr-zoomable { cursor: none !important; }

    /* external links — difference blend like the nav */
    a[target="_blank"] {
      background: #ffffff;
      color: #000000;
      mix-blend-mode: difference;
      padding: 0.05em 0.2em;
      text-decoration: none;
    }

    /* ── cursor shapes ─────────────────────────────────────────────────── */
    #cursor-dot.triangle-right {
      border-radius: 0; width: 48px; height: 48px;
      -webkit-mask: url('/icons/cursors/cursor-arrow-right.svg') center/contain no-repeat;
      mask: url('/icons/cursors/cursor-arrow-right.svg') center/contain no-repeat;
    }
    #cursor-dot.triangle-left {
      border-radius: 0; width: 48px; height: 48px;
      -webkit-mask: url('/icons/cursors/cursor-arrow-left.svg') center/contain no-repeat;
      mask: url('/icons/cursors/cursor-arrow-left.svg') center/contain no-repeat;
    }
    #cursor-dot.cross {
      border-radius: 0;
      clip-path: polygon(35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,
                          65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%);
      transform: translate(-50%,-50%) rotate(45deg);
    }
    #cursor-dot.magnify {
      border-radius: 0;
      -webkit-mask: url('/icons/cursors/cursor-magnify.svg') center/contain no-repeat;
      mask: url('/icons/cursors/cursor-magnify.svg') center/contain no-repeat;
    }
    #cursor-dot.plus {
      border-radius: 0;
      clip-path: polygon(35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,
                          65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%);
      transform: translate(-50%,-50%);
    }
  `;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'vwr-overlay';
  overlay.innerHTML = `
    <button id="vwr-close" aria-label="Cerrar">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="7.21 7.21 17.59 17.59">
        <path fill="currentColor" d="M8.51 7.21 7.21 8.51 14.72 16 7.21 23.52 8.48 24.8 15.99 17.3 23.48 24.8 24.77 23.5 17.27 16 24.8 8.48 23.52 7.21 15.99 14.72 8.51 7.21Z"/>
      </svg>
    </button>
    <button id="vwr-prev" aria-label="Anterior">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 77.14 135.23" style="transform:scaleX(-1)">
        <rect fill="currentColor" x="31.83" y="-9.24" width="13.48" height="95.62" transform="translate(-15.98 38.57) rotate(-45)"/>
        <rect fill="currentColor" x="31.83" y="48.85" width="13.48" height="95.62" transform="translate(79.64 1.04) rotate(45)"/>
      </svg>
    </button>
    <button id="vwr-next" aria-label="Siguiente">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 77.14 135.23">
        <rect fill="currentColor" x="31.83" y="-9.24" width="13.48" height="95.62" transform="translate(-15.98 38.57) rotate(-45)"/>
        <rect fill="currentColor" x="31.83" y="48.85" width="13.48" height="95.62" transform="translate(79.64 1.04) rotate(45)"/>
      </svg>
    </button>
    <div id="vwr-track"></div>
    <div id="vwr-counter"></div>
  `;
  document.body.appendChild(overlay);

  // ── References ────────────────────────────────────────────────────────────
  const track    = document.getElementById('vwr-track');
  const counter  = document.getElementById('vwr-counter');
  const btnClose = document.getElementById('vwr-close');
  const btnPrev  = document.getElementById('vwr-prev');
  const btnNext  = document.getElementById('vwr-next');
  const dot      = document.getElementById('cursor-dot');
  let total = 0;

  // ── Cursor management ─────────────────────────────────────────────────────
  const CUR_ALL = ['triangle-right','triangle-left','cross','magnify','plus','square'];
  function setCursor(cls) {
    if (!dot) return;
    CUR_ALL.forEach(c => dot.classList.remove(c));
    if (cls) dot.classList.add(cls);
  }
  function clearCursor() { setCursor(null); }

  // External links → plus (desktop hover)
  document.addEventListener('mouseover', e => { if (e.target.closest('a[target="_blank"]')) setCursor('plus'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest('a[target="_blank"]')) clearCursor(); });

  // ── Mobile tap-cursor feedback ────────────────────────────────────────────
  let tapTimer = null;
  function showTapCursor(x, y, cls) {
    if (!dot) return;
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';
    setCursor(cls);
    dot.classList.add('tap-flash');
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { dot.classList.remove('tap-flash'); clearCursor(); }, 250);
  }

  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const { clientX: x, clientY: y } = e.touches[0];
    let cls = null;
    if (overlay.classList.contains('open')) {
      cls = zoomed ? 'cross' : 'magnify';
      if (e.target.closest('#vwr-close')) cls = 'cross';
    } else {
      const el = document.elementFromPoint(x, y);
      if (el) {
        if (el.closest('a[target="_blank"]'))       cls = 'plus';
        else if (el.closest('nav a'))               cls = 'square';
        else if (el.closest('img.vwr-zoomable') ||
                 el.closest('#sequence'))            cls = 'magnify';
      }
    }
    if (cls) showTapCursor(x, y, cls);
  }, { passive: true });

  // ── State ─────────────────────────────────────────────────────────────────
  let zoomed = false, zoomImg = null, panX = 0, panY = 0, currentScale = 1;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function currentIndex() {
    return overlay.clientWidth ? Math.round(overlay.scrollLeft / overlay.clientWidth) : 0;
  }
  function updateCounter() { counter.textContent = `${currentIndex() + 1} / ${total}`; }
  function applyZoom(img, s, px, py) {
    img.style.transform = `translate(${px}px,${py}px) scale(${s})`;
  }
  function lockScroll() {
    overlay.style.overflowX   = 'hidden';
    overlay.style.scrollSnapType = 'none';
  }
  function unlockScroll() {
    overlay.style.overflowX   = 'auto';
    overlay.style.scrollSnapType = 'x mandatory';
  }

  // ── Zoom ──────────────────────────────────────────────────────────────────
  function enterZoom(cx, cy) {
    const W = window.innerWidth, H = window.innerHeight;
    zoomImg = track.children[currentIndex()];
    // fill viewport width, but never less than 2×
    let s = 2;
    if (zoomImg && zoomImg.naturalWidth && zoomImg.naturalHeight) {
      const fillW = (W / H) * (zoomImg.naturalHeight / zoomImg.naturalWidth);
      s = Math.max(fillW, 2);
    }
    zoomed = true; currentScale = s;
    // general formula: keeps the clicked point fixed for any scale
    panX = (W / 2 - cx) * (s - 1);
    panY = (H / 2 - cy) * (s - 1);
    lockScroll();
    zoomImg.style.transition = 'transform 0.25s ease';
    applyZoom(zoomImg, s, panX, panY);
    btnPrev.classList.add('vwr-hidden');
    btnNext.classList.add('vwr-hidden');
    setCursor('cross');
  }

  function exitZoom() {
    if (!zoomImg) return;
    zoomed = false; currentScale = 1;
    zoomImg.style.transition = 'transform 0.25s ease';
    applyZoom(zoomImg, 1, 0, 0);
    const img = zoomImg;
    zoomImg = null; panX = 0; panY = 0;
    setTimeout(() => { if (img) img.style.transition = ''; }, 250);
    unlockScroll();
    btnPrev.classList.remove('vwr-hidden');
    btnNext.classList.remove('vwr-hidden');
    setCursor('magnify');
  }

  // ── Desktop pointer events ────────────────────────────────────────────────
  let ptrDown = false, didDrag = false;
  let ptrStartX = 0, ptrStartY = 0, ptrPanX = 0, ptrPanY = 0, clickX = 0, clickY = 0;

  overlay.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    if (e.target.closest('#vwr-close,#vwr-prev,#vwr-next')) return;
    ptrDown = true; didDrag = false;
    ptrStartX = e.clientX; ptrStartY = e.clientY;
    clickX = e.clientX;   clickY = e.clientY;
    if (zoomed) {
      ptrPanX = panX; ptrPanY = panY;
      try { overlay.setPointerCapture(e.pointerId); } catch (_) {}
    }
  });

  overlay.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    if (!ptrDown) return;
    const dx = e.clientX - ptrStartX, dy = e.clientY - ptrStartY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
    if (zoomed && zoomImg) {
      panX = ptrPanX + dx; panY = ptrPanY + dy;
      zoomImg.style.transition = 'none';
      applyZoom(zoomImg, currentScale, panX, panY);
    }
  });

  overlay.addEventListener('pointerup', e => {
    if (e.pointerType === 'touch') return;
    if (!ptrDown) return;
    ptrDown = false;
    if (didDrag) return;
    if (e.target.closest('#vwr-close,#vwr-prev,#vwr-next')) return;
    if (zoomed) exitZoom(); else enterZoom(clickX, clickY);
  });

  // ── Touch events (mobile) ─────────────────────────────────────────────────
  let tx0 = 0, ty0 = 0, touchPanX0 = 0, touchPanY0 = 0;
  let pinchActive = false, pinchStartDist = 0;
  let pinchMidX = 0, pinchMidY = 0;
  let pinchStartPanX = 0, pinchStartPanY = 0, pinchStartScale = 1, lastPinchScale = 1;

  overlay.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      pinchActive = true;
      const [t1, t2] = [e.touches[0], e.touches[1]];
      pinchStartDist  = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchMidX       = (t1.clientX + t2.clientX) / 2;
      pinchMidY       = (t1.clientY + t2.clientY) / 2;
      pinchStartPanX  = panX; pinchStartPanY = panY;
      pinchStartScale = currentScale || 1;
      lastPinchScale  = pinchStartScale;
      lockScroll();
      if (!zoomed) {
        zoomed = true;
        zoomImg = track.children[currentIndex()];
        currentScale = 1;
        btnPrev.classList.add('vwr-hidden');
        btnNext.classList.add('vwr-hidden');
      }
    } else if (e.touches.length === 1) {
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
      touchPanX0 = panX; touchPanY0 = panY;
    }
  }, { passive: false });

  overlay.addEventListener('touchmove', e => {
    if (pinchActive && e.touches.length >= 2 && zoomImg) {
      e.preventDefault();
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const dist     = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio    = pinchStartDist > 0 ? dist / pinchStartDist : 1;
      const newScale = Math.max(1, Math.min(4, pinchStartScale * ratio));
      lastPinchScale = newScale;
      const W = window.innerWidth, H = window.innerHeight;
      // keep pinch midpoint fixed in viewport
      const s0 = pinchStartScale;
      const newPanX = pinchMidX - (pinchMidX - W/2 - pinchStartPanX) * newScale/s0 - W/2;
      const newPanY = pinchMidY - (pinchMidY - H/2 - pinchStartPanY) * newScale/s0 - H/2;
      panX = newPanX; panY = newPanY; currentScale = newScale;
      zoomImg.style.transition = 'none';
      applyZoom(zoomImg, newScale, newPanX, newPanY);

    } else if (!pinchActive && zoomed && zoomImg && e.touches.length === 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - tx0, dy = e.touches[0].clientY - ty0;
      panX = touchPanX0 + dx; panY = touchPanY0 + dy;
      zoomImg.style.transition = 'none';
      applyZoom(zoomImg, currentScale, panX, panY);
    }
  }, { passive: false });

  overlay.addEventListener('touchend', e => {
    if (pinchActive && e.touches.length < 2) {
      pinchActive = false;
      if (lastPinchScale < 1.2) { exitZoom(); } else { zoomed = true; }
      return;
    }
    if (e.touches.length > 0) return;
    const ch = e.changedTouches[0];
    const tapDist = Math.hypot(ch.clientX - tx0, ch.clientY - ty0);
    if (zoomed) {
      if (tapDist < 12) exitZoom(); // tap exits zoom
    } else {
      const dx = ch.clientX - tx0;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); // swipe navigates
    }
  }, { passive: true });

  // ── Open / Close ──────────────────────────────────────────────────────────
  function open(srcs, idx) {
    total = srcs.length;
    track.innerHTML = '';
    srcs.forEach(src => {
      const img = document.createElement('img');
      img.src = src; img.draggable = false;
      track.appendChild(img);
    });
    overlay.classList.add('open');
    document.body.classList.add('vwr-open');
    requestAnimationFrame(() => {
      overlay.scrollLeft = idx * overlay.clientWidth;
      updateCounter();
    });
    setCursor('magnify');
  }

  function close() {
    if (zoomed) exitZoom();
    overlay.classList.remove('open');
    document.body.classList.remove('vwr-open');
    clearCursor();
    setTimeout(() => { track.innerHTML = ''; }, 400);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function step(dir) {
    if (zoomed) return;
    const next = (currentIndex() + dir + total) % total;
    overlay.scrollTo({ left: next * overlay.clientWidth, behavior: 'smooth' });
  }

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click',  () => step(-1));
  btnNext.addEventListener('click',  () => step(+1));
  overlay.addEventListener('scroll', updateCounter, { passive: true });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     { if (zoomed) exitZoom(); else close(); }
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(+1);
  });

  // ── Overlay cursor zones (desktop) ────────────────────────────────────────
  overlay.addEventListener('mouseover', e => {
    if (!dot) return;
    if (e.target.closest('#vwr-close')) { setCursor('cross'); return; }
    if (e.target.closest('#vwr-prev'))  { setCursor('triangle-left'); return; }
    if (e.target.closest('#vwr-next'))  { setCursor('triangle-right'); return; }
    setCursor(zoomed ? 'cross' : 'magnify');
  });
  overlay.addEventListener('mouseout', e => {
    if (!dot) return;
    if (!overlay.contains(e.relatedTarget)) clearCursor();
  });

  // ── Image discovery ───────────────────────────────────────────────────────
  const sequence = document.getElementById('sequence');
  if (sequence) {
    sequence.style.cursor = 'none';
    sequence.addEventListener('mouseenter', () => setCursor('magnify'));
    sequence.addEventListener('mouseleave', () => clearCursor());
    sequence.addEventListener('click', () => {
      const imgs  = [...sequence.querySelectorAll('img')];
      const srcs  = imgs.map(i => i.src);
      const active = imgs.findIndex(i => i.classList.contains('active'));
      open(srcs, active >= 0 ? active : 0);
    });
  } else {
    const imgs = [...document.querySelectorAll('img')].filter(
      img => !img.closest('nav') && !img.closest('#vwr-overlay')
    );
    const srcs = imgs.map(i => i.dataset.full || i.src);
    imgs.forEach((img, idx) => {
      img.classList.add('vwr-zoomable');
      img.addEventListener('click', () => open(srcs, idx));
    });
  }

})();
