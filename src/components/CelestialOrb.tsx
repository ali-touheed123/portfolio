import React, { useEffect, useRef } from 'react';
import { useSkyTheme } from '../context/ThemeContext';

interface CelestialOrbProps {
  size?: number;
  className?: string;
}

const VERTEX_SOURCE = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SOURCE = `
  precision highp float;

  uniform vec2  u_resolution;
  uniform float u_time;
  uniform float u_progress;   // 0.0 = Moon (Night), 1.0 = Sun (Day)
  uniform float u_hover;      // 0.0 -> 1.0 hover warmth
  uniform vec2  u_mouse;      // Normalized subtle parallax

  #define PI 3.14159265359

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p = rot * p * 2.04 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  float craterLayer(vec2 p, float scale) {
    vec2 sp = p * scale;
    vec2 id = floor(sp);
    vec2 gv = fract(sp) - 0.5;
    float h = 0.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offs = vec2(float(x), float(y));
        vec2 rnd = hash22(id + offs);
        vec2 center = offs + (rnd - 0.5) * 0.65;
        float dist = length(gv - center);
        float radius = 0.14 + 0.24 * fract(rnd.x * 13.7);
        float bowl = smoothstep(radius, radius * 0.25, dist);
        float rim  = exp(-pow((dist - radius * 0.96) / (radius * 0.22), 2.0));
        h += (-0.55 * bowl + 0.26 * rim) * step(0.32, rnd.y);
      }
    }
    return h;
  }

  float lunarHeight(vec2 p) {
    float base = fbm(p * 3.1) * 0.35;
    float c1 = craterLayer(p, 3.6) * 0.55;
    float c2 = craterLayer(p + vec2(4.2, 1.9), 8.2) * 0.24;
    return base + c1 + c2;
  }

  vec3 tonemapACES(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  void main() {
    float minDim = min(u_resolution.x, u_resolution.y);
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / minDim;
    vec2 p = uv - u_mouse * 0.015;

    float t = smoothstep(0.0, 1.0, u_progress);
    float twilight = sin(t * PI);

    // Subtle organic breathing during morph
    float breath = 1.0 + 0.045 * sin(t * PI);
    float R = 0.27 * breath;
    float d = length(p);
    float angle = atan(p.y, p.x);

    // Cool silver-blue lunar aura
    float moonHalo = exp(-max(0.0, d - R * 0.85) * 7.5) * 0.50
                   + exp(-max(0.0, d - R * 0.9) * 3.0) * 0.16;
    vec3 moonAuraColor = vec3(0.62, 0.77, 1.0) * moonHalo * (1.0 + 0.28 * u_hover);

    // Warm solar corona + wispy flares
    float flareNoise = fbm(vec2(angle * 3.0 + u_time * 0.08, d * 4.5 - u_time * 0.18));
    float softRays = 0.82 + 0.18 * sin(angle * 7.0 + u_time * 0.15 + flareNoise * 3.0);
    float sunHaloInner = exp(-max(0.0, d - R * 0.94) * 14.0) * (1.25 + 0.35 * flareNoise);
    float sunHaloMid   = exp(-max(0.0, d - R * 0.85) * 5.0) * 0.72 * softRays;
    float sunHaloWide  = exp(-max(0.0, d - R * 0.55) * 2.4) * 0.34;
    vec3 sunAuraColor = vec3(1.0, 0.88, 0.55) * sunHaloInner
                      + vec3(1.0, 0.62, 0.22) * sunHaloMid
                      + vec3(1.0, 0.78, 0.45) * sunHaloWide;
    sunAuraColor *= (1.0 + 0.22 * u_hover);

    // Golden-amber ignition pulse mid-transition
    float pulseRing = exp(-pow((d - (R + 0.03 + t * 0.14)) / 0.055, 2.0)) * twilight * 0.48;
    vec3 pulseColor = vec3(1.0, 0.64, 0.28) * pulseRing;

    vec3 auraCol = mix(moonAuraColor, sunAuraColor, t) + pulseColor;
    float auraStrength = mix(moonHalo, sunHaloInner + sunHaloMid + sunHaloWide, t) + pulseRing;

    // Fade outer edge smoothly so canvas blends invisibly into any sky
    float edgeFade = 1.0 - smoothstep(0.36, 0.49, d);
    auraCol *= edgeFade;
    auraStrength *= edgeFade;

    float edgeAA = 2.0 / minDim;
    float orbMask = 1.0 - smoothstep(R - edgeAA, R + edgeAA, d);

    vec3 col = auraCol;
    if (orbMask > 0.001) {
      vec2 np = p / R;
      float z = sqrt(max(0.0, 1.0 - dot(np, np)));
      vec3 N = normalize(vec3(np, z));
      vec2 sUV = N.xy / (0.62 + 0.38 * N.z);

      // Moon Surface
      float eps = 0.008;
      float h0 = lunarHeight(sUV);
      float hx = lunarHeight(sUV + vec2(eps, 0.0));
      float hy = lunarHeight(sUV + vec2(0.0, eps));
      vec3 craterN = normalize(N + vec3((h0 - hx) * 1.6, (h0 - hy) * 1.6, 0.0));

      float maria = smoothstep(0.40, 0.66, fbm(sUV * 1.35 + vec2(2.4, -1.3)));
      vec3 regolith = mix(vec3(0.86, 0.88, 0.93), vec3(0.46, 0.50, 0.58), maria * 0.75);
      regolith *= (0.86 + 0.28 * h0);

      vec3 moonLightDir = normalize(vec3(-0.62 + u_mouse.x * 0.16, 0.38 + u_mouse.y * 0.16, 0.68));
      float diff = max(dot(craterN, moonLightDir), 0.0);
      float limb = pow(max(N.z, 0.0), 0.35);
      vec3 earthshine = vec3(0.08, 0.12, 0.22) * (0.65 + 0.35 * N.z);
      vec3 moonCol = regolith * (diff * 1.18 + 0.08) * limb + earthshine * (1.0 - diff);
      moonCol += vec3(0.55, 0.72, 1.0) * pow(1.0 - N.z, 3.2) * 0.26 * (0.6 + 0.4 * u_hover);

      // Sun Surface
      vec2 sunUV = sUV * 2.6;
      float warp1 = fbm(sunUV + vec2(u_time * 0.07, -u_time * 0.05));
      float warp2 = fbm(sunUV * 1.8 - vec2(u_time * 0.09, u_time * 0.06) + warp1 * 1.6);
      float plasma = fbm(sunUV * 2.5 + vec2(warp1, warp2) * 1.4 + u_time * 0.04);

      float sunLimb = pow(max(N.z, 0.0), 0.42);
      vec3 sunCore  = vec3(1.22, 1.06, 0.72);
      vec3 sunMid   = vec3(1.08, 0.66, 0.18);
      vec3 sunEdge  = vec3(0.92, 0.28, 0.05);
      vec3 sunCol = mix(sunEdge, sunMid, smoothstep(0.15, 0.65, sunLimb));
      sunCol = mix(sunCol, sunCore, smoothstep(0.45, 0.92, sunLimb * (0.72 + 0.45 * plasma)));
      sunCol += vec3(1.0, 0.92, 0.60) * smoothstep(0.56, 0.85, plasma) * 0.35 * sunLimb;
      sunCol += vec3(1.0, 0.55, 0.16) * pow(1.0 - N.z, 2.8) * 0.55;

      float igniteEmber = smoothstep(0.15, 0.55, twilight) * (0.4 + 0.6 * (1.0 - maria));
      vec3 emberGlow = vec3(1.0, 0.48, 0.14) * igniteEmber * 0.65;

      vec3 orbCol = mix(moonCol, sunCol, t) + emberGlow;
      col = mix(col, orbCol, orbMask);
    }

    col = tonemapACES(col);
    col = pow(col, vec3(0.95));
    float alpha = clamp(max(orbMask, auraStrength * 1.45), 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

export const CelestialOrb: React.FC<CelestialOrbProps> = ({ size = 128, className = '' }) => {
  const { isDay, toggleTheme } = useSkyTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetProgressRef = useRef<number>(isDay ? 1 : 0);
  const targetHoverRef = useRef<number>(0);

  useEffect(() => {
    targetProgressRef.current = isDay ? 1 : 0;
  }, [isDay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uProg = gl.getUniformLocation(program, 'u_progress');
    const uHover = gl.getUniformLocation(program, 'u_hover');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    updateSize();

    let progress = targetProgressRef.current;
    let hover = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let rafId = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) * 0.001);
      lastTime = now;

      progress += (targetProgressRef.current - progress) * (1 - Math.exp(-3.0 * dt));
      hover += (targetHoverRef.current - hover) * (1 - Math.exp(-7.0 * dt));
      mouse.x += (mouse.tx - mouse.x) * (1 - Math.exp(-4.5 * dt));
      mouse.y += (mouse.ty - mouse.y) * (1 - Math.exp(-4.5 * dt));

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 0.001);
      gl.uniform1f(uProg, progress);
      gl.uniform1f(uHover, hover);
      gl.uniform2f(uMouse, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [size]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onMouseEnter={() => {
        targetHoverRef.current = 1;
      }}
      onMouseLeave={() => {
        targetHoverRef.current = 0;
      }}
      aria-pressed={isDay}
      aria-label={isDay ? 'Switch from Sun (Day mode) to Moon (Night mode)' : 'Switch from Moon (Night mode) to Sun (Day mode)'}
      title={isDay ? 'Switch to Night Sky' : 'Switch to Daylight Sky'}
      className={`group relative inline-flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/70 transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block rounded-full pointer-events-none"
      />
    </button>
  );
};
