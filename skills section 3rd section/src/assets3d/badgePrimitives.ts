import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import type { BuiltSkillBadge } from './types';

export interface BadgeDimensions {
  width: number;
  height: number;
  cornerRadius: number;
  bodyDepth?: number;
  bevelThickness?: number;
  bevelSize?: number;
  rimRadiusPrimary?: number;
  rimRadiusCenter?: number;
}

export function createRoundedRectShape(width: number, height: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  const cr = Math.min(r, hw, hh);
  s.moveTo(-hw + cr, -hh);
  s.lineTo(hw - cr, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + cr);
  s.lineTo(hw, hh - cr);
  s.quadraticCurveTo(hw, hh, hw - cr, hh);
  s.lineTo(-hw + cr, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - cr);
  s.lineTo(-hw, -hh + cr);
  s.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);
  return s;
}

export function createPillPerimeterCurve(
  width: number,
  height: number,
  r: number,
  zOffset: number,
  samplesPerCorner = 12,
  samplesPerEdge = 16
): THREE.CatmullRomCurve3 {
  const hw = width / 2;
  const hh = height / 2;
  const cr = Math.min(r, hw, hh);
  const pts: THREE.Vector3[] = [];

  const addCorner = (cx: number, cy: number, startAngle: number, endAngle: number) => {
    for (let i = 0; i <= samplesPerCorner; i++) {
      const a = startAngle + (endAngle - startAngle) * (i / samplesPerCorner);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * cr, cy + Math.sin(a) * cr, zOffset));
    }
  };
  const addLine = (x1: number, y1: number, x2: number, y2: number) => {
    for (let i = 1; i < samplesPerEdge; i++) {
      const t = i / samplesPerEdge;
      pts.push(new THREE.Vector3(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, zOffset));
    }
  };

  addLine(-hw + cr, -hh, hw - cr, -hh);
  addCorner(hw - cr, -hh + cr, -Math.PI / 2, 0);
  addLine(hw, -hh + cr, hw, hh - cr);
  addCorner(hw - cr, hh - cr, 0, Math.PI / 2);
  addLine(hw - cr, hh, -hw + cr, hh);
  addCorner(-hw + cr, hh - cr, Math.PI / 2, Math.PI);
  addLine(-hw, hh - cr, -hw, -hh + cr);
  addCorner(-hw + cr, -hh + cr, Math.PI, Math.PI * 1.5);

  return new THREE.CatmullRomCurve3(pts, true);
}

export function applyNormalizedUVs(geo: THREE.BufferGeometry, width: number, height: number): void {
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) + width / 2) / width;
    uvs[i * 2 + 1] = (pos.getY(i) + height / 2) / height;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

export function createSmokyFaceTexture(
  width: number,
  height: number,
  topColor: string,
  bottomColor: string,
  accentGlowRgba: string,
  innerGlowCenterX = 0.25,
  sheenStrength = 0.065
): THREE.CanvasTexture {
  const cw = 1024;
  const ch = Math.max(256, Math.round((cw * height) / width));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, cw * 0.25, ch);
  grad.addColorStop(0, topColor);
  grad.addColorStop(0.55, bottomColor);
  grad.addColorStop(1, bottomColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  const glow = ctx.createRadialGradient(
    cw * innerGlowCenterX,
    ch * 0.45,
    ch * 0.04,
    cw * innerGlowCenterX,
    ch * 0.5,
    cw * 0.48
  );
  glow.addColorStop(0, accentGlowRgba);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, cw, ch);

  // Subtle diagonal glass reflection highlight across top half
  const sheen = ctx.createLinearGradient(0, 0, cw * 0.8, ch * 0.72);
  sheen.addColorStop(0, `rgba(255,255,255,${sheenStrength})`);
  sheen.addColorStop(0.35, `rgba(255,255,255,${sheenStrength * 0.35})`);
  sheen.addColorStop(0.6, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, cw, ch);

  // Soft perimeter inner vignette shadow for capsule curvature depth
  const rimShadow = ctx.createRadialGradient(cw * 0.5, ch * 0.5, ch * 0.25, cw * 0.5, ch * 0.5, cw * 0.62);
  rimShadow.addColorStop(0, 'rgba(0,0,0,0)');
  rimShadow.addColorStop(0.85, 'rgba(0,0,0,0.12)');
  rimShadow.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = rimShadow;
  ctx.fillRect(0, 0, cw, ch);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export interface TypographyCanvasOptions {
  width: number;
  height: number;
  text: string;
  textXRatio?: number;
  textYRatio?: number;
  fontSizeRatio?: number;
  fontWeight?: number | string;
  maxWidthRatio?: number;
  fillStyle?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  glowColor?: string;
  glowBlur?: number;
}

