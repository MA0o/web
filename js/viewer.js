/**
 * viewer.js — Universal lightbox carousel for project pages.
 * Include at end of <body>. Works for any page depth.
 *
 * - All <img> outside <nav> become clickable (opens lightbox at that index).
 * - #sequence pages: clicking the sequence opens at the active slide.
 * - Keyboard: Escape, ←, →. Touch: swipe. Counter: n / total.
 */
(function () {

  // ── CSS ──────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #vwr-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: #000;
      display: none;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    #vwr-overlay.open { display: block; }
    body.vwr-open { overflow: hidden; }

    #vwr-track {
      display: flex;
      height: 100%;
      width: max-content;
    }
    #vwr-track img {
      width: 100vw;
      height: 100%;
      object-fit: contain;
      flex-shrink: 0;
      scroll-snap-align: start;
      display: block;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }

    #vwr-close {
      position: fixed; top: 1rem; right: 1rem;
      z-index: 10001;
      background: none; border: none;
      color: #fff; cursor: none; padding: 0; line-height: 0;
    }
    #vwr-prev, #vwr-next {
      position: fixed; top: 50%; transform: translateY(-50%);
      z-index: 10001;
      background: none; border: none;
      color: #fff; cursor: none; padding: 0; line-height: 0;
    }
    #vwr-prev { left: 1rem; }
    #vwr-next { right: 1rem; }
    #vwr-close svg, #vwr-prev svg, #vwr-next svg {
      width: clamp(2rem, 5vw, 4rem);
      height: clamp(2rem, 5vw, 4rem);
      display: block;
    }

    @media (max-width: 900px) {
      #vwr-prev, #vwr-next { display: none; }
      #vwr-close svg { width: 3.5rem; height: 3.5rem; }
    }

    #vwr-counter {
      position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);
      z-index: 10001; color: #fff;
      font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
      font-size: 0.75rem; opacity: 0.5;
      pointer-events: none; user-select: none;
    }

    /* cursor on zoomable images */
    img.vwr-zoomable { cursor: none !important; }

    /* cursor classes — absolute paths work from any directory */
    #cursor-dot.triangle-right {
      border-radius: 0;
      width: 48px;
      height: 48px;
      -webkit-mask: url('/icons/cursors/cursor-arrow-right.svg') center / contain no-repeat;
      mask: url('/icons/cursors/cursor-arrow-right.svg') center / contain no-repeat;
    }
    #cursor-dot.triangle-left {
      border-radius: 0;
      width: 48px;
      height: 48px;
      -webkit-mask: url('/icons/cursors/cursor-arrow-left.svg') center / contain no-repeat;
      mask: url('/icons/cursors/cursor-arrow-left.svg') center / contain no-repeat;
    }
    #cursor-dot.cross {
      border-radius: 0;
      clip-path: polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%,
                          65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%);
      transform: translate(-50%, -50%) rotate(45deg);
    }
    #cursor-dot.magnify {
      border-radius: 0;
      -webkit-mask: url('/icons/cursors/cursor-magnify.svg') center / contain no-repeat;
      mask: url('/icons/cursors/cursor-magnify.svg') center / contain no-repeat;
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  function curAdd(c)    { if (dot) dot.classList.add(c); }
  function curRemove(c) { if (dot) dot.classList.remove(c); }

  function currentIndex() {
    if (overlay.clientWidth === 0) return 0;
    return Math.round(overlay.scrollLeft / overlay.clientWidth);
  }

  function updateCounter() {
    counter.textContent = `${currentIndex() + 1} / ${total}`;
  }

  function scrollTo(idx) {
    idx = Math.max(0, Math.min(idx, total - 1));
    overlay.scrollLeft = idx * overlay.clientWidth;
    updateCounter();
  }

  // ── Open / Close ──────────────────────────────────────────────────────────
  function open(srcs, idx) {
    total = srcs.length;
    track.innerHTML = '';
    srcs.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.draggable = false;
      track.appendChild(img);
    });
    overlay.classList.add('open');
    document.body.classList.add('vwr-open');
    // Wait one frame so the overlay is painted and clientWidth is available
    requestAnimationFrame(() => {
      overlay.scrollLeft = idx * overlay.clientWidth;
      updateCounter();
    });
  }

  function close() {
    overlay.classList.remove('open');
    document.body.classList.remove('vwr-open');
    // Clear track to free memory
    setTimeout(() => { track.innerHTML = ''; }, 400);
  }

  // ── Controls ──────────────────────────────────────────────────────────────
  function step(dir) {
    const idx = currentIndex();
    const next = (idx + dir + total) % total;
    overlay.scrollTo({ left: next * overlay.clientWidth, behavior: 'smooth' });
  }

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click',  () => step(-1));
  btnNext.addEventListener('click',  () => step(+1));

  overlay.addEventListener('scroll', updateCounter, { passive: true });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(+1);
  });

  // Touch swipe
  let tx0 = 0;
  overlay.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  });

  // ── Cursor bindings for controls ──────────────────────────────────────────
  if (dot) {
    btnClose.addEventListener('mouseenter', () => curAdd('cross'));
    btnClose.addEventListener('mouseleave', () => curRemove('cross'));
    btnPrev.addEventListener('mouseenter',  () => curAdd('triangle-left'));
    btnPrev.addEventListener('mouseleave',  () => curRemove('triangle-left'));
    btnNext.addEventListener('mouseenter',  () => curAdd('triangle-right'));
    btnNext.addEventListener('mouseleave',  () => curRemove('triangle-right'));
  }

  // ── Image discovery & binding ─────────────────────────────────────────────
  function collectImages() {
    return [...document.querySelectorAll('img')].filter(img =>
      !img.closest('nav') && !img.closest('#vwr-overlay')
    );
  }

  const sequence = document.getElementById('sequence');

  if (sequence) {
    // Conquista-style: whole animated strip opens viewer at active frame
    sequence.style.cursor = 'none';
    sequence.addEventListener('mouseenter', () => curAdd('magnify'));
    sequence.addEventListener('mouseleave', () => curRemove('magnify'));
    sequence.addEventListener('click', () => {
      const imgs = [...sequence.querySelectorAll('img')];
      const srcs = imgs.map(i => i.src);
      const active = imgs.findIndex(i => i.classList.contains('active'));
      open(srcs, active >= 0 ? active : 0);
    });

  } else {
    // Standard: each content image opens viewer
    const imgs = collectImages();
    const srcs = imgs.map(i => i.src);
    imgs.forEach((img, idx) => {
      img.classList.add('vwr-zoomable');
      img.addEventListener('mouseenter', () => curAdd('magnify'));
      img.addEventListener('mouseleave', () => curRemove('magnify'));
      img.addEventListener('click', () => open(srcs, idx));
    });
  }

})();
