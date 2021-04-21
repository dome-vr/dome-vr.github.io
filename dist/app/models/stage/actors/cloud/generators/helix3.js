// morphtarget generators
// helix3
export const helix3 = (state) => {
    const TWOPI = 2 * Math.PI, radius = 0.6 * state['cloudRadius'], // 600
    vertices = [], particles = state['particles'];
    let p;
    for (let j = 0; j < particles; j++) {
        if (j % 2 === 0) {
            p = (j + particles / 2.0 - particles) / particles;
        }
        else {
            p = j / particles;
        }
        vertices.push(radius * Math.cos(3 * p * TWOPI), 2 * p * radius - 600, radius * Math.sin(3 * p * TWOPI));
    }
    return vertices;
};
//# sourceMappingURL=helix3.js.map