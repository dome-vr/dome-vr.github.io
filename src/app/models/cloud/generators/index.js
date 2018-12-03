fs = require('fs');

const lsSync = (dir = '.', s = '// _generators.ts\n\n') => {
  fs.readdirSync(dir).forEach(file => {
    if(!file.match(/index|_generators|.swp/)){
      let f = file.split('.')[0];    // cut suffix '.ts'
      //console.log(`f = ${f}`);
      let path = dir.concat(`/${f}`);  // exp: ./cube
      //console.log(`path = ${path}`);
      s = s.concat(`export {${f}} from '${path}';\n`);
      //console.log(`s = ${s}`);
    }
  });
  return s;
}

console.log(lsSync());
fs.writeFileSync('_generators.ts', lsSync());
