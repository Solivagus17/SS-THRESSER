'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let animId = 0;
    let t = 0;

    // Resize
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initStars();
      initDust();
      initNebulas();
      initPlanets();
      initShootingStars();
    };

    // Stars (3 parallax layers)
    interface Star {
      x: number;
      y: number;
      r: number;
      color: string;
      twinkleOffset: number;
      twinkleSpeed: number;
      bright: boolean;
    }
    const layers: Star[][] = [[], [], []];
    const LAYER_COUNT = [180, 90, 40];
    const LAYER_SPEED = [0.02, 0.06, 0.12];
    const LAYER_SIZE = [[0.5, 1], [1, 1.8], [1.5, 3]];
    const STAR_COLORS = [
      '#ffffff', '#e8e8ff', '#ffeedd', '#ccddff',
      '#aad4ff', '#ffddaa', '#ddbbff', '#aaffdd'
    ];

    const randomStar = (layer: number): Star => {
      const sr = LAYER_SIZE[layer];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: sr[0] + Math.random() * (sr[1] - sr[0]),
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 2,
        bright: Math.random() < 0.12
      };
    };

    const initStars = () => {
      for (let l = 0; l < 3; l++) {
        layers[l] = [];
        for (let i = 0; i < LAYER_COUNT[l]; i++) {
          layers[l].push(randomStar(l));
        }
      }
    };

    // Dust particles
    interface Dust {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      lifeMax: number;
      life: number;
    }
    const dust: Dust[] = [];
    const DUST_COLORS = [
      'rgba(79,216,255,',
      'rgba(185,103,255,',
      'rgba(255,160,80,',
      'rgba(100,255,180,',
      'rgba(255,255,255,'
    ];

    const initDust = () => {
      dust.length = 0;
      for (let i = 0; i < 120; i++) {
        dust.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: 1,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.08 - Math.random() * 0.12,
          alpha: 0.1 + Math.random() * 0.35,
          color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
          lifeMax: 200 + Math.random() * 300,
          life: Math.random() * 400
        });
      }
    };

    // Nebulas
    interface Nebula {
      cx: number;
      cy: number;
      rw: number;
      rh: number;
      r: number;
      g: number;
      b: number;
      a: number;
      drift: number;
      driftSpeed: number;
    }
    const nebulas: Nebula[] = [];
    const initNebulas = () => {
      nebulas.length = 0;
      const defs = [
        { cx: 0.15, cy: 0.15, rw: 0.28, rh: 0.22, r: 68, g: 180, b: 255, a: 0.09 },
        { cx: 0.80, cy: 0.75, rw: 0.25, rh: 0.30, r: 160, g: 80, b: 255, a: 0.08 },
        { cx: 0.50, cy: 0.50, rw: 0.40, rh: 0.30, r: 255, g: 60, b: 100, a: 0.04 },
        { cx: 0.70, cy: 0.15, rw: 0.20, rh: 0.18, r: 40, g: 120, b: 255, a: 0.06 },
        { cx: 0.25, cy: 0.80, rw: 0.22, rh: 0.18, r: 80, g: 255, b: 200, a: 0.05 },
      ];
      for (const d of defs) {
        nebulas.push({
          ...d,
          drift: Math.random() * Math.PI * 2,
          driftSpeed: 0.0008 + Math.random() * 0.001
        });
      }
    };

    // Planets
    interface PlanetBand {
      yOff: number;
      h: number;
      color: string;
      alpha: number;
    }
    interface Planet {
      cx: number;
      cy: number;
      r: number;
      colors: string[];
      hasRing: boolean;
      ringColor?: string;
      moon?: { r: number; dist: number; angle: number; color: string; speed: number } | null;
      rotAngle: number;
      rotSpeed: number;
      bands: PlanetBand[];
    }
    const planets: Planet[] = [];

    const generatePlanetBands = (r: number, colors: string[]): PlanetBand[] => {
      const bands = [];
      const count = 6 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        bands.push({
          yOff: -r + (i / count) * 2 * r,
          h: (2 * r / count) * (0.6 + Math.random() * 0.8),
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.3 + Math.random() * 0.5
        });
      }
      return bands;
    };

    const initPlanets = () => {
      planets.length = 0;
      const defs = [
        {
          cx: W * 0.08, cy: H * 0.18, r: 60,
          colors: ['#3a1a6a', '#5a2a90', '#7b4ab0', '#9a6ac8'],
          hasRing: true, ringColor: 'rgba(155,100,220,0.35)',
          moon: { r: 7, dist: 90, angle: 0.8, color: '#7a6090', speed: 0.004 }
        },
        {
          cx: W * 0.92, cy: H * 0.82, r: 45,
          colors: ['#5a1a00', '#8b3a10', '#b85020', '#d07040'],
          hasRing: false, moon: null
        },
        {
          cx: W * 0.88, cy: H * 0.10, r: 25,
          colors: ['#102840', '#204060', '#306080', '#5090b0'],
          hasRing: false,
          moon: { r: 4, dist: 40, angle: 2.1, color: '#c0c8d0', speed: 0.008 }
        },
        {
          cx: W * 0.04, cy: H * 0.65, r: 18,
          colors: ['#0a2a10', '#1a4a20', '#2a6a30', '#4a8a50'],
          hasRing: false, moon: null
        }
      ];
      for (const d of defs) {
        planets.push({
          ...d,
          rotAngle: Math.random() * Math.PI * 2,
          rotSpeed: 0.001 + Math.random() * 0.002,
          bands: generatePlanetBands(d.r, d.colors)
        });
      }
    };

    // Shooting stars
    interface Shooter {
      x: number;
      y: number;
      vx: number;
      vy: number;
      len: number;
      alpha: number;
      life: number;
      maxLife: number;
      color: string;
    }
    const shooters: Shooter[] = [];
    const initShootingStars = () => {
      shooters.length = 0;
    };
    const spawnShootingStar = () => {
      const angle = (Math.PI / 6) + Math.random() * (Math.PI / 6);
      const speed = 6 + Math.random() * 10;
      shooters.push({
        x: Math.random() * W * 0.7,
        y: Math.random() * H * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 60 + Math.random() * 120,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 30,
        color: Math.random() < 0.5 ? '#ffffff' : '#aaddff'
      });
    };

    // Aurora
    const auroraColors = [
      [79, 216, 255],
      [185, 103, 255],
      [255, 100, 80],
      [80, 255, 200]
    ];
    let auroraT = 0;

    // Draw methods
    const drawBackground = () => {
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
      grad.addColorStop(0, '#070c18');
      grad.addColorStop(0.5, '#040810');
      grad.addColorStop(1, '#010206');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    };

    const drawAurora = () => {
      auroraT += 0.003;
      ctx.save();
      ctx.globalAlpha = 0.06;

      for (let i = 0; i < auroraColors.length; i++) {
        const [r, g, b] = auroraColors[i];
        const phase = auroraT + i * 1.5;
        const y = H * (0.15 + 0.1 * Math.sin(phase * 0.7 + i));
        const h = H * (0.12 + 0.08 * Math.sin(phase * 0.4));

        const aGrad = ctx.createLinearGradient(0, y - h, 0, y + h);
        aGrad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        aGrad.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
        aGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.moveTo(0, y - h);
        const waveAmp = 20 * Math.sin(phase);
        ctx.bezierCurveTo(
          W * 0.25, y - h + waveAmp,
          W * 0.75, y - h - waveAmp,
          W, y - h
        );
        ctx.lineTo(W, y + h);
        ctx.bezierCurveTo(
          W * 0.75, y + h - waveAmp,
          W * 0.25, y + h + waveAmp,
          0, y + h
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    const drawNebulas = () => {
      for (const n of nebulas) {
        n.drift += n.driftSpeed;
        const driftX = Math.sin(n.drift) * 30;
        const driftY = Math.cos(n.drift * 0.7) * 20;

        const cx = n.cx * W + driftX;
        const cy = n.cy * H + driftY;
        const rx = n.rw * W;
        const ry = n.rh * H;

        ctx.save();
        ctx.globalAlpha = n.a * (0.8 + 0.2 * Math.sin(n.drift * 1.3));

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        g.addColorStop(0, `rgba(${n.r},${n.g},${n.b},0.8)`);
        g.addColorStop(0.5, `rgba(${n.r},${n.g},${n.b},0.3)`);
        g.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
        ctx.arc(0, 0, Math.max(rx, ry), 0, Math.PI * 2);
        ctx.restore();
        ctx.fill();
        ctx.restore();
      }
    };

    const drawStars = () => {
      for (let l = 0; l < 3; l++) {
        for (const s of layers[l]) {
          s.x -= LAYER_SPEED[l] * 0.5;
          if (s.x < -s.r) s.x = W + s.r;

          const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset));
          ctx.globalAlpha = twinkle;
          ctx.fillStyle = s.color;

          if (l === 2) {
            ctx.fillRect(Math.round(s.x - s.r), Math.round(s.y - s.r), Math.round(s.r * 2), Math.round(s.r * 2));
            if (s.bright) {
              ctx.globalAlpha = twinkle * 0.4;
              ctx.fillRect(Math.round(s.x - s.r * 3), Math.round(s.y - 1), Math.round(s.r * 6), 2);
              ctx.fillRect(Math.round(s.x - 1), Math.round(s.y - s.r * 3), 2, Math.round(s.r * 6));
            }
          } else {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            if (s.bright && l === 1) {
              ctx.globalAlpha = twinkle * 0.25;
              const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
              sg.addColorStop(0, s.color);
              sg.addColorStop(1, 'transparent');
              ctx.fillStyle = sg;
              ctx.beginPath();
              ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawPixelPlanet = (p: Planet) => {
      p.rotAngle += p.rotSpeed;
      if (p.moon) {
        p.moon.angle += p.moon.speed;
      }

      ctx.save();
      ctx.translate(p.cx, p.cy);

      if (p.hasRing && p.ringColor) {
        ctx.save();
        ctx.scale(1, 0.28);
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 1.7, 0, Math.PI * 2);
        ctx.strokeStyle = p.ringColor;
        ctx.lineWidth = p.r * 0.18;
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.clip();

      const baseGrad = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.3, 0, 0, 0, p.r * 1.1);
      baseGrad.addColorStop(0, p.colors[1]);
      baseGrad.addColorStop(0.5, p.colors[0]);
      baseGrad.addColorStop(1, '#000000');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);

      for (const band of p.bands) {
        ctx.globalAlpha = band.alpha;
        ctx.fillStyle = band.color;
        const yOff = ((band.yOff + p.r + p.rotAngle * 30) % (p.r * 2)) - p.r;
        ctx.fillRect(-p.r, yOff, p.r * 2, Math.max(2, band.h));
      }

      ctx.globalAlpha = 0.25;
      const hlGrad = ctx.createRadialGradient(-p.r * 0.35, -p.r * 0.4, 0, 0, 0, p.r);
      hlGrad.addColorStop(0, 'rgba(255,255,255,0.8)');
      hlGrad.addColorStop(0.4, 'rgba(255,255,255,0.1)');
      hlGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hlGrad;
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);

      ctx.globalAlpha = 1;
      ctx.restore();

      ctx.globalAlpha = 0.15;
      const atmGrad = ctx.createRadialGradient(0, 0, p.r * 0.9, 0, 0, p.r * 1.3);
      atmGrad.addColorStop(0, p.colors[2]);
      atmGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = atmGrad;
      ctx.beginPath();
      ctx.arc(0, 0, p.r * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (p.moon) {
        const mx = Math.cos(p.moon.angle) * p.moon.dist;
        const my = Math.sin(p.moon.angle) * p.moon.dist * 0.4;
        ctx.fillStyle = p.moon.color;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(mx, my, p.moon.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(mx + p.moon.r * 0.35, my, p.moon.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    const drawPlanets = () => {
      for (const p of planets) {
        drawPixelPlanet(p);
      }
    };

    const drawDust = () => {
      for (const d of dust) {
        d.life++;
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;

        const lifeFrac = d.life / d.lifeMax;
        const fadeAlpha = lifeFrac < 0.1 ? lifeFrac * 10
          : lifeFrac > 0.8 ? (1 - lifeFrac) * 5
          : 1;

        ctx.globalAlpha = d.alpha * fadeAlpha;
        ctx.fillStyle = d.color + d.alpha * fadeAlpha + ')';
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);

        if (d.life >= d.lifeMax) {
          d.x = Math.random() * W;
          d.y = H + 10;
          d.life = 0;
          d.lifeMax = 200 + Math.random() * 300;
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawShootingStars = () => {
      if (Math.random() < 0.004) spawnShootingStar();

      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        s.alpha = Math.max(0, 1 - s.life / s.maxLife);

        if (s.alpha <= 0) { shooters.splice(i, 1); continue; }

        const nx = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.len;
        const ny = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.len;

        const sg = ctx.createLinearGradient(nx, ny, s.x, s.y);
        sg.addColorStop(0, 'transparent');
        sg.addColorStop(0.6, s.color + '80');
        sg.addColorStop(1, s.color);

        ctx.strokeStyle = sg;
        ctx.globalAlpha = s.alpha;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        ctx.globalAlpha = s.alpha * 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(s.x - 1), Math.round(s.y - 1), 2, 2);
        ctx.globalAlpha = 1;
      }
    };

    const drawGridLines = () => {
      ctx.save();
      ctx.globalAlpha = 0.025;
      ctx.strokeStyle = '#4fd8ff';
      ctx.lineWidth = 0.5;

      const gridSize = 40;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawHorizonGlow = () => {
      const horizonY = H * 0.42;
      const horizonGrad = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 60);
      horizonGrad.addColorStop(0, 'transparent');
      horizonGrad.addColorStop(0.5, `rgba(79,216,255,${0.02 + 0.01 * Math.sin(t * 0.02)})`);
      horizonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = horizonGrad;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, horizonY - 60, W, 120);
    };

    const frame = () => {
      t++;
      drawBackground();
      drawAurora();
      drawNebulas();
      drawGridLines();
      drawStars();
      drawPlanets();
      drawDust();
      drawShootingStars();
      drawHorizonGlow();

      animId = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize', resize);
    frame();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10 pointer-events-none" id="bgCanvas" />;
}
