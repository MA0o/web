(function () {

  const style = document.createElement('style');
  style.textContent = `
    nav {
      overflow: hidden;
      transition: height 0.6s cubic-bezier(0.77,0,0.175,1);
    }
    nav.n3-open { height: 100dvh !important; }

    .nav-logo {
      transition: transform 0.6s cubic-bezier(0.77,0,0.175,1);
    }
    nav.n3-open .nav-logo {
      transform: translateX(-50%) scale(10) !important;
      pointer-events: none;
    }

    /* nav3: barra cerrada = solo logo */
    .nav-links, .nav-lang { display: none; }

    #n3-links {
      position: absolute;
      top: 4.5rem;   /* queda fuera del nav cerrado — clipped por overflow:hidden */
      left: 0; right: 0;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      padding: 0.12rem 0.5rem;
      line-height: 1.1;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease 0s;
    }
    nav.n3-open #n3-links {
      opacity: 1;
      pointer-events: auto;
      transition-delay: 0.42s;
    }

    #n3-links a {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 1rem;
      color: #000;
      text-decoration: none;
      cursor: none;
      display: block;
    }
    #n3-links a:nth-child(2) { text-align: center; }
    #n3-links a:nth-child(3) { text-align: right; }

    #n3-links a:hover { opacity: 0.6; }

    #cursor-dot.cross {
      border-radius: 0;
      -webkit-mask: none; mask: none;
      clip-path: polygon(
        35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,
        65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%
      );
      transform: translate(-50%,-50%) rotate(45deg);
    }
  `;
  document.head.appendChild(style);

  const navEl = document.querySelector('nav');
  if (!navEl) return;

  /* ── enlaces de navegación ────────────────────────────────────────────── */
  const n3Links = document.createElement('div');
  n3Links.id = 'n3-links';
  n3Links.innerHTML =
    '<a href="/index.html">proyectos</a>' +
    '<a href="/about.html">sobre mí</a>' +
    '<a href="/archivo.html">archivo</a>';
  navEl.appendChild(n3Links);

  /* ── cursor ───────────────────────────────────────────────────────────── */
  const CUR_ALL = ['triangle-right','triangle-left','cross','magnify','plus','square'];
  function setCursor(cls) {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;
    CUR_ALL.forEach(c => dot.classList.remove(c));
    if (cls) dot.classList.add(cls);
  }

  n3Links.querySelectorAll('a').forEach(a => {
    a.addEventListener('mouseenter', () => setCursor('square'));
    a.addEventListener('mouseleave', () => {
      if (navEl.classList.contains('n3-open')) setCursor('cross');
    });
  });

  /* ── open / close ─────────────────────────────────────────────────────── */
  function open() {
    if (navEl.classList.contains('n3-open')) return;

    const navH   = navEl.getBoundingClientRect().height;
    const logoEl = navEl.querySelector('.nav-logo');

    /* posición del bloque de links: justo al borde inferior del recuadro */
    n3Links.style.top = navH + 'px';

    if (logoEl) {
      logoEl.style.transition      = 'none';
      logoEl.style.height          = navH + 'px';
      logoEl.style.top             = '0';
      logoEl.style.transform       = 'translateX(-50%)';
      logoEl.style.transformOrigin = '50% 0%';
      void logoEl.getBoundingClientRect();
      logoEl.style.transition = '';
    }

    navEl.style.height = navH + 'px';
    requestAnimationFrame(() => navEl.classList.add('n3-open'));
    setCursor('cross');
  }

  function close() {
    navEl.classList.remove('n3-open');
    setCursor(null);
    setTimeout(() => {
      if (navEl.classList.contains('n3-open')) return;
      navEl.style.height = '';
      const logoEl = navEl.querySelector('.nav-logo');
      if (logoEl) {
        logoEl.style.height          = '';
        logoEl.style.top             = '';
        logoEl.style.transform       = '';
        logoEl.style.transformOrigin = '';
      }
    }, 680);
  }

  navEl.addEventListener('click', e => {
    if (navEl.classList.contains('n3-open') && !n3Links.contains(e.target)) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* ── logo ─────────────────────────────────────────────────────────────── */
  const logo    = document.querySelector('.nav-logo');
  const logoSrc = logo ? logo.src : '';
  if (logo) {
    logo.addEventListener('click', () => {
      if (!navEl.classList.contains('n3-open')) open();
    });
    logo.addEventListener('mouseenter', () => {
      if (!navEl.classList.contains('n3-open')) setCursor('square');
    });
    logo.addEventListener('mouseleave', () => {
      if (!navEl.classList.contains('n3-open')) setCursor(null);
    });

    const srcB = logoSrc.replace('logo-bnw.png', 'logo-bnw-p.png');
    new Image().src = srcB;
    setInterval(() => {
      logo.src = srcB;
      setTimeout(() => { logo.src = logoSrc; }, 200);
    }, 5000);
  }

})();
