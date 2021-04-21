// * transform3d.ts
// * creates a transform matrix from a transform model.
// * transform model has form: transform:<br> 
// ```{t: [tx,ty,tz],
//     q: [qx,qy,qz,qw],
//     e: [ep,ey,er],
//     s: [sx,sy,sz]}```
// where t is translation, q is quaternion-rotation, e is euler-rotation
// and s is scale.<br> 
// Each has canonical identity default<br>
// At most one of q or e should be used 
//
// * ```Transform3d.apply(transform, [actor])``` takes as first arg a (JSON.parsed)
// transform model, i.e. a javascript object containing numeric arrays.<br>
// A transform matrix is created and returned<br>
// An optional second arg is a THREE.js Object3d on which the created
// matrix is applied.
//
// * NOTE: mm = (new THREE.Matrix4()).set(e0,e1,...,e15) takes arguments in
//   row-major order, i.e set(m11,m12,m13,m14,m21,...m44) (using math indices).
//   However, when a matrix is decomposed into elements, for example,
//   [a0,a1,a2,...,a15] = mm.elements, the a-array is in column-major order,
//   i.e [m11,m21,m31,m41,m12,...m44] (using math indices).
//   Thus [ei] !== [ai]
// singleton instance - exported
let transform3d;
class Transform3d {
    constructor() {
        transform3d = this;
    }
    static create() {
        if (transform3d === undefined) {
            transform3d = new Transform3d();
        }
    }
    initialize(config) {
        //console.log(`services/transform3d initializing`);
    }
    apply(transform, actor) {
        let m = new THREE.Matrix4(), // identity matrix
        mr = undefined, mt = undefined, ms = undefined;
        //console.log(`actor = ${actor}`);
        //console.log(`transform = ${transform}:`);
        //console.dir(transform);
        if (actor === undefined) {
            return;
        }
        if (transform === undefined || Object.keys(transform).length === 0) {
            return;
        }
        // transform matrix component matrices
        if (transform['q']) {
            const qa = transform.q, q = new THREE.Quaternion(qa[0], qa[1], qa[2], qa[3]);
            mr = (new THREE.Matrix4()).makeRotationFromQuaternion(q);
        }
        if (transform['e']) {
            const ea = transform.e, euler = new THREE.Euler(ea[0], ea[1], ea[2]); //default pyr (xyz)
            mr = (new THREE.Matrix4()).makeRotationFromEuler(euler);
            //console.log(`euler m = ${m}`);
        }
        if (transform['t']) {
            const ta = transform.t;
            mt = (new THREE.Matrix4()).makeTranslation(ta[0], ta[1], ta[2]);
            //console.log(`transform mt = ${mt}`);
        }
        if (transform['s']) {
            const sa = transform.s;
            ms = (new THREE.Matrix4()).makeScale(sa[0], sa[1], sa[2]);
            //console.log(`scale ms = ${ms}`);
        }
        // * transform matrix - first scale, then rotate, then translate
        // * NOTE: m = [mt*mr*ms], so m*v = mt*(mr*(ms*v)))
        m = mt || m;
        if (mr) {
            m = m.multiply(mr);
        }
        if (ms) {
            m = m.multiply(ms);
        }
        // final matrix m
        //console.log(`final matrix m = ${m}:`);
        //console.dir(m);
        // if Object3d-actor is sent as second arg apply matrix to it
        //console.log(`actor = ${actor}`);
        //console.dir(actor);
        if (actor) {
            //console.log(`applying matrix m = ${m}:`);
            //console.dir(m);
            actor.applyMatrix4(m);
        }
        // return created matrix representing model transform input
        return m;
    }
    // for unit test verification - does m1 equal m2?
    // careful of precision - .01 error is very generous
    // * NOTE: m.elements is given in column-major!
    //   Thus m[i][j].elements = [m00, m10, m20, m30, m01, m11, m21, m31, ...]
    //                            column0           , column1 etc...
    verify(m, mm) {
        const a = m.elements, aa = mm.elements, d = [], sa = [];
        let flag = true, i;
        for (i = 0; i < a.length; i++) {
            d[i] = Math.abs(a[i] - aa[i]);
            sa.push("a[" + i + "]=" + a[i] + " aa[" + i + "]=" + aa[i] + " d[i]=" + d[i]);
            if (Math.abs(d[i]) > 0.01) {
                flag = false;
                for (i = 0; i < sa.length; i++) {
                    console.error("error: " + sa[i]);
                }
                break;
            }
        }
        return flag;
    }
}
// enforce singleton export
Transform3d.create();
export { transform3d };
//# sourceMappingURL=transform3d.js.map