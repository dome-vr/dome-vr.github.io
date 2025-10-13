// morphtarget generators
// helix1
export const helix1 = (state) => {
    const TWOPI = 2 * Math.PI;
    const radius = 0.3 * state['cloudRadius'], // 750
    vertices = [], particles = state['particles'];
    for (let i = 0; i < particles; i++) {
        const p = i / particles;
        vertices.push(radius * Math.cos(p * TWOPI), 2 * p * radius - 300, radius * Math.sin(p * TWOPI));
    }
    return vertices;
};
//# sourceMappingURL=helix1.js.map