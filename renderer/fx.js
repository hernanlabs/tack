const FX_PARTICLE_PALETTE = [
    'rgb(74, 158, 255)',
    'rgb(100, 200, 255)',
    'rgb(64, 145, 108)',
    'rgb(147, 197, 255)'
];

const fxLayers = {
    menu: {
        hostId: 'menuParticlesHost',
        canvasId: 'menuParticles',
        ctx: null,
        running: false
    },
    prod: {
        hostId: 'prodParticlesHost',
        canvasId: 'prodParticles',
        ctx: null,
        particles: [],
        running: false,
        linkMax: 92,
        areaDiv: 2200,
        minN: 24,
        maxN: 58
    }
};

let fxParticlesRaf = null;

function resizeFxLayer(key) {
    const L = fxLayers[key];
    const host = document.getElementById(L.hostId);
    const cv = document.getElementById(L.canvasId);
    if (!host || !cv) return;
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w < 2 || h < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(h * dpr);
    cv.style.width = `${w}px`;
    cv.style.height = `${h}px`;
    L.ctx = cv.getContext('2d');
    L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (key === 'menu') return;
    spawnFxLayer(key, w, h);
}

function spawnFxLayer(key, w, h) {
    const L = fxLayers[key];
    if (key === 'menu') return;
    const n = Math.min(L.maxN, Math.max(L.minN, Math.floor((w * h) / L.areaDiv)));
    L.particles = [];
    for (let i = 0; i < n; i++) {
        L.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.48,
            vy: -0.32 - Math.random() * 0.52,
            r: 0.55 + Math.random() * 1.45,
            phase: Math.random() * Math.PI * 2,
            pulse: 0.55 + Math.random() * 0.45,
            color: FX_PARTICLE_PALETTE[i % FX_PARTICLE_PALETTE.length]
        });
    }
}

