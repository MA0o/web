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
      height: 4.5rem !important;
      width: auto !important;
      flex-shrink: 0;
      cursor: none;
      filter: invert(1);
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
      nav {
        justify-content: space-evenly !important;
        top: auto !important;
        bottom: 0 !important;
      }
      .n5btn { margin: 0 !important; }
      #n5-lang-box { top: auto !important; bottom: 4.5rem !important; }
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

    #n5-label {
      position: fixed;
      pointer-events: none;
      z-index: 10003;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 1rem;
      line-height: 1.1;
      background: #000;
      color: #fff;
      padding: 0.1em 0.4em;
      white-space: nowrap;
      display: none;
      mix-blend-mode: difference;
    }

    /* ── popup de idioma ──────────────────────────────────────────────── */
    #n5-lang-overlay {
      position: fixed;
      inset: 0;
      z-index: 10001;
      display: none;
    }
    #n5-lang-overlay.open { display: block; }

    #n5-lang-box {
      /* ancho = X del CV (5.2em @ 0.9rem), alto = X × 2 */
      font-size: 0.9rem;
      position: absolute;
      top: 4.5rem;
      left: 50%;
      transform: translateX(-50%);
      width:  5.2em;
      height: 10.4em;
      background: #0000ff;
      color: #fff;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      display: flex;
      flex-direction: column;
    }

    #n5-lang-close {
      width: 5.2em;
      height: 5.2em;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: #fff;
      cursor: none;
      padding: 0;
    }
    #n5-lang-close svg { width: 5.2em; height: 5.2em; display: block; }

    #n5-lang-options {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.4em;
    }
    .n5-lang-opt {
      background: none;
      border: none;
      color: #fff;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 1em;
      cursor: none;
      padding: 0;
      line-height: 1.2;
      transition: opacity 0.15s;
    }
    .n5-lang-opt:hover { opacity: 0.6; }
    .n5-lang-opt.active { font-weight: 700; }
  `;
  document.head.appendChild(style);

  const navEl = document.querySelector('nav');
  const logo  = document.querySelector('.nav-logo');
  if (!navEl || !logo) return;

  /* ── label de cursor ─────────────────────────────────────────────────── */
  const labelEl = document.createElement('div');
  labelEl.id = 'n5-label';
  document.body.appendChild(labelEl);
  document.addEventListener('mousemove', e => {
    labelEl.style.left = (e.clientX + 20) + 'px';
    labelEl.style.top  = (e.clientY - 10) + 'px';
  });

  /* ── popup idioma ─────────────────────────────────────────────────────── */
  const langOverlay = document.createElement('div');
  langOverlay.id = 'n5-lang-overlay';
  langOverlay.innerHTML = `
    <div id="n5-lang-box">
      <button id="n5-lang-close" aria-label="Cerrar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="7.21 7.21 17.59 17.59">
          <path fill="currentColor" d="M 8.51 7.21 L 7.21 8.51 L 14.72 16.00 L 7.21 23.52 L 8.48 24.80 L 15.99 17.30 L 23.48 24.80 L 24.77 23.50 L 17.27 16.00 L 24.80 8.48 L 23.52 7.21 L 15.99 14.72 L 8.51 7.21 Z"/>
        </svg>
      </button>
      <div id="n5-lang-options">
        <button class="n5-lang-opt" data-lang="ca">CAT</button>
        <button class="n5-lang-opt" data-lang="es">ESP</button>
        <button class="n5-lang-opt" data-lang="en">ENG</button>
      </div>
    </div>
  `;
  document.body.appendChild(langOverlay);

  function openLang()  { langOverlay.classList.add('open');    updateLangActive(); }
  function closeLang() { langOverlay.classList.remove('open'); }

  function updateLangActive() {
    const cur = localStorage.getItem('lang') || 'es';
    langOverlay.querySelectorAll('.n5-lang-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === cur);
    });
  }

  langOverlay.querySelector('#n5-lang-close').addEventListener('click', closeLang);

  langOverlay.querySelectorAll('.n5-lang-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (typeof applyLang === 'function') applyLang(lang);
      else {
        const link = document.querySelector(`.lang-link[data-lang="${lang}"]`);
        if (link) link.click(); else localStorage.setItem('lang', lang);
      }
      updateLangActive();
      closeLang();
    });
  });

  langOverlay.addEventListener('click', e => {
    if (e.target === langOverlay) closeLang();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLang(); });

  /* ── cursor helpers ───────────────────────────────────────────────────── */
  const CUR_ALL = ['triangle-right','triangle-left','cross','magnify','plus','square','n5-triangle'];
  function setCursor(cls) {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;
    CUR_ALL.forEach(c => dot.classList.remove(c));
    if (cls) dot.classList.add(cls);
  }
  function showLabel(text) { labelEl.textContent = text; labelEl.style.display = 'block'; }
  function hideLabel()     { labelEl.style.display = 'none'; }

  /* ── botones ──────────────────────────────────────────────────────────── */
  const DEFS = [
    { href: '/index.html',   src: '/icons/menu/cuadrado.png',  cursor: 'square',      text: 'proyectos' },
    { href: null,            src: '/icons/menu/cruz.png',      cursor: 'cross',       text: 'sobre mí',
      onclick: () => { if (typeof openCV === 'function') openCV(); else window.location.href = '/index.html#cv'; } },
    { href: '/archivo.html', src: '/icons/menu/triangulo.png', cursor: 'n5-triangle', text: 'archivo'   },
    { href: null,            src: '/icons/menu/circulo.png',   cursor: null,          text: 'idioma',
      onclick: openLang },
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

    el.addEventListener('mouseenter', () => { setCursor(def.cursor); showLabel(def.text); });
    el.addEventListener('mouseleave', () => { setCursor(null); hideLabel(); });
    if (def.onclick) el.addEventListener('click', def.onclick);
    return el;
  });

  navEl.insertBefore(btns[0], logo);
  navEl.insertBefore(btns[1], logo);
  logo.insertAdjacentElement('afterend', btns[2]);
  btns[2].insertAdjacentElement('afterend', btns[3]);

  /* ── logo → home ─────────────────────────────────────────────────────── */
  logo.addEventListener('click', () => { window.location.href = '/index.html'; });
  logo.addEventListener('mouseenter', () => setCursor('square'));
  logo.addEventListener('mouseleave', () => { setCursor(null); hideLabel(); });

  /* ── imagen y parpadeo ────────────────────────────────────────────────── */
  const srcOpen   = '/icons/menu/perfil_abierto.png';
  const srcClosed = '/icons/menu/perfil_cerrado.png';
  logo.src = srcOpen;
  new Image().src = srcClosed;
  setInterval(() => {
    logo.src = srcClosed;
    setTimeout(() => { logo.src = srcOpen; }, 200);
  }, 5000);

})();
