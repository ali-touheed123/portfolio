import * as THREE from 'three';

export const BADGE_DEFAULT_W = 3.0;
export const BADGE_DEFAULT_H = 1.0;
export const BADGE_BODY_DEPTH = 0.12;
export const BADGE_BEVEL_THICKNESS = 0.042;
export const BADGE_BEVEL_SIZE = 0.036;
export const BADGE_TOTAL_HALF_Z = BADGE_BODY_DEPTH / 2 + BADGE_BEVEL_THICKNESS;

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    let isSoftware = false;
    if (ext) {
      const rendererName = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
      isSoftware = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererName);
    }
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return isSoftware;
  } catch {
    return false;
  }
}

export class ResourceTracker {
  private disposables = new Set<{ dispose: () => void }>();

  track<T extends { dispose: () => void }>(item: T): T {
    this.disposables.add(item);
    return item;
  }

  disposeAll() {
    this.disposables.forEach((item) => {
      try {
        item.dispose();
      } catch {
        // ignore disposal errors on already-lost contexts
      }
    });
    this.disposables.clear();
  }
}

export function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const hw = w / 2;
  const hh = h / 2;
  const rad = Math.min(r, hw, hh);
  const s = new THREE.Shape();
  s.moveTo(-hw + rad, -hh);
  s.lineTo(hw - rad, -hh);
  s.absarc(hw - rad, -hh + rad, rad, -Math.PI / 2, 0, false);
  s.lineTo(hw, hh - rad);
  s.absarc(hw - rad, hh - rad, rad, 0, Math.PI / 2, false);
  s.lineTo(-hw + rad, hh);
  s.absarc(-hw + rad, hh - rad, rad, Math.PI / 2, Math.PI, false);
  s.lineTo(-hw, -hh + rad);
  s.absarc(-hw + rad, -hh + rad, rad, Math.PI, Math.PI * 1.5, false);
  return s;
}

export function createRoundedRectCurvePoints(
  w: number,
  h: number,
  r: number,
  z = 0
): THREE.Vector3[] {
  const hw = w / 2;
  const hh = h / 2;
  const rad = Math.min(r, hw, hh);
  const pts: THREE.Vector3[] = [];
  const cornerSteps = 12;
  const straightSteps = 6;

  const pushLine = (x0: number, y0: number, x1: number, y1: number) => {
    for (let i = 0; i < straightSteps; i++) {
      const t = i / straightSteps;
      pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z));
    }
  };
  const pushArc = (cx: number, cy: number, a0: number, a1: number) => {
    for (let i = 0; i < cornerSteps; i++) {
      const a = a0 + (a1 - a0) * (i / cornerSteps);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, z));
    }
  };

  pushLine(-hw + rad, -hh, hw - rad, -hh);
  pushArc(hw - rad, -hh + rad, -Math.PI / 2, 0);
  pushLine(hw, -hh + rad, hw, hh - rad);
  pushArc(hw - rad, hh - rad, 0, Math.PI / 2);
  pushLine(hw - rad, hh, -hw + rad, hh);
  pushArc(-hw + rad, hh - rad, Math.PI / 2, Math.PI);
  pushLine(-hw, hh - rad, -hw, -hh + rad);
  pushArc(-hw + rad, -hh + rad, Math.PI, Math.PI * 1.5);
  return pts;
}

export function strokeRoundedRectCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.arcTo(x + w, y, x + w, y + rad, rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
  ctx.lineTo(x + rad, y + h);
  ctx.arcTo(x, y + h, x, y + h - rad, rad);
  ctx.lineTo(x, y + rad);
  ctx.arcTo(x, y, x + rad, y, rad);
  ctx.closePath();
}

export function applyPlanarUVs(
  geo: THREE.BufferGeometry,
  totalW: number,
  totalH: number
) {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / totalW + 0.5, pos.getY(i) / totalH + 0.5);
  }
  uv.needsUpdate = true;
}

