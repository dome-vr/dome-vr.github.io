* __sed-file-del-lines README__

* copy tsc-all-errors.log to tsc.log

* run  sed -i '/TS2304/d;/TS2503/d' ./tsc.log
  * this will filter all name not found errors

* diff tsc.log tsc-goal.log should be nothing
