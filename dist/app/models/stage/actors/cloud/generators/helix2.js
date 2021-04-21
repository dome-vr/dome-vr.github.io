// morphtarget generators
// helix2
export const helix2 = (state) => {
    const TWOPI = 2 * Math.PI, radius = 0.6 * state['cloudRadius'], // 600
    vertices = [], particles = state['particles'];
    let i;
    for (let j = 0; j < particles; j++) {
        if (j % 2 === 0) {
            i = j;
        }
        else {
            i = particles / 2.0 + j;
        }
        const p = i / particles;
        vertices.push(radius * Math.cos(3 * p * TWOPI), 2 * p * radius - 600, radius * Math.sin(3 * p * TWOPI));
    }
    return vertices;
};
//# sourceMappingURL=helix2.js.map