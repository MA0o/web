(function () {

  const BASE = (document.currentScript || {src:''}).src.replace(/js\/contact\.js.*$/, '');

  const style = document.createElement('style');
  style.textContent = `
    #ct-overlay {
      position: fixed; inset: 0; z-index: 9998;
      display: none; align-items: center; justify-content: center;
    }
    #ct-overlay.open { display: flex; }

    #ct-box {
      display: flex;
      flex-direction: column;
      width: 280px;
      background: #ffdf41;
    }

    /* row 1: close button, right-aligned */
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

    /* row 2: image, fills popup width */
    #ct-img {
      width: 100%;
      display: block;
      flex-shrink: 0;
    }

    /* row 3: info, left-aligned, fills remaining height */
    #ct-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0.8rem 1rem 1rem;
      gap: 0.2em;
      font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
      font-size: 0.75rem;
      line-height: 1.4;
      color: #000eff;
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

  // once image loads, set popup height = 2× width + header
  const img = document.getElementById('ct-img');
  const box = document.getElementById('ct-box');
  function setHeight() {
    const w = box.offsetWidth;
    const headerH = document.getElementById('ct-header').offsetHeight;
    box.style.height = (w * 2 + headerH) + 'px';
  }
  if (img.complete) setHeight();
  else img.addEventListener('load', setHeight);

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

})();
