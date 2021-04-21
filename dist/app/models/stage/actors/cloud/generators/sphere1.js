// morphtarget generators
// sphere1
export const sphere1 = (state) => {
    const radius = 0.75 * state['cloudRadius'], // 750
    vertices = [], particles = state['particles'];
    for (let i = 0; i < particles; i++) {
        const phi = Math.acos(-1 + (2 * i) / particles), theta = Math.sqrt(particles * Math.PI) * phi;
        vertices.push(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi));
    }
    return vertices;
};
//# sourceMappingURL=sphere1.js.map