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

    #n5-lang-flash {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 109;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 1rem;
      line-height: 1.1;
      white-space: nowrap;
      padding: 0.12rem 0.5rem;
      background: #000;
      pointer-events: none;
      opacity: 0;
    }
    @keyframes n5-lang-flash {
      0%   { opacity: 1; }
      40%  { opacity: 1; }
      100% { opacity: 0; }
    }
    #n5-lang-flash.active {
      animation: n5-lang-flash 0.5s ease-out forwards;
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

  const langFlash = document.createElement('div');
  langFlash.id = 'n5-lang-flash';
  document.body.appendChild(langFlash);

  const LANG_ORDER = ['es', 'ca', 'en'];
  const LANG_LABEL = { es: 'ESP', ca: 'CAT', en: 'ENG' };

  function updateLangIndicator() {
    const cur = localStorage.getItem('lang') || 'es';
    langIndicator.textContent = LANG_LABEL[cur] || cur.toUpperCase();
  }

  function flashLangIndicator() {
    langFlash.textContent = langIndicator.textContent;
    langFlash.classList.remove('active');
    void langFlash.offsetWidth;
    langFlash.classList.add('active');
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
    flashLangIndicator();
  }

  updateLangIndicator();

  /* ── tap label (móvil) ───────────────────────────────────────────────── */
  const tapLabel = document.createElement('div');
  tapLabel.id = 'n5-tap-label';
  document.body.appendChild(tapLabel);
  let _tapTimer = null;

  function positionLabel(btnEl) {
    const rect = btnEl.getBoundingClientRect();
    tapLabel.style.left = (rect.left + rect.width / 2) + 'px';
    tapLabel.style.top  = (rect.bottom + 14) + 'px';
  }

  function showTapLabel(text, btnEl, action) {
    tapLabel.textContent = text;
    positionLabel(btnEl);
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

    el.addEventListener('mouseenter', () => {
      setCursor(def.cursor);
      if (window.innerWidth > 900) {
        tapLabel.textContent = getTapLabel(def.idx);
        positionLabel(el);
        tapLabel.classList.add('visible');
      }
    });
    el.addEventListener('mouseleave', () => {
      setCursor(null);
      if (window.innerWidth > 900) tapLabel.classList.remove('visible');
    });
    el.addEventListener('click', e => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        showTapLabel(getTapLabel(def.idx), el, () => {
          if (def.onclick) def.onclick();
          else if (def.href) window.location.href = def.href;
        });
      } else if (def.onclick) {
        e.preventDefault();
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

  /* ── about / CV popup ───────────────────────────────────────────────── */
  const aboutStyle = document.createElement('style');
  aboutStyle.textContent = `
    #n5-about-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9000;
    }
    #n5-about-overlay.open { display: flex; align-items: center; justify-content: center; padding-top: 4.5rem; }
    #n5-about-box {
      background: #05ff00;
      width: 36vw;
      max-height: 90vh;
      overflow: auto;
      display: flex;
      flex-direction: column;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
    }
    #n5-about-top {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-shrink: 0;
    }
    #n5-about-close {
      background: none; border: none;
      cursor: none;
      color: rgba(0,0,0,0.85);
      padding: 0;
      display: block;
    }
    #n5-about-close svg { width: 5.2em; height: 5.2em; display: block; font-size: 0.9rem; }
    #n5-about-box img { width: 100%; height: auto; display: block; }
    #n5-about-contact {
      padding: 0.5rem;
      font-size: 0.75rem;
      line-height: 1.4;
    }
    #n5-about-contact a {
      color: #000 !important;
      text-decoration: none;
      display: block;
    }
    #n5-about-contact a:visited { color: #000 !important; }
    #n5-about-contact a:hover   { color: #000 !important; }
    #n5-about-contact a:active  { color: #000 !important; }
    #n5-copy-label {
      position: fixed;
      pointer-events: none;
      z-index: 10010;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 0.75rem;
      line-height: 1.5;
      background: #000;
      color: #fff;
      padding: 0.3em 0.5em;
      white-space: nowrap;
      display: none;
    }
    #n5-copy-label.active { display: block; }
    @media (max-width: 900px) {
      #n5-about-box { width: 90vw; }
      #n5-copy-label { display: none !important; }
    }
  `;
  document.head.appendChild(aboutStyle);

  const copyLabel = document.createElement('div');
  copyLabel.id = 'n5-copy-label';
  document.body.appendChild(copyLabel);

  const aboutOverlay = document.createElement('div');
  aboutOverlay.id = 'n5-about-overlay';
  aboutOverlay.innerHTML = `
    <div id="n5-about-box">
      <div id="n5-about-top">
        <button id="n5-about-close" aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="7.21 7.21 17.59 17.59">
            <path fill="currentColor" d="M 8.51 7.21 L 7.21 8.51 L 14.72 16.00 L 7.21 23.52 L 8.48 24.80 L 15.99 17.30 L 23.48 24.80 L 24.77 23.50 L 17.27 16.00 L 24.80 8.48 L 23.52 7.21 L 15.99 14.72 L 8.51 7.21 Z"/>
          </svg>
        </button>
      </div>
      <img src="/img/CV.jpg" alt="">
      <div id="n5-about-contact">
        <a href="mailto:mateucho.04@gmail.com" data-copy="mateucho.04@gmail.com">mateucho.04@gmail.com</a>
        <a href="https://www.instagram.com/mateoprado" target="_blank">@mateoprado</a>
        <a href="tel:+34650165341" data-copy="+34650165341">+34 650 165 341</a>
      </div>
    </div>
  `;
  document.body.appendChild(aboutOverlay);

  document.getElementById('n5-about-close').addEventListener('click', () => {
    aboutOverlay.classList.remove('open');
  });

  aboutOverlay.addEventListener('click', e => {
    if (e.target === aboutOverlay) aboutOverlay.classList.remove('open');
  });

  aboutOverlay.addEventListener('mousemove', e => {
    const dot = document.getElementById('cursor-dot');
    if (dot) { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; }
    copyLabel.style.left = (e.clientX + 14) + 'px';
    copyLabel.style.top  = (e.clientY - 10) + 'px';
  });

  const aboutBox = document.getElementById('n5-about-box');
  const aboutClose = document.getElementById('n5-about-close');
  aboutOverlay.addEventListener('mouseenter', () => setCursor('cross'));
  aboutOverlay.addEventListener('mouseleave', () => setCursor(null));
  aboutBox.addEventListener('mouseenter', () => setCursor(null));
  aboutBox.addEventListener('mouseleave', () => setCursor('cross'));
  aboutClose.addEventListener('mouseenter', () => setCursor('cross'));
  aboutClose.addEventListener('mouseleave', () => setCursor(null));

  const COPY_WORDS = {
    es: { copy: 'copiar',  copied: 'copiado' },
    en: { copy: 'copy',    copied: 'copied'  },
    ca: { copy: 'copiar',  copied: 'copiat'  },
  };
  function getCopyWord(key) {
    const lang = localStorage.getItem('lang') || 'es';
    return (COPY_WORDS[lang] || COPY_WORDS.es)[key];
  }

  const instaLink = aboutOverlay.querySelector('#n5-about-contact a:not([data-copy])');
  if (instaLink) {
    instaLink.addEventListener('mouseenter', () => setCursor('plus'));
    instaLink.addEventListener('mouseleave', () => setCursor(null));
  }

  aboutOverlay.querySelectorAll('#n5-about-contact [data-copy]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      setCursor('square');
      copyLabel.textContent = getCopyWord('copy');
      copyLabel.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      setCursor(null);
      copyLabel.classList.remove('active');
    });
    el.addEventListener('click', e => {
      e.preventDefault();
      const original = el.dataset.copy;
      navigator.clipboard.writeText(original).catch(() => {});
      el.textContent = getCopyWord('copied');
      setTimeout(() => { el.textContent = original; }, 1500);
    });
  });

  window.openCV = function () {
    aboutOverlay.classList.add('open');
    aboutOverlay.scrollTop = 0;
  };

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
