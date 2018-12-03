// * index-write-scorefile.js 

// Setup basic application
var fs = require('fs'),
    path = require('path'),
    argv = process.argv,
    scorefile = argv[2] || '../scores/new.score', //cmdline or default 
    action = {},
    actions = [],
    i=0,
    NUMBER=10;

  // generate score-file
  console.log(`\nserver: creating scorefile ${scorefile}`);
  action =  {t:'narrative', f:'foo', s: `foo-e2e-${i}`};
  fs.writeFileSync(scorefile, `[${JSON.stringify(action)},\n`, function(err) {
    if (err){
      console.error(err);
      exit(-1);
    }
  });
  i++;
  while(i < NUMBER){
    action =  {t:'narrative', f:'foo', s: `foo-e2e-${i}`};
    if(i < NUMBER-1){
      fs.appendFileSync(scorefile, `${JSON.stringify(action)},\n`, 
        function(err) {
          if (err){
            console.error(err);
            exit(-1);
          }
        }
      );
    }else{
      fs.appendFileSync(scorefile, `${JSON.stringify(action)}]\n`, 
        function(err) {
          if (err){
            console.error(err);
            exit(-1);
          }
        }
      );
    }
    i++;
  }
