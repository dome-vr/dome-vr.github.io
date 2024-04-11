// vsh_pointcloud2.glsl.ts
// varying vAlpha
// Vertex shader program 
const vsh = `
      attribute float pointsize;
      attribute float alpha;
      varying float vAlpha;

      void main() {
        vAlpha = alpha;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = pointsize;
        gl_Position = projectionMatrix * mvPosition;
      }
      `;
export { vsh };
//# sourceMappingURL=vsh_pointcloud2.glsl.js.map