export function createTypographyTextures(opts: TypographyCanvasOptions): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const cw = 1280;
  const ch = Math.max(256, Math.round((cw * opts.height) / opts.width));

  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = cw;
  mapCanvas.height = ch;
  const mctx = mapCanvas.getContext('2d')!;
  mctx.clearRect(0, 0, cw, ch);

  const align = opts.align ?? 'left';
  const baseline = opts.baseline ?? 'middle';
  const tx = cw * (opts.textXRatio ?? 0.36);
  const ty = ch * (opts.textYRatio ?? 0.51);
  const safeRightEdge = cw * 0.89;
  const maxW =
    align === 'center'
      ? cw * 0.82
      : Math.max(cw * 0.25, Math.min(opts.maxWidthRatio ? cw * opts.maxWidthRatio : cw * 0.6, safeRightEdge - tx));

  let fontSize = Math.round(ch * (opts.fontSizeRatio ?? 0.45));
  const buildFont = (sz: number) =>
    `${opts.fontWeight ?? 600} ${sz}px "Plus Jakarta Sans", Inter, system-ui, sans-serif`;

  mctx.font = buildFont(fontSize);
  const measured = mctx.measureText(opts.text).width;
  if (measured > maxW && measured > 0) {
    fontSize = Math.max(24, Math.floor(fontSize * (maxW / measured)));
  }

  const fontSpec = buildFont(fontSize);
  mctx.font = fontSpec;
  mctx.textAlign = align;
  mctx.textBaseline = baseline;

  if (opts.glowColor) {
    mctx.shadowColor = opts.glowColor;
    mctx.shadowBlur = opts.glowBlur ?? 18;
  }
  mctx.fillStyle = opts.fillStyle ?? '#f8fafc';
  mctx.fillText(opts.text, tx, ty, maxW);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = cw;
  bumpCanvas.height = ch;
  const bctx = bumpCanvas.getContext('2d')!;
  bctx.fillStyle = '#000000';
  bctx.fillRect(0, 0, cw, ch);
  bctx.font = fontSpec;
  bctx.textAlign = align;
  bctx.textBaseline = baseline;
  bctx.fillStyle = '#ffffff';
  bctx.fillText(opts.text, tx, ty, maxW);

  const map = new THREE.CanvasTexture(mapCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = 4;

  return { map, bumpMap };
}

export function createBasePillAssembly(
  dims: BadgeDimensions,
  baseMat: THREE.Material,
  rimMat: THREE.Material | null,
  typoTextures?: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture }
): {
  root: THREE.Group;
  frontMount: THREE.Group;
  backMount: THREE.Group;
  totalHalfZ: number;
  facePlateGeo: THREE.ShapeGeometry;
} {
  const BODY_DEPTH = dims.bodyDepth ?? 0.12;
  const BEVEL_THICKNESS = dims.bevelThickness ?? 0.042;
  const BEVEL_SIZE = dims.bevelSize ?? 0.036;
  const TOTAL_HALF_Z = BODY_DEPTH / 2 + BEVEL_THICKNESS;

  const root = new THREE.Group();

  const bodyShape = createRoundedRectShape(dims.width, dims.height, dims.cornerRadius);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: BODY_DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL_THICKNESS,
    bevelSize: BEVEL_SIZE,
    bevelSegments: 7,
    curveSegments: 24,
  });
  bodyGeo.translate(0, 0, -BODY_DEPTH / 2);
  applyNormalizedUVs(bodyGeo, dims.width, dims.height);

  const bodyMesh = new THREE.Mesh(bodyGeo, baseMat);
  bodyMesh.userData.isBadgeBody = true;
  root.add(bodyMesh);

  if (rimMat) {
    const rimZ = BODY_DEPTH / 2 + BEVEL_THICKNESS * 0.64;
    const rPrim = dims.rimRadiusPrimary ?? 0.022;
    const rCenter = dims.rimRadiusCenter ?? 0.018;

    const frontRimGeo = new THREE.TubeGeometry(
      createPillPerimeterCurve(dims.width + 0.022, dims.height + 0.022, dims.cornerRadius + 0.01, rimZ),
      96,
      rPrim,
      10,
      true
    );
    const backRimGeo = new THREE.TubeGeometry(
      createPillPerimeterCurve(dims.width + 0.022, dims.height + 0.022, dims.cornerRadius + 0.01, -rimZ),
      96,
      rPrim,
      10,
      true
    );
    const centerRimGeo = new THREE.TubeGeometry(
      createPillPerimeterCurve(
        dims.width + BEVEL_SIZE * 1.85,
        dims.height + BEVEL_SIZE * 1.85,
        dims.cornerRadius + BEVEL_SIZE * 0.9,
        0
      ),
      96,
      rCenter,
      10,
      true
    );
    const frontRim = new THREE.Mesh(frontRimGeo, rimMat);
    frontRim.userData.isNeonRim = true;
    const backRim = new THREE.Mesh(backRimGeo, rimMat);
    backRim.userData.isNeonRim = true;
    const centerRim = new THREE.Mesh(centerRimGeo, rimMat);
    centerRim.userData.isNeonRim = true;
    root.add(frontRim, backRim, centerRim);
  }

  const faceShape = createRoundedRectShape(dims.width * 0.975, dims.height * 0.96, dims.cornerRadius * 0.95);
  const facePlateGeo = new THREE.ShapeGeometry(faceShape, 24);
  applyNormalizedUVs(facePlateGeo, dims.width, dims.height);

  const frontMount = new THREE.Group();
  frontMount.position.z = TOTAL_HALF_Z + 0.004;
  root.add(frontMount);

  const backMount = new THREE.Group();
  backMount.position.z = -(TOTAL_HALF_Z + 0.004);
  backMount.rotation.y = Math.PI;
  root.add(backMount);

  if (typoTextures) {
    const typoMat = new THREE.MeshStandardMaterial({
      map: typoTextures.map,
      bumpMap: typoTextures.bumpMap,
      bumpScale: 0.009,
      transparent: true,
      roughness: 0.2,
      metalness: 0.12,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const frontFace = new THREE.Mesh(facePlateGeo, typoMat);
    frontFace.userData.isTypography = true;
    const backFace = new THREE.Mesh(facePlateGeo, typoMat);
    backFace.userData.isTypography = true;
    frontMount.add(frontFace);
    backMount.add(backFace);
  }

  return { root, frontMount, backMount, totalHalfZ: TOTAL_HALF_Z, facePlateGeo };
}

export function createLinearGradientRimMaterial(
  leftColor: string,
  rightColor: string,
  emissiveIntensity = 1.05
): THREE.MeshStandardMaterial {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, leftColor);
  grad.addColorStop(1, rightColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 16);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity,
    roughness: 0.2,
    metalness: 0.3,
  });
}

