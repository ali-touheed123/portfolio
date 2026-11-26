import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Fix WebGL 2 spec restriction where texImage3D disallows UNPACK_FLIP_Y_WEBGL / UNPACK_PREMULTIPLY_ALPHA_WEBGL
if (typeof window !== 'undefined' && typeof WebGL2RenderingContext !== 'undefined') {
  const origTexImage3D = WebGL2RenderingContext.prototype.texImage3D;
  WebGL2RenderingContext.prototype.texImage3D = function (this: WebGL2RenderingContext, ...args: any[]) {
    this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);
    this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    return (origTexImage3D as any).apply(this, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
