(function () {

  const style = document.createElement('style');
  style.textContent = `
    #cursor-dot.cross {
      border-radius: 0; -webkit-mask: none; mask: none;
      clip-path: polygon(
        35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,
        65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%
      );
      transform: translate(-50%,-50%) rotate(45deg);
    }

    nav {
      overflow: hidden;
      transition: height 0.6s cubic-bezier(0.77,0,0.175,1);
    }
    nav.n4-open {
      height: 100dvh !important;
      mix-blend-mode: normal !important;
      background: #000 !important;
    }

    .nav-logo {
      transition: transform 0.6s cubic-bezier(0.77,0,0.175,1);
    }
    nav.n4-open .nav-logo {
      transform: translateX(-50%) scale(10) !important;
      pointer-events: none;
      filter: invert(1);
    }

    .nav-links, .nav-lang { display: none; }

    /* contenedor — dimensiones se calculan en open() */
    #n4-btns {
      position: fixed;
      left: 50%; top: 0;
      transform: translateX(-50%);
      z-index: 101;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease 0.45s;
    }
    body.n4-open #n4-btns { opacity: 1; }

    .n4btn {
      position: absolute;
      border-radius: 50%;
      background: red;
      mix-blend-mode: screen;
      aspect-ratio: 1;
      transform: translate(-50%, -50%);
      display: block; cursor: none;
      border: none; outline: none;
      pointer-events: none;
      transition: transform 0.18s ease;
      text-decoration: none;
    }
    body.n4-open .n4btn { pointer-events: auto; }
    .n4btn:hover { transform: translate(-50%,-50%) scale(1.15); }
  `;
  document.head.appendChild(style);

  /* Posiciones como % de la imagen del logo (cuadrada 1:1)
     fx/fy = centro del círculo, fd = diámetro */
  const BTNS = [
    { href: '/index.html',   fx: 50, fy: 18, fd: 14 }, // frente    → proyectos
    { href: '/about.html',   fx: 36, fy: 46, fd:  9 }, // ojo izq   → sobre mí
    { href: '/archivo.html', fx: 64, fy: 46, fd:  9 }, // ojo der   → archivo
    { href: null,            fx: 50, fy: 67, fd: 11 }, // boca      → idioma
  ];

  const btnsEl = document.createElement('div');
  btnsEl.id = 'n4-btns';

  BTNS.forEach(def => {
    const el = document.createElement(def.href ? 'a' : 'button');
    el.className = 'n4btn';
    if (def.href) el.href = def.href;
    el.style.left  = def.fx + '%';
    el.style.top   = def.fy + '%';
    el.style.width = def.fd + '%';

    if (!def.href) {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const langs = ['es','en','ca'];
        const cur  = localStorage.getItem('lang') || 'es';
        const next = langs[(langs.indexOf(cur) + 1) % langs.length];
        if (typeof applyLang === 'function') applyLang(next);
        else {
          const link = document.querySelector(`.lang-link[data-lang="${next}"]`);
          if (link) link.click(); else localStorage.setItem('lang', next);
        }
      });
    } else {
      el.addEventListener('click', e => e.stopPropagation());
    }
    btnsEl.appendChild(el);
  });
  document.body.appendChild(btnsEl);

  /* ── cursor ─────────────────────────────────────────────────────────── */
  const CUR_ALL = ['triangle-right','triangle-left','cross','magnify','plus','square'];
  function setCursor(cls) {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;
    CUR_ALL.forEach(c => dot.classList.remove(c));
    if (cls) dot.classList.add(cls);
  }

  /* ── open / close ────────────────────────────────────────────────────── */
  const navEl   = document.querySelector('nav');
  const logo    = document.querySelector('.nav-logo');
  const logoSrc = logo ? logo.src : '';
  let docClose  = null;

  function open() {
    if (document.body.classList.contains('n4-open')) return;

    const navH = navEl.getBoundingClientRect().height;

    /* cara: quitar centrado vertical, dejar origen arriba-centro */
    if (logo) {
      logo.style.transition      = 'none';
      logo.style.height          = navH + 'px';
      logo.style.top             = '0';
      logo.style.transform       = 'translateX(-50%)';
      logo.style.transformOrigin = '50% 0%';
      void logo.getBoundingClientRect();
      logo.style.transition = '';
    }

    /* el contenedor de botones cubre exactamente la cara escalada ×10 */
    const faceSize = navH * 10;
    btnsEl.style.width  = faceSize + 'px';
    btnsEl.style.height = faceSize + 'px';

    navEl.style.height = navH + 'px';
    requestAnimationFrame(() => {
      document.body.classList.add('n4-open');
      navEl.classList.add('n4-open');
    });

    docClose = e => {
      if (!(logo && logo.contains(e.target)) && !e.target.closest('.n4btn')) close();
    };
    setTimeout(() => document.addEventListener('click', docClose), 50);
    setCursor('cross');
  }

  function close() {
    document.body.classList.remove('n4-open');
    navEl.classList.remove('n4-open');
    if (docClose) { document.removeEventListener('click', docClose); docClose = null; }
    setCursor(null);
    setTimeout(() => {
      if (navEl.classList.contains('n4-open')) return;
      navEl.style.height = '';
      if (logo) {
        logo.style.height = logo.style.top = logo.style.transform = logo.style.transformOrigin = '';
      }
    }, 680);
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* ── logo ────────────────────────────────────────────────────────────── */
  if (logo) {
    logo.addEventListener('click', () =>
      document.body.classList.contains('n4-open') ? close() : open()
    );
    logo.addEventListener('mouseenter', () => setCursor('square'));
    logo.addEventListener('mouseleave', () =>
      document.body.classList.contains('n4-open') ? setCursor('cross') : setCursor(null)
    );

    const srcB = logoSrc.replace('logo-bnw.png', 'logo-bnw-p.png');
    new Image().src = srcB;
    setInterval(() => {
      logo.src = srcB;
      setTimeout(() => { logo.src = logoSrc; }, 200);
    }, 5000);
  }

})();
