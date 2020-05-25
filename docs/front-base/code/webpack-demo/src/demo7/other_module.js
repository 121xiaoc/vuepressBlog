console.log(
  import('lodash').then( _ => {
    _.join(['Another', 'module', 'loaded!'], ' ')
  })
);