export function filletPolyline2D(points: THREE.Vector2[], radius: number, segments = 5): THREE.Vector2[] {
  const n = points.length;
  if (n < 3) return points;
  const out: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];
    const v1 = prev.clone().sub(curr);
    const v2 = next.clone().sub(curr);
    const len1 = v1.length();
    const len2 = v2.length();
    if (len1 < 1e-5 || len2 < 1e-5) {
      out.push(curr.clone());
      continue;
    }
    const maxCut = Math.min(radius, len1 * 0.42, len2 * 0.42);
    v1.normalize();
    v2.normalize();
    const p1 = curr.clone().addScaledVector(v1, maxCut);
    const p2 = curr.clone().addScaledVector(v2, maxCut);
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const omt = 1 - t;
      out.push(
        new THREE.Vector2(
          omt * omt * p1.x + 2 * omt * t * curr.x + t * t * p2.x,
          omt * omt * p1.y + 2 * omt * t * curr.y + t * t * p2.y
        )
      );
    }
  }
  return out;
}

export function offsetRibbonToShape(
  pts: THREE.Vector2[],
  halfWidth: number,
  startCap: 'round' | 'flat' = 'round',
  endCap: 'round' | 'flat' = 'round'
): THREE.Shape {
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  const n = pts.length;

  for (let i = 0; i < n; i++) {
    const pPrev = pts[Math.max(0, i - 1)];
    const pNext = pts[Math.min(n - 1, i + 1)];
    const dir = pNext.clone().sub(pPrev);
    if (dir.lengthSq() < 1e-9) dir.set(1, 0);
    dir.normalize();
    const perp = new THREE.Vector2(-dir.y, dir.x);
    left.push(pts[i].clone().addScaledVector(perp, halfWidth));
    right.push(pts[i].clone().addScaledVector(perp, -halfWidth));
  }

  const shape = new THREE.Shape();
  shape.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) {
    shape.lineTo(left[i].x, left[i].y);
  }
  if (endCap === 'round' && n >= 2) {
    const tip = pts[n - 1];
    const dir = tip.clone().sub(pts[n - 2]).normalize();
    const baseAngle = Math.atan2(dir.y, dir.x) + Math.PI / 2;
    for (let s = 1; s <= 6; s++) {
      const a = baseAngle - (Math.PI * s) / 6;
      shape.lineTo(tip.x + Math.cos(a) * halfWidth, tip.y + Math.sin(a) * halfWidth);
    }
  }
  for (let i = right.length - 1; i >= 0; i--) {
    shape.lineTo(right[i].x, right[i].y);
  }
  if (startCap === 'round' && n >= 2) {
    const tip = pts[0];
    const dir = pts[1].clone().sub(tip).normalize();
    const baseAngle = Math.atan2(dir.y, dir.x) - Math.PI / 2;
    for (let s = 1; s <= 6; s++) {
      const a = baseAngle - (Math.PI * s) / 6;
      shape.lineTo(tip.x + Math.cos(a) * halfWidth, tip.y + Math.sin(a) * halfWidth);
    }
  }
  shape.closePath();
  return shape;
}

