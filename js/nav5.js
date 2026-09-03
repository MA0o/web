(function () {

  const style = document.createElement('style');
  style.textContent = `
    .nav-links, .nav-lang { display: none !important; }

    nav {
      height: 4.5rem !important;
      min-height: 0 !important;
      display: flex !important;
      align-items: center !important;
    }

    nav .nav-logo {
      position: static !important;
      left: auto !important; top: auto !important;
      transform: none !important;
      height: 4.275rem !important;
      width: auto !important;
      flex-shrink: 0;
      cursor: none;
    }

    .n5btn {
      width: 2.25rem; height: 2.25rem;
      display: flex; align-items: center; justify-content: center;
      cursor: none; text-decoration: none;
      background: none; border: none; padding: 0;
      flex-shrink: 0;
      transition: opacity 0.15s;
    }
    .n5btn img { width: 100%; height: 100%; display: block; object-fit: contain; }
    .n5btn:hover { opacity: 0.5; }

    @media (max-width: 900px) {
      nav { justify-content: space-evenly !important; }
      .n5btn { margin: 0 !important; }
    }
    @media (min-width: 901px) {
      nav { justify-content: center !important; }
      #n5-btn-0 { margin-right: 4.5rem; }
      #n5-btn-1 { margin-right: 3rem;   }
      #n5-btn-2 { margin-left:  3rem;   }
      #n5-btn-3 { margin-left:  4.5rem; }
    }

    #cursor-dot.n5-triangle {
      border-radius: 0;
      -webkit-mask: none; mask: none;
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    }

    #n5-lang-indicator {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 110;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 1rem;
      line-height: 1.1;
      color: #ffffff;
      mix-blend-mode: difference;
      white-space: nowrap;
      padding: 0.12rem 0.5rem;
      pointer-events: none;
    }

    #n5-tap-label {
      position: fixed;
      z-index: 10010;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 1rem;
      background: #000;
      color: #fff;
      white-space: nowrap;
      padding: 0.12rem 0.5rem;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.18s;
      transform: translateX(-50%);
    }
    #n5-tap-label.visible { opacity: 1; }
  `;
  document.head.appendChild(style);

  const navEl = document.querySelector('nav');
  const logo  = document.querySelector('.nav-logo');
  if (!navEl || !logo) return;


  /* ── indicador de idioma (centro pie de página) ─────────────────────── */
  const langIndicator = document.createElement('div');
  langIndicator.id = 'n5-lang-indicator';
  document.body.appendChild(langIndicator);

  const LANG_ORDER = ['es', 'ca', 'en'];
  const LANG_LABEL = { es: 'ESP', ca: 'CAT', en: 'ENG' };

  function updateLangIndicator() {
    const cur = localStorage.getItem('lang') || 'es';
    langIndicator.textContent = LANG_LABEL[cur] || cur.toUpperCase();
  }

  function cycleLang() {
    const cur = localStorage.getItem('lang') || 'es';
    const next = LANG_ORDER[(LANG_ORDER.indexOf(cur) + 1) % LANG_ORDER.length];
    localStorage.setItem('lang', next);
    if (typeof window.applyLang === 'function') {
      window.applyLang(next);
    } else {
      const link = document.querySelector(`.lang-link[data-lang="${next}"]`);
      if (link) link.click();
    }
    updateLangIndicator();
  }

  updateLangIndicator();

  /* ── tap label (móvil) ───────────────────────────────────────────────── */
  const tapLabel = document.createElement('div');
  tapLabel.id = 'n5-tap-label';
  document.body.appendChild(tapLabel);
  let _tapTimer = null;

  function showTapLabel(text, btnEl, action) {
    tapLabel.textContent = text;
    const rect = btnEl.getBoundingClientRect();
    tapLabel.style.left = (rect.left + rect.width / 2) + 'px';
    tapLabel.style.top  = (rect.bottom + 14) + 'px';
    tapLabel.classList.add('visible');
    if (_tapTimer) clearTimeout(_tapTimer);
    _tapTimer = setTimeout(() => tapLabel.classList.remove('visible'), 500);
    setTimeout(action, 300);
  }

  /* ── cursor helpers ───────────────────────────────────────────────────── */
  const CUR_ALL = ['triangle-right','triangle-left','cross','magnify','plus','square','n5-triangle'];
  function setCursor(cls) {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;
    CUR_ALL.forEach(c => dot.classList.remove(c));
    if (cls) dot.classList.add(cls);
  }

  /* ── botones ──────────────────────────────────────────────────────────── */
  const TAP_LABELS = {
    es: ['PROYECTOS', 'SOBRE MÍ', 'ARCHIVO', 'IDIOMA'],
    en: ['PROJECTS',  'ABOUT',    'ARCHIVE', 'LANGUAGE'],
    ca: ['PROJECTES', 'SOBRE MI', 'ARXIU',   'IDIOMA'],
  };
  function getTapLabel(i) {
    const lang = localStorage.getItem('lang') || 'es';
    return (TAP_LABELS[lang] || TAP_LABELS.es)[i];
  }

  const DEFS = [
    { href: '/index.html',   src: '/icons/menu/cuadrado.png',  cursor: 'square',      idx: 0 },
    { href: null,            src: '/icons/menu/cruz.png',      cursor: 'cross',       idx: 1,
      onclick: () => { if (typeof openCV === 'function') openCV(); else window.location.href = '/index.html#cv'; } },
    { href: '/archivo.html', src: '/icons/menu/triangulo.png', cursor: 'n5-triangle', idx: 2 },
    { href: null,            src: '/icons/menu/circulo.png',   cursor: null,          idx: 3,
      onclick: cycleLang },
  ];

  const btns = DEFS.map((def, i) => {
    const el = def.href
      ? Object.assign(document.createElement('a'), { href: def.href })
      : document.createElement('button');
    el.className = 'n5btn';
    el.id = 'n5-btn-' + i;
    const img = document.createElement('img');
    img.src = def.src; img.alt = '';
    el.appendChild(img);

    el.addEventListener('mouseenter', () => { setCursor(def.cursor); });
    el.addEventListener('mouseleave', () => { setCursor(null); });
    el.addEventListener('click', e => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        showTapLabel(getTapLabel(def.idx), el, () => {
          if (def.onclick) def.onclick();
          else if (def.href) window.location.href = def.href;
        });
      } else if (def.onclick) {
        def.onclick();
      }
    });
    return el;
  });

  navEl.insertBefore(btns[0], logo);
  navEl.insertBefore(btns[1], logo);
  logo.insertAdjacentElement('afterend', btns[2]);
  btns[2].insertAdjacentElement('afterend', btns[3]);

  /* ── logo → home ─────────────────────────────────────────────────────── */
  logo.addEventListener('click', () => { window.location.href = '/index.html'; });
  logo.addEventListener('mouseenter', () => setCursor('square'));
  logo.addEventListener('mouseleave', () => setCursor(null));

  /* ── sincronizar indicador cuando la página cambia idioma externamente ── */
  const _origApplyLang = window.applyLang;
  if (typeof _origApplyLang === 'function') {
    window.applyLang = function(lang) {
      _origApplyLang(lang);
      updateLangIndicator();
    };
  }

  /* ── imagen y parpadeo ────────────────────────────────────────────────── */
  const srcOpen   = '/icons/menu/perfil_abierto2.png';
  const srcClosed = '/icons/menu/perfil_cerrado2.png';
  logo.src = srcOpen;
  new Image().src = srcClosed;
  setInterval(() => {
    logo.src = srcClosed;
    setTimeout(() => { logo.src = srcOpen; }, 200);
  }, 3000);

})();
