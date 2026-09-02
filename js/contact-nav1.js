(function () {

  const style = document.createElement('style');
  style.textContent = `
    nav {
      overflow: hidden;
      transition: height 0.6s cubic-bezier(0.77, 0, 0.175, 1);
    }
    nav.ct-open { height: 100dvh !important; }

    .nav-logo {
      transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1);
    }
    nav.ct-open .nav-logo {
      transform: translateX(-50%) scale(10) !important;
      pointer-events: none;
    }

    .nav-links, .nav-lang {
      transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1);
    }
    nav.ct-open .nav-links { transform: translateY(var(--ct-links-ty, 0)) !important; }
    nav.ct-open .nav-lang  { transform: translateY(var(--ct-lang-ty,  0)) !important; }

    #ct-info {
      position: fixed;
      left: 0; right: 0;
      bottom: 5rem;
      z-index: 9999;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5em;
      pointer-events: none;
    }
    #ct-info.open { display: flex; }
    #ct-info a, #ct-info span {
      font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
      font-size: 1rem;
      line-height: 1.5;
      background: #000;
      color: #fff;
      padding: 0.1em 0.4em;
      text-decoration: none;
      cursor: none;
      pointer-events: auto;
      display: inline;
    }

    #cursor-dot.cross {
      border-radius: 0;
      -webkit-mask: none; mask: none;
      clip-path: polygon(
        35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,
        65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%
      );
      transform: translate(-50%, -50%) rotate(45deg);
    }
    #cursor-dot.plus {
      border-radius: 0;
      -webkit-mask: none; mask: none;
      clip-path: polygon(
        35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,
        65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%
      );
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

  const navEl = document.querySelector('nav');
  if (!navEl) return;

  const ctInfo = document.createElement('div');
  ctInfo.id = 'ct-info';
  ctInfo.innerHTML = `
    <a href="https://www.instagram.com/mateoprado/" target="_blank">@mateoprado</a>
    <span data-copy="mateucho.04@gmail.com">mateucho.04@gmail.com</span>
    <span data-copy="+34 650165341">+34 650165341</span>
  `;
  document.body.appendChild(ctInfo);

  const copyTip = document.createElement('div');
  copyTip.id = 'ct-copy-tip';
  copyTip.textContent = 'copiar';
  document.body.appendChild(copyTip);

  const CUR_ALL = ['triangle-right','triangle-left','cross','magnify','plus','square'];
  function setCursor(cls) {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;
    CUR_ALL.forEach(c => dot.classList.remove(c));
    if (cls) dot.classList.add(cls);
  }

  document.addEventListener('mouseover', (e) => {
    if (!navEl.classList.contains('ct-open')) return;
    if (ctInfo.contains(e.target)) return;
    setCursor('cross');
  }, true);

  ctInfo.querySelector('a').addEventListener('mouseenter', () => setCursor('plus'));
  ctInfo.querySelector('a').addEventListener('mouseleave', () => {
    if (navEl.classList.contains('ct-open')) setCursor('cross');
  });

  ctInfo.querySelectorAll('[data-copy]').forEach(span => {
    span.addEventListener('mouseenter', () => { copyTip.style.display = 'block'; setCursor('square'); });
    span.addEventListener('mousemove', e => {
      copyTip.style.left = (e.clientX + 14) + 'px';
      copyTip.style.top  = (e.clientY - 10) + 'px';
    });
    span.addEventListener('mouseleave', () => {
      copyTip.style.display = 'none';
      if (navEl.classList.contains('ct-open')) setCursor('cross');
    });
    span.addEventListener('click', () => {
      navigator.clipboard.writeText(span.dataset.copy).catch(() => {});
    });
  });

  let infoTimer = null;

  function open() {
    if (navEl.classList.contains('ct-open')) return;

    const navH    = navEl.getBoundingClientRect().height;
    const viewH   = window.innerHeight;
    const logoEl  = navEl.querySelector('.nav-logo');
    const linksEl = navEl.querySelector('.nav-links');
    const langEl  = navEl.querySelector('.nav-lang');

    if (logoEl) {
      logoEl.style.transition = 'none';
      logoEl.style.height          = navH + 'px';
      logoEl.style.top             = '0';
      logoEl.style.transform       = 'translateX(-50%)';
      logoEl.style.transformOrigin = '50% 0%';
      void logoEl.getBoundingClientRect();
      logoEl.style.transition = '';
    }

    if (linksEl) {
      const r = linksEl.getBoundingClientRect();
      navEl.style.setProperty('--ct-links-ty', (viewH - r.bottom) + 'px');
    }
    if (langEl) {
      const r = langEl.getBoundingClientRect();
      navEl.style.setProperty('--ct-lang-ty', (viewH - r.bottom) + 'px');
    }

    // Posicionar ctInfo justo debajo de la cara al 1000%
    const faceBottom = navH * 10;
    const infoTop    = Math.min(faceBottom + 24, viewH - 120);
    ctInfo.style.top    = infoTop + 'px';
    ctInfo.style.bottom = 'auto';

    navEl.style.height = navH + 'px';
    requestAnimationFrame(() => {
      navEl.classList.add('ct-open');
    });

    infoTimer = setTimeout(() => ctInfo.classList.add('open'), 480);
    setCursor('cross');
  }

  function close() {
    clearTimeout(infoTimer);
    navEl.classList.remove('ct-open');
    ctInfo.classList.remove('open');
    copyTip.style.display = 'none';
    setCursor(null);

    ctInfo.style.top    = '';
    ctInfo.style.bottom = '';

    setTimeout(() => {
      if (navEl.classList.contains('ct-open')) return;
      const logoEl = navEl.querySelector('.nav-logo');
      navEl.style.height = '';
      if (logoEl) {
        logoEl.style.height = '';
        logoEl.style.top = '';
        logoEl.style.transform = '';
        logoEl.style.transformOrigin = '';
      }
    }, 680);
  }

  navEl.addEventListener('click', (e) => {
    if (navEl.classList.contains('ct-open') && !ctInfo.contains(e.target)) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  document.querySelectorAll('a[data-i18n="nav-contact"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); open(); });
  });

  // ── About: flecha curva ───────────────────────────────────────────────────
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
    const nR = navEl.getBoundingClientRect();
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const x1 = aR.right + 3, y1 = (aR.top + aR.bottom) / 2, x2 = lR.left;
    const yTop = nR.top + 3, yBot = nR.bottom - 3;
    const yMid = (yTop + yBot) / 2, yRange = (yBot - yTop) / 2;
    const yAmp = yRange * 0.52, B2 = yAmp * 0.55;
    const LOOPS = 3 + Math.floor(Math.random() * 3);
    const l2opts = {3:[4,5],4:[3,5],5:[3,4]};
    const LOOPS2 = l2opts[LOOPS][Math.floor(Math.random() * 2)];
    const totalX = x2 - x1, A1 = totalX / (2 * Math.PI * LOOPS) * 1.9;
    const tRamp = Math.min(0.3, (remPx * 7) / totalX);
    const env  = t => t < tRamp ? Math.pow(t / tRamp, 2) : 1;
    const rp   = () => Math.random() * Math.PI * 2;
    const nx   = [[1.1,rp(),0.35],[2.7,rp(),0.14],[4.3,rp(),0.05]];
    const ny   = [[0.8,rp(),0.38],[2.2,rp(),0.13],[3.7,rp(),0.05]];
    const sn   = (t,s) => s.reduce((a,[f,p,w])=>a+w*Math.sin(2*Math.PI*f*t+p),0);
    const fade = t => (1-Math.pow(1-t,3))*(1-Math.pow(t,3));
    const jx = totalX*0.01, jy = yRange*0.05;
    const N=300, pts=[];
    for (let i=0;i<=N;i++){
      const t=i/N,e=env(t),blend=Math.min(1,t/tRamp);
      const ph1=2*Math.PI*LOOPS*t,ph2=2*Math.PI*LOOPS2*t,f=fade(t);
      pts.push([
        x1+totalX*t+A1*(Math.cos(ph1)-1)*e+sn(t,nx)*jx*f,
        Math.max(yTop,Math.min(yBot,y1+(yMid-y1)*blend+yAmp*Math.sin(ph1)*e-B2*Math.sin(ph2)*e+sn(t,ny)*jy*f))
      ]);
    }
    let d=`M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i=1;i<=N;i++) d+=` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.id='about-arrow-svg';
    svg.setAttribute('style','position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:visible;mix-blend-mode:difference');
    const clipId='about-nav-clip';
    const defs=document.createElementNS(ns,'defs');
    const clip=document.createElementNS(ns,'clipPath'); clip.id=clipId;
    const cr=document.createElementNS(ns,'rect');
    ['x','y','width','height'].forEach((a,i)=>cr.setAttribute(a,String([nR.left,nR.top,nR.width,nR.height][i])));
    clip.appendChild(cr); defs.appendChild(clip); svg.appendChild(defs);
    const g=document.createElementNS(ns,'g');
    g.setAttribute('clip-path',`url(#${clipId})`);
    const path=document.createElementNS(ns,'path');
    path.setAttribute('d',d); path.setAttribute('stroke','white');
    path.setAttribute('stroke-width','1.5'); path.setAttribute('stroke-linecap','round');
    path.setAttribute('fill','none');
    const head=document.createElementNS(ns,'polygon');
    head.setAttribute('fill','white'); head.setAttribute('points','0,0 0,0 0,0');
    g.appendChild(path); g.appendChild(head); svg.appendChild(g);
    document.body.appendChild(svg);
    const DRAW_MS=900+LOOPS*60, pathLen=path.getTotalLength();
    path.style.strokeDasharray=String(pathLen);
    path.style.strokeDashoffset=String(pathLen);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      path.style.transition=`stroke-dashoffset ${DRAW_MS}ms ease-in-out`;
      path.style.strokeDashoffset='0';
      const t0=performance.now(),ez=t=>t<0.5?2*t*t:-1+(4-2*t)*t,al=8,aw=4;
      (function animHead(now){
        const t=Math.min((now-t0)/DRAW_MS,1),len=ez(t)*pathLen;
        if(len>15){
          const tip=path.getPointAtLength(len),back=path.getPointAtLength(Math.max(0,len-14));
          const ang=Math.atan2(tip.y-back.y,tip.x-back.x);
          head.setAttribute('points',[
            `${tip.x.toFixed(1)},${tip.y.toFixed(1)}`,
            `${(tip.x-al*Math.cos(ang)+aw*Math.sin(ang)).toFixed(1)},${(tip.y-al*Math.sin(ang)-aw*Math.cos(ang)).toFixed(1)}`,
            `${(tip.x-al*Math.cos(ang)-aw*Math.sin(ang)).toFixed(1)},${(tip.y-al*Math.sin(ang)+aw*Math.cos(ang)).toFixed(1)}`
          ].join(' '));
        }
        if(t<1) requestAnimationFrame(animHead);
      })(performance.now());
    }));
    setTimeout(()=>{
      svg.style.transition='opacity 0.5s'; svg.style.opacity='0';
      setTimeout(()=>svg.remove(),500);
    },DRAW_MS+1500);
  }

  // ── Parpadeo del logo ─────────────────────────────────────────────────────
  const logo = document.querySelector('.nav-logo');
  const logoSrcA = logo ? logo.src : '';
  if (logo) {
    const srcB = logoSrcA.replace('logo-bnw.png', 'logo-bnw-p.png');
    new Image().src = srcB;
    setInterval(() => {
      logo.src = srcB;
      setTimeout(() => { logo.src = logoSrcA; }, 200);
    }, 5000);
    logo.addEventListener('click', () => { if (!navEl.classList.contains('ct-open')) open(); });
    logo.addEventListener('mouseenter', () => { if (!navEl.classList.contains('ct-open')) setCursor('square'); });
    logo.addEventListener('mouseleave', () => { if (!navEl.classList.contains('ct-open')) setCursor(null); });
  }

})();