export function createTaperedStrokeShape(
  points: [number, number][],
  widths: number[],
  samples = 36
): THREE.Shape {
  const vecs = points.map(([x, y]) => new THREE.Vector2(x, y));
  const curve = new THREE.SplineCurve(vecs);
  const sampled = curve.getPoints(samples);
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const wIdx = t * (widths.length - 1);
    const i0 = Math.floor(wIdx);
    const i1 = Math.min(widths.length - 1, i0 + 1);
    const hw = (widths[i0] + (widths[i1] - widths[i0]) * (wIdx - i0)) * 0.5;

    const pPrev = sampled[Math.max(0, i - 1)];
    const pNext = sampled[Math.min(samples, i + 1)];
    const tan = pNext.clone().sub(pPrev).normalize();
    const perp = new THREE.Vector2(-tan.y, tan.x);
    left.push(sampled[i].clone().addScaledVector(perp, hw));
    right.push(sampled[i].clone().addScaledVector(perp, -hw));
  }

  const shape = new THREE.Shape();
  shape.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) shape.lineTo(left[i].x, left[i].y);
  for (let i = right.length - 1; i >= 0; i--) shape.lineTo(right[i].x, right[i].y);
  shape.closePath();
  return shape;
}

const sharedSvgLoader = new SVGLoader();

export function svgMarkupToExtrudedGroup(
  svgString: string,
  material: THREE.Material,
  targetWidth: number,
  extrudeDepth: number,
  bevelThickness = 0.0025,
  bevelSize = 0.002
): THREE.Group {
  const parsed = sharedSvgLoader.parse(svgString);
  const rawGroup = new THREE.Group();

  for (const path of parsed.paths) {
    const shapes = SVGLoader.createShapes(path);
    for (const shape of shapes) {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: extrudeDepth,
        bevelEnabled: bevelThickness > 0,
        bevelThickness,
        bevelSize,
        bevelSegments: 2,
        curveSegments: 16,
      });
      rawGroup.add(new THREE.Mesh(geo, material));
    }
  }

  // Flip SVG Y axis (SVG Y+ is down, Three Y+ is up) and center at origin
  const box = new THREE.Box3().setFromObject(rawGroup);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const scale = size.x > 0 ? targetWidth / size.x : 1;
  const wrapper = new THREE.Group();
  rawGroup.position.set(-center.x, -center.y, -extrudeDepth / 2);
  wrapper.add(rawGroup);
  wrapper.scale.set(scale, -scale, scale);
  return wrapper;
}

export function buildMissingAssetPlaceholderBadge(
  label: string,
  topHex: string,
  bottomHex: string,
  rimColorHex: string,
  emissiveHex: string,
  glowRgba: string
): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.34;

  const baseTex = createSmokyFaceTexture(W, H, topHex, bottomHex, glowRgba, 0.32, 0.14);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.34,
    metalness: 0.25,
    envMapIntensity: 0.9,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(rimColorHex),
    emissive: new THREE.Color(emissiveHex),
    emissiveIntensity: 1.08,
    roughness: 0.22,
    metalness: 0.4,
  });

  // Neutral labeled badge without fabricating an SVG/emoji icon for missing AWS/Express models
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: label,
    textXRatio: 0.5,
    textYRatio: 0.51,
    fontSizeRatio: 0.44,
    fontWeight: 700,
    align: 'center',
    fillStyle: '#f1f5f9',
    glowColor: glowRgba,
    glowBlur: 12,
  });

  const { root } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  // Add two crisp 3D accent brackets flanking the label to preserve 3D depth without inventing icons
  const bracketMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(rimColorHex),
    emissive: new THREE.Color(emissiveHex),
    emissiveIntensity: 0.7,
    roughness: 0.25,
    metalness: 0.65,
  });
  const barGeo = new THREE.BoxGeometry(0.055, 0.28, 0.025);
  const leftBar = new THREE.Mesh(barGeo, bracketMat);
  leftBar.position.set(-0.98, 0, 0.11);
  const rightBar = new THREE.Mesh(barGeo, bracketMat);
  rightBar.position.set(0.98, 0, 0.11);
  const leftBarBack = leftBar.clone();
  leftBarBack.position.z = -0.11;
  const rightBarBack = rightBar.clone();
  rightBarBack.position.z = -0.11;
  root.add(leftBar, rightBar, leftBarBack, rightBarBack);

  return { group: root, width: W, height: H, depth: 0.24 };
}
