// morphtarget generators
// plane
export const plane = (state) => {
    const vertices = [], amountX = 12, amountZ = 16, separation = 0.15 * state['cloudRadius'], //150 
    offsetX = ((amountX - 1) * separation) / 2, offsetZ = ((amountZ - 1) * separation) / 2;
    for (let i = 0; i < state['particles']; i++) {
        const x = (i % amountX) * separation;
        const z = Math.floor(i / amountX) * separation;
        const y = (Math.sin(x * 0.5) + Math.sin(z * 0.5)) * 200;
        vertices.push(x - offsetX, y, z - offsetZ);
    }
    return vertices;
};
//# sourceMappingURL=plane.js.map