export interface SmokyPaletteOptions {
  badgeW: number;
  badgeH: number;
  cornerR: number;
  bgStops: [string, string, string, string];
  lightBlobRgb: string;
  darkBlobRgb: string;
  edgeGlowRgba: string;
  edgeStrokeRgba: string;
  innerStrokeRgba: string;
  seed?: number;
  gradientRimStops?: Array<[number, string]>;
}

export function createSmokyPlateTexture(
  opts: SmokyPaletteOptions,
  maxAniso: number,
  tracker: ResourceTracker
): THREE.CanvasTexture {
  const W = 1024;
  const H = Math.round(W * (opts.badgeH / opts.badgeW));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, opts.bgStops[0]);
  bg.addColorStop(0.35, opts.bgStops[1]);
  bg.addColorStop(0.7, opts.bgStops[2]);
  bg.addColorStop(1, opts.bgStops[3]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  let seed = opts.seed ?? 4219;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 38; i++) {
    const cx = rand() * W;
    const cy = rand() * H;
    const rx = 70 + rand() * 170;
    const ry = 30 + rand() * 85;
    const angle = (rand() - 0.5) * 0.85;
    const isLight = rand() > 0.45;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(1, ry / rx);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    if (isLight) {
      grad.addColorStop(0, `rgba(${opts.lightBlobRgb}, 0.14)`);
      grad.addColorStop(0.55, `rgba(${opts.lightBlobRgb}, 0.06)`);
      grad.addColorStop(1, `rgba(${opts.lightBlobRgb}, 0)`);
    } else {
      grad.addColorStop(0, `rgba(${opts.darkBlobRgb}, 0.24)`);
      grad.addColorStop(0.6, `rgba(${opts.darkBlobRgb}, 0.1)`);
      grad.addColorStop(1, `rgba(${opts.darkBlobRgb}, 0)`);
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const pad = 10;
  const rPx = (opts.cornerR / opts.badgeH) * (H - pad * 2);

  if (opts.gradientRimStops && opts.gradientRimStops.length > 0) {
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = W;
    glowCanvas.height = H;
    const gCtx = glowCanvas.getContext('2d')!;
    gCtx.save();
    strokeRoundedRectCanvas(gCtx, pad, pad, W - pad * 2, H - pad * 2, rPx);
    gCtx.shadowColor = 'rgba(255,255,255,0.88)';
    gCtx.shadowBlur = 32;
    gCtx.lineWidth = 9;
    gCtx.strokeStyle = 'rgba(255,255,255,0.6)';
    gCtx.stroke();
    gCtx.shadowBlur = 14;
    gCtx.lineWidth = 4;
    gCtx.strokeStyle = 'rgba(255,255,255,0.82)';
    gCtx.stroke();
    gCtx.restore();
    gCtx.globalCompositeOperation = 'source-in';
    const rimGrad = gCtx.createLinearGradient(0, 0, W, 0);
    opts.gradientRimStops.forEach(([stop, color]) => rimGrad.addColorStop(stop, color));
    gCtx.fillStyle = rimGrad;
    gCtx.fillRect(0, 0, W, H);
    ctx.drawImage(glowCanvas, 0, 0);
  } else {
    ctx.save();
    strokeRoundedRectCanvas(ctx, pad, pad, W - pad * 2, H - pad * 2, rPx);
    ctx.shadowColor = opts.edgeGlowRgba;
    ctx.shadowBlur = 30;
    ctx.lineWidth = 9;
    ctx.strokeStyle = opts.edgeStrokeRgba;
    ctx.stroke();

    ctx.shadowBlur = 12;
    ctx.lineWidth = 4;
    ctx.strokeStyle = opts.innerStrokeRgba;
    ctx.stroke();
    ctx.restore();
  }

  const tex = tracker.track(new THREE.CanvasTexture(canvas));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export interface TypographyOptions {
  badgeW: number;
  badgeH: number;
  text: string;
  fontWeight?: number;
  fontSizeFactor?: number;
  textXFraction?: number;
  maxWidthFraction?: number;
  textColor?: string;
  glowColor?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textYFraction?: number;
}

export function createTypographyTextures(
  opts: TypographyOptions,
  maxAniso: number,
  tracker: ResourceTracker
): { mapTex: THREE.CanvasTexture; bumpTex: THREE.CanvasTexture; measuredFontSizePx: number } {
  const W = 1024;
  const H = Math.round(W * (opts.badgeH / opts.badgeW));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = W;
  bumpCanvas.height = H;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.clearRect(0, 0, W, H);
  bCtx.fillStyle = '#000000';
  bCtx.fillRect(0, 0, W, H);

  const weight = opts.fontWeight ?? 600;
  let fontSize = Math.round(H * (opts.fontSizeFactor ?? 0.43));
  const family =
    '"Plus Jakarta Sans", "Inter", "SF Pro Display", "Segoe UI", "Roboto", Arial, sans-serif';
  const textX = W * (opts.textXFraction ?? 0.34);
  const maxWidth =
    opts.textAlign === 'center'
      ? W * (opts.maxWidthFraction ?? 0.78)
      : Math.min(W * (opts.maxWidthFraction ?? 0.6), W * 0.92 - textX);

  ctx.font = `${weight} ${fontSize}px ${family}`;
  const measuredW = ctx.measureText(opts.text).width;
  if (measuredW > maxWidth && maxWidth > 40) {
    fontSize = Math.max(24, Math.floor(fontSize * (maxWidth / measuredW)));
  }

  const fontSpec = `${weight} ${fontSize}px ${family}`;
  const textY = H * (opts.textYFraction ?? 0.515);
  const align = opts.textAlign ?? 'left';
  const baseline = opts.textBaseline ?? 'middle';

  ctx.font = fontSpec;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  ctx.save();
  ctx.shadowColor = opts.glowColor ?? 'rgba(200, 240, 255, 0.45)';
  ctx.shadowBlur = 7;
  ctx.fillStyle = opts.textColor ?? '#F5FAFF';
  ctx.fillText(opts.text, textX, textY);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
  ctx.shadowBlur = 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(opts.text, textX, textY);
  ctx.restore();

  bCtx.font = fontSpec;
  bCtx.textAlign = align;
  bCtx.textBaseline = baseline;
  bCtx.shadowColor = 'rgba(200, 200, 200, 0.85)';
  bCtx.shadowBlur = 3;
  bCtx.fillStyle = '#FFFFFF';
  bCtx.fillText(opts.text, textX, textY);

  const mapTex = tracker.track(new THREE.CanvasTexture(canvas));
  mapTex.colorSpace = THREE.SRGBColorSpace;
  mapTex.anisotropy = maxAniso;

  const bumpTex = tracker.track(new THREE.CanvasTexture(bumpCanvas));
  bumpTex.anisotropy = maxAniso;

  return { mapTex, bumpTex, measuredFontSizePx: fontSize };
}

export function createPillBaseGeometries(
  w: number,
  h: number,
  r: number,
  tracker: ResourceTracker
) {
  const bodyShape = createRoundedRectShape(w, h, r);
  const bodyGeo = tracker.track(
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: BADGE_BODY_DEPTH,
      bevelEnabled: true,
      bevelThickness: BADGE_BEVEL_THICKNESS,
      bevelSize: BADGE_BEVEL_SIZE,
      bevelSegments: 6,
      curveSegments: 24,
    })
  );
  bodyGeo.center();
  applyPlanarUVs(bodyGeo, w + BADGE_BEVEL_SIZE * 2, h + BADGE_BEVEL_SIZE * 2);

  const faceShape = createRoundedRectShape(w - 0.04, h - 0.04, Math.max(0.08, r - 0.02));
  const facePlateGeo = tracker.track(new THREE.ShapeGeometry(faceShape, 24));
  applyPlanarUVs(facePlateGeo, w, h);

  const rimZ = BADGE_BODY_DEPTH / 2 + BADGE_BEVEL_THICKNESS * 0.64;
  const createTubeGeo = (
    tw: number,
    th: number,
    tr: number,
    zPos: number,
    tubeRadius: number
  ) => {
    const pts = createRoundedRectCurvePoints(tw, th, tr, zPos);
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const geo = tracker.track(new THREE.TubeGeometry(curve, 84, tubeRadius, 8, true));
    applyPlanarUVs(geo, w + BADGE_BEVEL_SIZE * 2 + tubeRadius * 2, h + BADGE_BEVEL_SIZE * 2 + tubeRadius * 2);
    return geo;
  };

  const rimFrontGeo = createTubeGeo(w + 0.022, h + 0.022, r + 0.011, rimZ, 0.022);
  const rimBackGeo = createTubeGeo(w + 0.022, h + 0.022, r + 0.011, -rimZ, 0.022);
  const rimMidGeo = createTubeGeo(
    w + BADGE_BEVEL_SIZE * 1.85,
    h + BADGE_BEVEL_SIZE * 1.85,
    r + BADGE_BEVEL_SIZE * 0.92,
    0,
    0.018
  );

  return { bodyGeo, facePlateGeo, rimFrontGeo, rimBackGeo, rimMidGeo };
}

