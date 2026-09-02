(function () {

  /* ─── STYLES ──────────────────────────────────────────────────────────── */
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

    nav.nav2-menu-open {
      mix-blend-mode: normal !important;
      background: #000 !important;
    }
    nav.nav2-menu-open .nav-logo { filter: invert(1); }

    /* Capa 0 (z-96): invisible, bloquea clics del fondo pero reenvía scroll */
    #nav2-blocker {
      position: fixed; inset: 0; z-index: 96;
      pointer-events: none;
    }
    body.nav2-open #nav2-blocker { pointer-events: auto; }

    /* Capa 1 (z-97): fondo #3d3c8c con difference */
    #nav2-bg {
      position: fixed; inset: 0; z-index: 97;
      background: #3d3c8c;
      mix-blend-mode: difference;
      pointer-events: none;
      clip-path: inset(0 0 100% 0);
      transition: clip-path 0.6s cubic-bezier(0.77,0,0.175,1);
    }

    /* Capa 2 (z-98): figura negra con líneas blancas */
    #nav2-figure {
      position: fixed; inset: 0; z-index: 98;
      background: url('/img/menu-figura.png') center center / contain no-repeat;
      filter: invert(1);
      -webkit-mask-image: url('/img/menu-figura-mascara-css.png');
              mask-image: url('/img/menu-figura-mascara-css.png');
      -webkit-mask-size: contain;     mask-size: contain;
      -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
      -webkit-mask-position: center;  mask-position: center;
      pointer-events: none;
      clip-path: inset(0 0 100% 0);
      transition: clip-path 0.6s cubic-bezier(0.77,0,0.175,1);
    }

    body.nav2-open #nav2-bg,
    body.nav2-open #nav2-figure { clip-path: inset(0 0 0% 0); }

    /* Contenedor botones + labels (z-101) */
    #nav2-btns {
      position: fixed;
      width:  min(100vw, calc(100vh * 1920 / 1080));
      height: min(100vh, calc(100vw * 1080 / 1920));
      left: 50%; top: 50%; transform: translate(-50%, -50%);
      z-index: 101; pointer-events: none; opacity: 0;
      transition: opacity 0.3s ease 0.45s;
    }
    body.nav2-open #nav2-btns { opacity: 1; }

    .n2btn {
      position: absolute; border-radius: 50%; background: red;
      mix-blend-mode: screen; aspect-ratio: 1;
      transform: translate(-50%,-50%); display: block; cursor: none;
      border: none; outline: none; pointer-events: none;
      transition: transform 0.18s ease; text-decoration: none;
    }
    body.nav2-open .n2btn { pointer-events: auto; }
    .n2btn:hover { transform: translate(-50%,-50%) scale(1.12); }

    /* Labels SVG que orbitan */
    .n2label {
      position: absolute;
      aspect-ratio: 1;
      pointer-events: none;
      overflow: visible;
      mix-blend-mode: screen;
      animation: n2orbit 12s linear infinite;
    }
    .n2label text {
      font-family: 'IBM Plex Mono', monospace;
    }

    @keyframes n2orbit {
      from { transform: translate(-50%,-50%) rotate(0deg); }
      to   { transform: translate(-50%,-50%) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  /* ── BLOCKER ──────────────────────────────────────────────────────────── */
  if (!document.getElementById('nav2-blocker')) {
    const blocker = document.createElement('div');
    blocker.id = 'nav2-blocker';
    document.body.appendChild(blocker);
    blocker.addEventListener('wheel', e => {
      window.scrollBy({ top: e.deltaY, left: e.deltaX });
    }, { passive: true });
  }

  /* ── CAPAS DE OVERLAY ─────────────────────────────────────────────────── */
  ['nav2-bg', 'nav2-figure'].forEach(id => {
    if (!document.getElementById(id))
      document.body.appendChild(Object.assign(document.createElement('div'), { id }));
  });

  /* ── BOTONES + LABELS ─────────────────────────────────────────────────── */
  const BTNS = [
    { href: '/index.html',   l: 57.7, t: 29.8, d: 9.9,  label: 'proyectos' },
    { href: '/archivo.html', l: 17.4, t: 25.2, d: 12.0, label: 'archivo'   },
    { href: '/about.html',   l: 38.7, t: 20.6, d: 5.4,  label: 'sobre mí'  },
    { href: null,            l: 34.2, t: 67.0, d: 11.5, label: 'idioma'    },
  ];

  const btnsEl = document.createElement('div');
  btnsEl.id = 'nav2-btns';
  const NS = 'http://www.w3.org/2000/svg';

  BTNS.forEach((def, i) => {
    /* botón / enlace */
    const el = document.createElement(def.href ? 'a' : 'button');
    el.className = 'n2btn';
    if (def.href) el.href = def.href;
    el.style.left  = def.l + '%';
    el.style.top   = def.t + '%';
    el.style.width = def.d + '%';

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

    /* label SVG que orbita */
    const svg = document.createElementNS(NS, 'svg');
    const uid = 'n2orbit' + i;
    svg.setAttribute('viewBox', '-1.5 -1.5 3 3');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('n2label');
    svg.style.left  = def.l + '%';
    svg.style.top   = def.t + '%';
    svg.style.width = (def.d * 3) + '%';

    const defs = document.createElementNS(NS, 'defs');
    const pathEl = document.createElementNS(NS, 'path');
    pathEl.setAttribute('id', uid);
    /* círculo completo en sentido horario, empieza arriba */
    pathEl.setAttribute('d', 'M 0,-0.78 A 0.78,0.78 0 1,1 -0.001,-0.78');
    defs.appendChild(pathEl);
    svg.appendChild(defs);

    const text = document.createElementNS(NS, 'text');
    text.setAttribute('font-size', '0.20');
    text.setAttribute('fill', 'red');

    const tp = document.createElementNS(NS, 'textPath');
    tp.setAttribute('href', '#' + uid);
    const seg = ' ' + def.label + ' //';
    tp.textContent = seg.repeat(5);
    text.appendChild(tp);
    svg.appendChild(text);

    btnsEl.appendChild(svg);
  });

  document.body.appendChild(btnsEl);

  /* ── CURSOR ───────────────────────────────────────────────────────────── */
  const CUR_ALL = ['triangle-right','triangle-left','cross','magnify','plus','square'];
  function setCursor(cls) {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;
    CUR_ALL.forEach(c => dot.classList.remove(c));
    if (cls) dot.classList.add(cls);
  }

  /* ── OPEN / CLOSE ─────────────────────────────────────────────────────── */
  const navEl   = document.querySelector('nav');
  const logo    = document.querySelector('.nav-logo');
  const logoSrc = logo ? logo.src : '';
  let docClose  = null;

  function open() {
    if (document.body.classList.contains('nav2-open')) return;
    document.body.classList.add('nav2-open');
    if (navEl) navEl.classList.add('nav2-menu-open');
    docClose = e => {
      if (!(logo && logo.contains(e.target)) && !e.target.closest('.n2btn')) close();
    };
    setTimeout(() => document.addEventListener('click', docClose), 50);
    setCursor('cross');
  }

  function close() {
    document.body.classList.remove('nav2-open');
    if (navEl) navEl.classList.remove('nav2-menu-open');
    if (docClose) { document.removeEventListener('click', docClose); docClose = null; }
    setCursor(null);
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* ── LOGO ─────────────────────────────────────────────────────────────── */
  if (logo) {
    logo.addEventListener('click', () =>
      document.body.classList.contains('nav2-open') ? close() : open()
    );
    logo.addEventListener('mouseenter', () => setCursor('square'));
    logo.addEventListener('mouseleave', () =>
      document.body.classList.contains('nav2-open') ? setCursor('cross') : setCursor(null)
    );

    const srcB = logoSrc.replace('logo-bnw.png', 'logo-bnw-p.png');
    new Image().src = srcB;
    setInterval(() => {
      logo.src = srcB;
      setTimeout(() => { logo.src = logoSrc; }, 200);
    }, 5000);
  }

})();
