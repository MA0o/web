(function () {

  // robust base: currentScript first, then query the DOM (works if currentScript is null)
  const _cs = document.currentScript;
  const _el = _cs || document.querySelector('script[src*="contact.js"]');
  const BASE = _el ? _el.src.replace(/js\/contact\.js.*$/, '') : '';

  const style = document.createElement('style');
  style.textContent = `
    #ct-overlay {
      position: fixed; inset: 0; z-index: 9998;
      display: none;
      align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.45);
    }
    #ct-overlay.open { display: flex; }

    #ct-box {
      width: 320px;
      background: #ffdf41;
      display: flex;
      flex-direction: column;
    }

    /* row 1: close button right-aligned */
    #ct-header {
      display: flex;
      justify-content: flex-end;
      padding: 0.4rem 0.4rem 0;
    }
    #ct-close {
      background: none; border: none; cursor: none;
      padding: 0; line-height: 0; color: #000eff;
    }
    #ct-close svg {
      width: clamp(2rem, 5vw, 4rem);
      height: clamp(2rem, 5vw, 4rem);
      display: block;
    }

    /* row 2: image — square crop, fills popup width */
    #ct-img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      display: block;
    }

    /* row 3: info — auto height, nav font style */
    #ct-info {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 0.4rem 0.5rem 1.2rem;
      gap: 0.15em;
      font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
      font-size: 1rem;
      line-height: 1.1;
      color: #000eff;
      box-sizing: border-box;
    }
    #ct-info a {
      color: #000eff; text-decoration: none;
      background: none !important;
      mix-blend-mode: normal !important;
      padding: 0 !important;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'ct-overlay';
  overlay.innerHTML = `
    <div id="ct-box">
      <div id="ct-header">
        <button id="ct-close" aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="7.21 7.21 17.59 17.59">
            <path fill="currentColor" d="M8.51 7.21 7.21 8.51 14.72 16 7.21 23.52 8.48 24.8 15.99 17.3 23.48 24.8 24.77 23.5 17.27 16 24.8 8.48 23.52 7.21 15.99 14.72 8.51 7.21Z"/>
          </svg>
        </button>
      </div>
      <img id="ct-img" alt="">
      <div id="ct-info">
        <a href="https://www.instagram.com/mateoprado/" target="_blank">@mateoprado</a>
        <span>mateucho.04@gmail.com</span>
        <span>+34 650165341</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('ct-img').src = BASE + 'img/perfil.jpg';

  // ── Cursor ────────────────────────────────────────────────────────────────
  const CUR_ALL = ['triangle-right','triangle-left','cross','magnify','plus','square'];
  function setCursor(cls) {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;
    CUR_ALL.forEach(c => dot.classList.remove(c));
    if (cls) dot.classList.add(cls);
  }

  const btnClose = document.getElementById('ct-close');
  btnClose.addEventListener('mouseenter', () => setCursor('cross'));
  btnClose.addEventListener('mouseleave', () => setCursor(null));

  const igLink = overlay.querySelector('a[target="_blank"]');
  igLink.addEventListener('mouseenter', () => setCursor('plus'));
  igLink.addEventListener('mouseleave', () => setCursor(null));

  // ── Open / Close ──────────────────────────────────────────────────────────
  function open()  { overlay.classList.add('open'); }
  function close() { overlay.classList.remove('open'); setCursor(null); }

  btnClose.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // ── Intercept contact nav link ────────────────────────────────────────────
  document.querySelectorAll('a[data-i18n="nav-contact"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); open(); });
  });

  // ── About: cancelled — click draws curved arrow to logo ──────────────────
  const aboutLink = document.querySelector('a[data-i18n="nav-about"]');
  if (aboutLink) {
    aboutLink.addEventListener('click', e => { e.preventDefault(); showAboutArrow(); });
    aboutLink.addEventListener('mouseover', e => e.stopPropagation());
    aboutLink.addEventListener('mouseout',  e => e.stopPropagation());
    aboutLink.addEventListener('mouseenter', () => setCursor('cross'));
    aboutLink.addEventListener('mouseleave', () => setCursor(null));
  }

  function showAboutArrow() {
    const logoEl  = document.querySelector('.nav-logo');
    const aboutEl = document.querySelector('a[data-i18n="nav-about"]');
    if (!logoEl || !aboutEl) return;

    const prev = document.getElementById('about-arrow-svg');
    if (prev) prev.remove();

    const aR = aboutEl.getBoundingClientRect();
    const lR = logoEl.getBoundingClientRect();

    const x1 = aR.right + 3;
    const y1 = (aR.top + aR.bottom) / 2;
    const x2 = (lR.left + lR.right) / 2;
    const y2 = lR.bottom - 3;

    // Arc bowing downward below the nav
    const bowY = Math.max(y1, y2) + 90;
    const cx1  = x1 + (x2 - x1) * 0.25;
    const cy1  = bowY;
    const cx2  = x1 + (x2 - x1) * 0.75;
    const cy2  = bowY;

    // Arrowhead: tangent at end = direction from last control point to end
    const angle = Math.atan2(y2 - cy2, x2 - cx2);
    const al = 10, aw = 5;
    const p1x = x2 - al * Math.cos(angle) + aw * Math.sin(angle);
    const p1y = y2 - al * Math.sin(angle) - aw * Math.cos(angle);
    const p2x = x2 - al * Math.cos(angle) - aw * Math.sin(angle);
    const p2y = y2 - al * Math.sin(angle) + aw * Math.cos(angle);

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.id = 'about-arrow-svg';
    svg.setAttribute('style', 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:visible');

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`);
    path.setAttribute('stroke', 'red');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');

    const head = document.createElementNS(ns, 'polygon');
    head.setAttribute('points', `${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`);
    head.setAttribute('fill', 'red');
    head.style.opacity = '0';

    svg.appendChild(path);
    svg.appendChild(head);
    document.body.appendChild(svg);

    const DRAW_MS = 700;
    const pathLen = path.getTotalLength();
    path.style.strokeDasharray = '6 4';
    path.style.strokeDashoffset = String(pathLen);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${DRAW_MS}ms ease-in-out`;
      path.style.strokeDashoffset = '0';
    }));

    setTimeout(() => {
      head.style.transition = 'opacity 0.15s';
      head.style.opacity = '1';
    }, DRAW_MS - 80);

    setTimeout(() => {
      svg.style.transition = 'opacity 0.5s';
      svg.style.opacity = '0';
      setTimeout(() => svg.remove(), 500);
    }, DRAW_MS + 1500);
  }

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    const srcA = logo.src;
    const srcB = srcA.replace('logo-bnw.png', 'logo-bnw-p.png');
    new Image().src = srcB;
    setInterval(() => {
      logo.src = srcB;
      setTimeout(() => { logo.src = srcA; }, 200);
    }, 5000);
    logo.addEventListener('click', open);
    logo.addEventListener('mouseenter', () => setCursor('square'));
    logo.addEventListener('mouseleave', () => setCursor(null));
  }

})();