function stepAndDrawMenuControlHud() {
    const L = fxLayers.menu;
    const ctx = L.ctx;
    const cv = document.getElementById(L.canvasId);
    if (!ctx || !cv) return;
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    const t = performance.now() * 0.001;

    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.4;
    const rBase = Math.min(w, h) * 0.21;
    const horizonY = h * 0.3;

    ctx.lineWidth = 0.5;
    for (let i = -10; i <= 10; i++) {
        const bias = i / 10;
        const xBottom = cx + bias * w * 0.95;
        ctx.strokeStyle = `rgba(45, 106, 79, ${0.05 + Math.abs(bias) * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(cx, horizonY);
        ctx.lineTo(xBottom, h + 8);
        ctx.stroke();
    }
    for (let g = 0; g < 11; g++) {
        const tr = g / 11;
        const y = horizonY + (h - horizonY) * tr;
        const span = w * 0.12 + tr * w * 0.86;
        ctx.strokeStyle = `rgba(74, 158, 255, ${0.04 + tr * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(cx - span / 2, y);
        ctx.lineTo(cx + span / 2, y);
        ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.11);
    ctx.strokeStyle = 'rgba(74, 158, 255, 0.24)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 11]);
    ctx.beginPath();
    ctx.arc(0, 0, rBase, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(0.9);
    ctx.strokeStyle = 'rgba(64, 145, 108, 0.2)';
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.arc(0, 0, rBase * 0.74, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    const pulse = 0.5 + 0.5 * Math.sin(t * 2.1);
    ctx.strokeStyle = `rgba(147, 197, 255, ${0.22 + pulse * 0.38})`;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.arc(cx, cy, rBase * (0.27 + pulse * 0.045), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(45, 106, 79, ${0.05 + pulse * 0.08})`;
    ctx.beginPath();
    ctx.arc(cx, cy, rBase * 0.11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(74, 158, 255, 0.22)';
    ctx.lineWidth = 0.5;
    const arm = rBase * 0.52;
    ctx.beginPath();
    ctx.moveTo(cx - arm, cy);
    ctx.lineTo(cx - rBase * 0.3, cy);
    ctx.moveTo(cx + rBase * 0.3, cy);
    ctx.lineTo(cx + arm, cy);
    ctx.moveTo(cx, cy - arm);
    ctx.lineTo(cx, cy - rBase * 0.3);
    ctx.moveTo(cx, cy + rBase * 0.3);
    ctx.lineTo(cx, cy + arm);
    ctx.stroke();

    const scanY = (t * 42) % (h + 80) - 40;
    const sg = ctx.createLinearGradient(0, scanY - 28, 0, scanY + 28);
    sg.addColorStop(0, 'rgba(74, 158, 255, 0)');
    sg.addColorStop(0.48, 'rgba(74, 158, 255, 0.07)');
    sg.addColorStop(0.52, 'rgba(147, 197, 255, 0.09)');
    sg.addColorStop(1, 'rgba(74, 158, 255, 0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 28, w, 56);

    const inset = 16;
    const Ln = 24;
    const bPulse = 0.28 + 0.32 * Math.sin(t * 1.7);
    ctx.strokeStyle = `rgba(74, 158, 255, ${0.3 + bPulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(inset + Ln, inset);
    ctx.lineTo(inset, inset);
    ctx.lineTo(inset, inset + Ln);
    ctx.moveTo(w - inset - Ln, inset);
    ctx.lineTo(w - inset, inset);
    ctx.lineTo(w - inset, inset + Ln);
    ctx.moveTo(inset, h - inset - Ln);
    ctx.lineTo(inset, h - inset);
    ctx.lineTo(inset + Ln, h - inset);
    ctx.moveTo(w - inset, h - inset - Ln);
    ctx.lineTo(w - inset, h - inset);
    ctx.lineTo(w - inset - Ln, h - inset);
    ctx.stroke();

    const bars = 8;
    const barW = 3;
    const stackH = h * 0.34;
    const stackTop = h * 0.36;
    for (let side = 0; side < 2; side++) {
        const x0 = side === 0 ? inset + 2 : w - inset - barW - 2;
        for (let b = 0; b < bars; b++) {
            const phase = t * 2.8 + b * 0.85 + side * 1.1;
            const level = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(phase));
            const gap = stackH / bars;
            const bh = gap * 0.68 * level;
            const by = stackTop + b * gap + (gap * 0.32 - bh * 0.5);
            ctx.fillStyle =
                side === 0
                    ? `rgba(64, 145, 108, ${0.12 + level * 0.38})`
                    : `rgba(74, 158, 255, ${0.12 + level * 0.38})`;
            ctx.fillRect(x0, by, barW, bh);
        }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
    ctx.lineWidth = 0.5;
    for (let k = 0; k < 32; k++) {
        const ang = (k / 32) * Math.PI * 2 + t * 0.07;
        const r1 = rBase * 0.9;
        const r2 = rBase * 0.97;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
        ctx.stroke();
    }
}

function stepAndDrawFxLayer(key) {
    const L = fxLayers[key];
    if (!L.ctx) return;
    const cv = document.getElementById(L.canvasId);
    if (!cv) return;
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    L.ctx.clearRect(0, 0, w, h);

    const linkMax = L.linkMax;
    for (let i = 0; i < L.particles.length; i++) {
        for (let j = i + 1; j < L.particles.length; j++) {
            const a = L.particles[i];
            const b = L.particles[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < linkMax) {
                const alpha = (1 - d / linkMax) * 0.18;
                L.ctx.strokeStyle = `rgba(74, 158, 255, ${alpha})`;
                L.ctx.lineWidth = 0.45;
                L.ctx.beginPath();
                L.ctx.moveTo(a.x, a.y);
                L.ctx.lineTo(b.x, b.y);
                L.ctx.stroke();
            }
        }
    }

    for (const p of L.particles) {
        p.phase += 0.052;
        p.x += p.vx + Math.sin(p.phase) * 0.2;
        p.y += p.vy;
        if (p.y < -6) {
            p.y = h + 6;
            p.x = Math.random() * w;
        }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;

        const tw = 0.5 + 0.5 * Math.sin(p.phase * p.pulse);
        L.ctx.globalAlpha = 0.2 + tw * 0.5;
        L.ctx.fillStyle = p.color;
        L.ctx.beginPath();
        L.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        L.ctx.fill();
        L.ctx.globalAlpha = 1;
    }
}

function tickFxParticles() {
    fxParticlesRaf = null;
    const keepAlive = fxLayers.menu.running || fxLayers.prod.running;

    for (const key of ['menu', 'prod']) {
        const L = fxLayers[key];
        if (!L.running) continue;
        if (!L.ctx) resizeFxLayer(key);
        if (L.ctx) {
            if (key === 'menu') stepAndDrawMenuControlHud();
            else stepAndDrawFxLayer(key);
        }
    }

    if (keepAlive) {
        fxParticlesRaf = requestAnimationFrame(tickFxParticles);
    }
}

function startFxLoop() {
    if (!fxParticlesRaf) {
        fxParticlesRaf = requestAnimationFrame(tickFxParticles);
    }
}

function stopFxLoopIfIdle() {
    if (!fxLayers.menu.running && !fxLayers.prod.running && fxParticlesRaf) {
        cancelAnimationFrame(fxParticlesRaf);
        fxParticlesRaf = null;
    }
}

function clearFxLayer(key) {
    const L = fxLayers[key];
    const cv = document.getElementById(L.canvasId);
    if (cv && L.ctx) {
        L.ctx.clearRect(0, 0, cv.width, cv.height);
    }
}

function setFxLayerActive(key, on) {
    const reduceMotion =
        typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showFx = on && !reduceMotion;
    const L = fxLayers[key];

    if (!showFx) {
        L.running = false;
        clearFxLayer(key);
        stopFxLoopIfIdle();
        return;
    }

    resizeFxLayer(key);
    L.running = true;
    startFxLoop();
}

function setMenuParticlesActive(on) {
    setFxLayerActive('menu', on);
}

function setProductivityParticlesActive(on) {
    setFxLayerActive('prod', on);
}

function setupFxParticles() {
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
        for (const e of entries) {
            const id = e.target.id;
            if (id === 'menuParticlesHost' && fxLayers.menu.running) resizeFxLayer('menu');
            if (id === 'prodParticlesHost' && fxLayers.prod.running) resizeFxLayer('prod');
        }
    });
    const hMenu = document.getElementById('menuParticlesHost');
    const hProd = document.getElementById('prodParticlesHost');
    if (hMenu) ro.observe(hMenu);
    if (hProd) ro.observe(hProd);
}

module.exports = {
    setMenuParticlesActive,
    setProductivityParticlesActive,
    setupFxParticles
};