export function createStandardPillShell(
  opts: {
    badgeW: number;
    badgeH: number;
    cornerR: number;
    smoky: SmokyPaletteOptions;
    rimColor: number;
    rimEmissive: number;
    rimEmissiveIntensity?: number;
    rimMapTex?: THREE.CanvasTexture;
    typography: TypographyOptions;
    typoEmissive?: number;
  },
  maxAniso: number,
  tracker: ResourceTracker
): {
  root: THREE.Group;
  frontFaceAnchor: THREE.Group;
  backFaceAnchor: THREE.Group;
  bodyMat: THREE.MeshPhysicalMaterial;
  rimMat: THREE.MeshPhysicalMaterial;
} {
  const root = new THREE.Group();
  const geos = createPillBaseGeometries(opts.badgeW, opts.badgeH, opts.cornerR, tracker);
  const smokyTex = createSmokyPlateTexture(opts.smoky, maxAniso, tracker);

  const bodyMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      map: smokyTex,
      color: 0xffffff,
      roughness: 0.16,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      ior: 1.52,
      reflectivity: 0.9,
      envMapIntensity: 1.25,
    })
  );
  root.add(new THREE.Mesh(geos.bodyGeo, bodyMat));

  const rimMat = tracker.track(
    opts.rimMapTex
      ? new THREE.MeshPhysicalMaterial({
          map: opts.rimMapTex,
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveMap: opts.rimMapTex,
          emissiveIntensity: opts.rimEmissiveIntensity ?? 0.95,
          roughness: 0.14,
          metalness: 0.05,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
        })
      : new THREE.MeshPhysicalMaterial({
          color: opts.rimColor,
          emissive: opts.rimEmissive,
          emissiveIntensity: opts.rimEmissiveIntensity ?? 1.0,
          roughness: 0.14,
          metalness: 0.05,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
        })
  );

  root.add(new THREE.Mesh(geos.rimFrontGeo, rimMat));
  root.add(new THREE.Mesh(geos.rimBackGeo, rimMat));
  root.add(new THREE.Mesh(geos.rimMidGeo, rimMat));

  const { mapTex, bumpTex } = createTypographyTextures(opts.typography, maxAniso, tracker);
  const typoMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      map: mapTex,
      bumpMap: bumpTex,
      bumpScale: 0.007,
      emissive: opts.typoEmissive ?? 0xffffff,
      emissiveMap: mapTex,
      emissiveIntensity: 0.45,
      transparent: true,
      alphaTest: 0.01,
      roughness: 0.15,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
    })
  );

  const frontFaceAnchor = new THREE.Group();
  const frontTypo = new THREE.Mesh(geos.facePlateGeo, typoMat);
  frontTypo.position.z = BADGE_TOTAL_HALF_Z + 0.0025;
  frontFaceAnchor.add(frontTypo);
  root.add(frontFaceAnchor);

  const backFaceAnchor = new THREE.Group();
  backFaceAnchor.rotation.y = Math.PI;
  const backTypo = new THREE.Mesh(geos.facePlateGeo, typoMat);
  backTypo.position.z = BADGE_TOTAL_HALF_Z + 0.0025;
  backFaceAnchor.add(backTypo);
  root.add(backFaceAnchor);

  return { root, frontFaceAnchor, backFaceAnchor, bodyMat, rimMat };
}
