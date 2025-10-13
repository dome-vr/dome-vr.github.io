// vsh_pointcloud2.glsl.ts
// varying vAlpha
// Vertex shader program 
export const vsh = `
      attribute float alpha;
      varying float vAlpha;

      void main() {
        vAlpha = alpha;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = 4.0;
        gl_Position = projectionMatrix * mvPosition;
      }
      `;
//# sourceMappingURL=vsh_pointcloud2-initial.glsl.js.map