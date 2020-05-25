// import _ from 'lodash'
import pirnt from './print'
console.log(
  import ('lodash').then(_ => {
    _.join(['Another', 'module', 'loaded!', 'gzc'], ' ')
  })
);
console.log('12345')
pirnt('gzc12121')