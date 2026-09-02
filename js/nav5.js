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

    /* ── dropdown de idioma ───────────────────────────────────────────── */
    #n5-lang-dd {
      position: fixed;
      z-index: 9999;
      background: #000;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.35em 0.7em 0.45em;
      gap: 0.25em;
      border-radius: 0 0 12px 12px;
      transform-origin: top center;
      transform: translateX(-50%) scaleY(0);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.18s ease, opacity 0.12s ease;
    }
    #n5-lang-dd.open {
      transform: translateX(-50%) scaleY(1);
      opacity: 1;
      pointer-events: auto;
    }
    .n5-lang-opt {
      background: none;
      border: none;
      color: #fff;
      white-space: nowrap;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 1em;
      cursor: none;
      padding: 0;
      line-height: 1.3;
      opacity: 0.45;
      transition: opacity 0.15s;
    }
    .n5-lang-opt:hover { opacity: 0.75; }
    .n5-lang-opt.active { opacity: 1; font-weight: 700; }
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

  /* ── dropdown idioma ─────────────────────────────────────────────────── */
  const langDD = document.createElement('div');
  langDD.id = 'n5-lang-dd';
  langDD.innerHTML = `
    <button class="n5-lang-opt" data-lang="ca">CAT</button>
    <button class="n5-lang-opt" data-lang="es">ESP</button>
    <button class="n5-lang-opt" data-lang="en">ENG</button>
  `;
  document.body.appendChild(langDD);

  function openLang() {
    const btn3 = document.getElementById('n5-btn-3');
    if (btn3) {
      const r = btn3.getBoundingClientRect();
      langDD.style.left = (r.left + r.width / 2) + 'px';
      langDD.style.top  = navEl.getBoundingClientRect().bottom + 'px';
    }
    updateLangActive();
    hideLabel();
    langDD.classList.add('open');
  }
  function closeLang() { langDD.classList.remove('open'); }

  function updateLangActive() {
    const cur = localStorage.getItem('lang') || 'es';
    langDD.querySelectorAll('.n5-lang-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === cur);
    });
  }

  langDD.querySelectorAll('.n5-lang-opt').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const lang = btn.dataset.lang;
      localStorage.setItem('lang', lang);
      if (typeof window.applyLang === 'function') {
        window.applyLang(lang);
      } else {
        const link = document.querySelector(`.lang-link[data-lang="${lang}"]`);
        if (link) link.click();
      }
      updateLangActive();
      closeLang();
    });
  });

  document.addEventListener('click', e => {
    if (!langDD.contains(e.target) && e.target.id !== 'n5-btn-3' && !e.target.closest('#n5-btn-3')) closeLang();
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

    el.addEventListener('mouseenter', () => {
      setCursor(def.cursor);
      if (!(i === 3 && langDD.classList.contains('open'))) showLabel(def.text);
    });
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
