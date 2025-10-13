// morphtarget generators
// sphere4
export const sphere4 = (state) => {
    const radius = 0.3 * state['cloudRadius'], // 750
    vertices = [], particles = state['particles'];
    for (let i = 0; i < particles; i++) {
        const phi = Math.acos(-1 + (2 * i) / particles), theta = 0.5 * Math.sqrt(particles * Math.PI) * phi;
        vertices.push(0.5 * radius * Math.cos(theta) * Math.sin(phi), 4 * radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi));
    }
    return vertices;
};
//# sourceMappingURL=sphere4.js.map