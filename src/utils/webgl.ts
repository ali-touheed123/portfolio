import * as THREE from 'three';

/**
 * Detects whether the active WebGL context is backed by a software rasterizer
 * (e.g., SwiftShader, llvmpipe) so 3D scenes can scale DPR, shadows, and particle counts safely.
 */
export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return true;

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
      const vendor = String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '');
      const combined = `${vendor} ${renderer}`.toLowerCase();
      if (
        combined.includes('swiftshader') ||
        combined.includes('llvmpipe') ||
        combined.includes('software') ||
        combined.includes('microsoft basic render') ||
        combined.includes('apple software')
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

const TEXTURE_KEYS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'emissiveMap',
  'alphaMap',
  'aoMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
] as const;

/**
 * Recursively disposes geometries, materials, and attached textures within a Three.js object subtree.
 */
export function disposeObjectSubtree(root: THREE.Object3D): void {
  const seenMaterials = new Set<THREE.Material>();
  const seenTextures = new Set<THREE.Texture>();
  const seenGeometries = new Set<THREE.BufferGeometry>();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry && !seenGeometries.has(mesh.geometry)) {
      seenGeometries.add(mesh.geometry);
      mesh.geometry.dispose();
    }
    const matOrList = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
    if (!matOrList) return;
    const mats = Array.isArray(matOrList) ? matOrList : [matOrList];
    for (const mat of mats) {
      if (!mat || seenMaterials.has(mat)) continue;
      seenMaterials.add(mat);
      const record = mat as unknown as Record<string, unknown>;
      for (const key of TEXTURE_KEYS) {
        const tex = record[key];
        if (tex instanceof THREE.Texture && !seenTextures.has(tex)) {
          seenTextures.add(tex);
          tex.dispose();
        }
      }
      mat.dispose();
    }
  });
}
