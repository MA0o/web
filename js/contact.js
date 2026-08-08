(function () {

  // robust base: currentScript first, then query the DOM (works if currentScript is null)
  const _cs = document.currentScript;
  const _el = _cs || document.querySelector('script[src*="contact.js"]');
  const BASE = _el ? _el.src.replace(/js\/contact\.js.*$/, '') : '';

  const style = document.createElement('style');
  style.textContent = `
    #ct-overlay {
      position: fixed; inset: 0; z-index: 9998;
      display: flex;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.35s ease;
    }
    #ct-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    #ct-box {
      position: relative;
      width: 100%; height: 100%;
      background: #ffdf41;
      display: flex;
      flex-direction: column;
    }

    /* row 1: close button right-aligned */
    #ct-header {
      display: flex;
      justify-content: flex-end;
      padding: 0.4rem 0.4rem 0;
      flex-shrink: 0;
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
    @media (max-width: 900px) {
      #ct-close svg { width: 3.5rem; height: 3.5rem; }
    }

    #ct-info {
      position: absolute;
      left: 0; right: 0;
      bottom: 15rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      text-align: center;
      padding: 0 1rem;
      font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
      font-size: 1rem;
      line-height: 1.1;
      color: #000eff;
    }
    #ct-info a {
      color: #000eff; text-decoration: none;
      background: none !important;
      mix-blend-mode: normal !important;
      padding: 0 !important;
    }
    #cursor-dot.plus {
      border-radius: 0;
      -webkit-mask: none;
      mask: none;
      clip-path: polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%);
    }
    #ct-copy-tip {
      position: fixed;
      pointer-events: none;
      z-index: 10002;
      background: #000;
      color: #fff;
      font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
      font-size: 0.75rem;
      line-height: 1.5;
      padding: 0.3em 0.5em;
      display: none;
      white-space: nowrap;
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
      <div id="ct-info">
        <a href="https://www.instagram.com/mateoprado/" target="_blank">@mateoprado</a>
        <span data-copy="mateucho.04@gmail.com">mateucho.04@gmail.com</span>
        <span data-copy="+34 650165341">+34 650165341</span>
      </div>
      <div id="ct-copy-tip">copiar</div>
    </div>
  `;
  document.body.appendChild(overlay);

  const ctSrcA = BASE + 'img/perfil-hi.png';
  const ctSrcB = BASE + 'img/perfil-hi-p.png';
  new Image().src = ctSrcA;
  new Image().src = ctSrcB;

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

  // ── Copy tooltip ──────────────────────────────────────────────────────────
  const copyTip = document.getElementById('ct-copy-tip');
  overlay.querySelectorAll('[data-copy]').forEach(span => {
    span.addEventListener('mouseenter', () => {
      copyTip.style.display = 'block';
      setCursor('square');
    });
    span.addEventListener('mousemove', e => {
      copyTip.style.left = (e.clientX + 14) + 'px';
      copyTip.style.top  = (e.clientY - 10) + 'px';
    });
    span.addEventListener('mouseleave', () => {
      copyTip.style.display = 'none';
      setCursor(null);
    });
    span.addEventListener('click', () => {
      navigator.clipboard.writeText(span.dataset.copy).catch(() => {});
    });
  });

  // ── Open / Close ──────────────────────────────────────────────────────────
  const navLogo = document.querySelector('.nav-logo');
  let logoClone = null;
  let blinkTimer = null;

  function startBlink() {
    blinkTimer = setInterval(() => {
      if (!logoClone) return;
      logoClone.src = ctSrcB;
      setTimeout(() => { if (logoClone) logoClone.src = ctSrcA; }, 200);
    }, 5000);
  }

  function stopBlink() {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }

  function open() {
    if (navLogo) {
      const R = navLogo.getBoundingClientRect();
      const logoScaledBottom = R.top + R.height * 3;
      document.getElementById('ct-info').style.top = Math.round(logoScaledBottom) + 'px';

      logoClone = document.createElement('img');
      logoClone.src = ctSrcA;
      logoClone.alt = '';
      logoClone.width  = Math.round(R.width);
      logoClone.height = Math.round(R.height);
      Object.assign(logoClone.style, {
        position: 'absolute', pointerEvents: 'none',
        display: 'block', objectFit: 'contain',
        left: R.left + 'px', top: R.top + 'px',
        width: R.width + 'px', height: R.height + 'px',
        transform: 'scale(1)',
        transformOrigin: '50% 0%',
        transition: 'transform 0.35s ease',
      });
      overlay.appendChild(logoClone);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (logoClone) logoClone.style.transform = 'scale(3)';
      }));
      startBlink();
    }
    overlay.classList.add('open');
  }

  function close() {
    stopBlink();
    overlay.classList.remove('open');
    if (logoClone) {
      logoClone.style.transform = 'scale(1)';
      const c = logoClone;
      logoClone = null;
      setTimeout(() => c.remove(), 400);
    }
    if (logo && logoSrcA) logo.src = logoSrcA;
    setCursor(null);
  }

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
    const navEl   = document.querySelector('nav');
    if (!logoEl || !aboutEl || !navEl) return;

    const prev = document.getElementById('about-arrow-svg');
    if (prev) prev.remove();

    const aR = aboutEl.getBoundingClientRect();
    const lR = logoEl.getBoundingClientRect();
    const nR = navEl.getBoundingClientRect();

    const remPx  = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const x1 = aR.right + 3;
    const y1 = (aR.top + aR.bottom) / 2;
    const x2 = lR.left;

    const yTop = nR.top + 3;
    const yBot = nR.bottom - 3;
    const yMid = (yTop + yBot) / 2;
    const yRange = (yBot - yTop) / 2;
    const yAmp   = yRange * 0.52;
    const B2     = yAmp * 0.55;

    const LOOPS  = 3 + Math.floor(Math.random() * 3);
    const l2opts = {3:[4,5], 4:[3,5], 5:[3,4]};
    const LOOPS2 = l2opts[LOOPS][Math.floor(Math.random() * 2)];
    const totalX = x2 - x1;
    const A1     = totalX / (2 * Math.PI * LOOPS) * 1.9;

    // amplitude ramp: loops build up over first 7rem
    const tRamp = Math.min(0.3, (remPx * 7) / totalX);
    const env   = t => t < tRamp ? Math.pow(t / tRamp, 2) : 1;

    const rp   = () => Math.random() * Math.PI * 2;
    const nx   = [[1.1, rp(), 0.35], [2.7, rp(), 0.14], [4.3, rp(), 0.05]];
    const ny   = [[0.8, rp(), 0.38], [2.2, rp(), 0.13], [3.7, rp(), 0.05]];
    const sn   = (t, s) => s.reduce((a, [f, p, w]) => a + w * Math.sin(2 * Math.PI * f * t + p), 0);
    const fade = t => (1 - Math.pow(1 - t, 3)) * (1 - Math.pow(t, 3));
    const jx = totalX * 0.01;
    const jy = yRange  * 0.05;

    const N = 300;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t     = i / N;
      const e     = env(t);
      const blend = Math.min(1, t / tRamp);
      const ph1 = 2 * Math.PI * LOOPS  * t;
      const ph2 = 2 * Math.PI * LOOPS2 * t;
      const f   = fade(t);
      const yBase = y1 + (yMid - y1) * blend;
      const xRaw = x1 + totalX * t
                 + A1 * (Math.cos(ph1) - 1) * e
                 + sn(t, nx) * jx * f;
      const yRaw = yBase
                 + yAmp * Math.sin(ph1) * e
                 - B2   * Math.sin(ph2) * e
                 + sn(t, ny) * jy * f;
      pts.push([xRaw, Math.max(yTop, Math.min(yBot, yRaw))]);
    }

    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i <= N; i++) d += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;

    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.id = 'about-arrow-svg';
    svg.setAttribute('style', 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:visible;mix-blend-mode:difference');

    // Clip to nav bounds so nothing escapes
    const clipId   = 'about-nav-clip';
    const defs     = document.createElementNS(ns, 'defs');
    const clip     = document.createElementNS(ns, 'clipPath');
    clip.id = clipId;
    const clipRect = document.createElementNS(ns, 'rect');
    clipRect.setAttribute('x',      String(nR.left));
    clipRect.setAttribute('y',      String(nR.top));
    clipRect.setAttribute('width',  String(nR.width));
    clipRect.setAttribute('height', String(nR.height));
    clip.appendChild(clipRect);
    defs.appendChild(clip);
    svg.appendChild(defs);

    const g = document.createElementNS(ns, 'g');
    g.setAttribute('clip-path', `url(#${clipId})`);

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');

    const head = document.createElementNS(ns, 'polygon');
    head.setAttribute('fill', 'white');
    head.setAttribute('points', '0,0 0,0 0,0'); // updated each frame by RAF

    g.appendChild(path);
    g.appendChild(head);
    svg.appendChild(g);
    document.body.appendChild(svg);

    const DRAW_MS = 900 + LOOPS * 60;
    const pathLen = path.getTotalLength();
    path.style.strokeDasharray  = String(pathLen);
    path.style.strokeDashoffset = String(pathLen);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      path.style.transition       = `stroke-dashoffset ${DRAW_MS}ms ease-in-out`;
      path.style.strokeDashoffset = '0';

      const t0   = performance.now();
      const ease = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      const al = 8, aw = 4;
      (function animHead(now) {
        const t   = Math.min((now - t0) / DRAW_MS, 1);
        const len = ease(t) * pathLen;
        if (len > 15) {
          const tip  = path.getPointAtLength(len);
          const back = path.getPointAtLength(Math.max(0, len - 14));
          const ang  = Math.atan2(tip.y - back.y, tip.x - back.x);
          head.setAttribute('points', [
            `${tip.x.toFixed(1)},${tip.y.toFixed(1)}`,
            `${(tip.x - al*Math.cos(ang) + aw*Math.sin(ang)).toFixed(1)},${(tip.y - al*Math.sin(ang) - aw*Math.cos(ang)).toFixed(1)}`,
            `${(tip.x - al*Math.cos(ang) - aw*Math.sin(ang)).toFixed(1)},${(tip.y - al*Math.sin(ang) + aw*Math.cos(ang)).toFixed(1)}`
          ].join(' '));
        }
        if (t < 1) requestAnimationFrame(animHead);
      })(performance.now());
    }));

    setTimeout(() => {
      svg.style.transition = 'opacity 0.5s';
      svg.style.opacity    = '0';
      setTimeout(() => svg.remove(), 500);
    }, DRAW_MS + 1500);
  }

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logo = document.querySelector('.nav-logo');
  const logoSrcA = logo ? logo.src : '';
  if (logo) {
    const srcB = logoSrcA.replace('logo-bnw.png', 'logo-bnw-p.png');
    new Image().src = srcB;
    setInterval(() => {
      if (overlay.classList.contains('open')) return;
      logo.src = srcB;
      setTimeout(() => { if (!overlay.classList.contains('open')) logo.src = logoSrcA; }, 200);
    }, 5000);
    logo.addEventListener('click', open);
    logo.addEventListener('mouseenter', () => setCursor('square'));
    logo.addEventListener('mouseleave', () => setCursor(null));
  }

})();
