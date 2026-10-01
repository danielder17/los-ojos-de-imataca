/* ============================================================================
   Efectos de interfaz portados de ReactBits (MIT)
   https://github.com/DavidHDev/react-bits
   Versión vanilla (sin React) para que el atlas corra como página local, sin
   compilación ni dependencias: ClickSpark, SpotlightCard, Magnet, DecryptedText
   y CountUp. La parte visual de GradientText, ShinyText, StarBorder y
   GlareHover vive en el CSS del atlas y se activa con clases.
============================================================================ */
window.EFECTOS = (function () {
  'use strict';

  /* ------------------------------------------------- ClickSpark (ReactBits) */
  function clickSpark(opciones) {
    const o = Object.assign({
      color: '#00d4ff', size: 11, radio: 16, cuentas: 8, duracion: 420, escala: 1
    }, opciones || {});
    const lienzo = document.createElement('canvas');
    lienzo.className = 'capa-chispas';
    document.body.appendChild(lienzo);
    const ctx = lienzo.getContext('2d');
    let chispas = [], animando = false;

    function ajustar() {
      const dpr = window.devicePixelRatio || 1;
      lienzo.width = window.innerWidth * dpr;
      lienzo.height = window.innerHeight * dpr;
      lienzo.style.width = window.innerWidth + 'px';
      lienzo.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ajustar();
    window.addEventListener('resize', ajustar);

    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function dibujar(t) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      chispas = chispas.filter(c => t - c.t0 < o.duracion);
      for (const c of chispas) {
        const e = easeOut((t - c.t0) / o.duracion);
        const radio = o.radio * e * o.escala;
        const difuminado = 1 - e;
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, Math.max(1, radio + o.size));
        grad.addColorStop(0, 'rgba(255,255,255,' + difuminado + ')');
        grad.addColorStop(0.4, o.color.replace(')', ', ' + difuminado + ')').replace('rgb', 'rgba'));
        grad.addColorStop(1, 'rgba(0,212,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < o.cuentas; i++) {
          const ang = (Math.PI * 2 / o.cuentas) * i;
          const dx = Math.cos(ang), dy = Math.sin(ang);
          ctx.moveTo(c.x + radio * dx, c.y + radio * dy);
          ctx.lineTo(c.x + (radio + o.size) * dx, c.y + (radio + o.size) * dy);
        }
        ctx.stroke();
      }
      if (chispas.length) { requestAnimationFrame(dibujar); } else { animando = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    }
    window.addEventListener('pointerdown', ev => {
      chispas.push({ x: ev.clientX, y: ev.clientY, t0: performance.now() });
      if (!animando) { animando = true; requestAnimationFrame(dibujar); }
    });
    return { disparar: (x, y) => { chispas.push({ x, y, t0: performance.now() }); if (!animando) { animando = true; requestAnimationFrame(dibujar); } } };
  }

  /* ------------------------------------------------ SpotlightCard (ReactBits) */
  function spotlight(contenedor) {
    const raiz = typeof contenedor === 'string' ? document.querySelector(contenedor) : contenedor;
    if (!raiz) return;
    raiz.addEventListener('pointermove', ev => {
      const tarjeta = ev.target.closest('.card-spotlight');
      if (!tarjeta || !raiz.contains(tarjeta)) return;
      const r = tarjeta.getBoundingClientRect();
      tarjeta.style.setProperty('--mouse-x', ((ev.clientX - r.left) / r.width * 100) + '%');
      tarjeta.style.setProperty('--mouse-y', ((ev.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ------------------------------------------------------- Magnet (ReactBits) */
  function magnet(elemento, fuerza) {
    if (!elemento) return;
    const f = fuerza === undefined ? 0.28 : fuerza;
    const relleno = 26;
    elemento.classList.add('imantado');
    elemento.addEventListener('pointermove', ev => {
      const r = elemento.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = ev.clientX - cx, dy = ev.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const limite = Math.max(r.width, r.height) / 2 + relleno;
      const k = Math.max(0, 1 - dist / limite) * f;
      elemento.style.transform = 'translate(' + (dx * k).toFixed(2) + 'px,' + (dy * k).toFixed(2) + 'px)';
    });
    elemento.addEventListener('pointerleave', () => { elemento.style.transform = 'translate(0,0)'; });
  }

  /* ------------------------------------------------- DecryptedText (ReactBits) */
  const GLIFOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑ0123456789·/#%&@$';
  function decrypted(elemento, textoFinal, opciones) {
    const o = Object.assign({ velocidad: 34, revelado: 26 }, opciones || {});
    if (!elemento) return;
    const objetivo = textoFinal === undefined ? elemento.dataset.texto || elemento.textContent : textoFinal;
    elemento.dataset.texto = objetivo;
    let i = 0;
    if (elemento._temporizador) clearInterval(elemento._temporizador);
    elemento._temporizador = setInterval(() => {
      const revelados = Math.floor(i * o.revelado / 100);
      let salida = objetivo.slice(0, revelados);
      for (let j = revelados; j < objetivo.length; j++) {
        salida += objetivo[j] === ' ' ? ' ' : GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
      }
      elemento.textContent = salida;
      i++;
      if (revelados >= objetivo.length) { clearInterval(elemento._temporizador); elemento.textContent = objetivo; }
    }, o.velocidad);
  }

  /* ---------------------------------------------------------- CountUp (ReactBits) */
  function contar(elemento, valor, decimales, sufijo, duracion) {
    if (valor === null || valor === undefined || valor === '' || isNaN(valor)) { elemento.textContent = '—'; return; }
    const destino = Number(valor), inicio = performance.now();
    const dur = duracion || 700;
    const formato = v => Number(v).toLocaleString('es-ES',
      { minimumFractionDigits: decimales || 0, maximumFractionDigits: decimales || 0 });
    function paso(t) {
      const k = Math.min(1, (t - inicio) / dur), e = 1 - Math.pow(1 - k, 3);
      elemento.textContent = formato(destino * e) + (sufijo || '');
      if (k < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  /* ------------------------------------------- fondo Aurora (ReactBits) para la pantalla de carga */
  function aurora(lienzo) {
    if (!lienzo) return;
    const ctx = lienzo.getContext('2d');
    let t = 0, activo = true;
    const colores = [[0, 212, 255], [139, 124, 246], [45, 212, 191]];
    const manchas = colores.map((c, i) => ({ c, fase: i * 2.1, r: 0.42 + i * 0.07 }));
    function ajustar() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      lienzo.width = lienzo.clientWidth * dpr;
      lienzo.height = lienzo.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ajustar();
    window.addEventListener('resize', ajustar);
    function pintar() {
      if (!activo) return;
      const w = lienzo.clientWidth, h = lienzo.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const m of manchas) {
        const cx = w * (0.5 + 0.34 * Math.sin(t * 0.00042 + m.fase));
        const cy = h * (0.5 + 0.26 * Math.cos(t * 0.00031 + m.fase * 1.7));
        const rad = Math.max(w, h) * m.r;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, 'rgba(' + m.c[0] + ',' + m.c[1] + ',' + m.c[2] + ',0.20)');
        g.addColorStop(1, 'rgba(' + m.c[0] + ',' + m.c[1] + ',' + m.c[2] + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = 'source-over';
      t += 16;
      requestAnimationFrame(pintar);
    }
    requestAnimationFrame(pintar);
    return { parar: () => { activo = false; } };
  }

  return { clickSpark, spotlight, magnet, decrypted, contar, aurora };
})();
