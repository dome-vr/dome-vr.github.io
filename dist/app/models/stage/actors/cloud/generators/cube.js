// morphtarget generators
// cube
export const cube = (state) => {
    const vertices = [], amount = 8, separation = 0.15 * state['cloudRadius'], //150 
    offset = ((amount - 1) * separation) / 2;
    for (let i = 0; i < state['particles']; i++) {
        const x = (i % amount) * separation;
        const y = Math.floor((i / amount) % amount) * separation;
        const z = Math.floor(i / (amount * amount)) * separation;
        vertices.push(x - offset, y - offset, z - offset);
    }
    return vertices;
};
//# sourceMappingURL=cube.js.map