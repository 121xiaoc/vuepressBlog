import _ from 'lodash'
function component() {
  var element = document.createElement('div');
  var button = document.createElement('button')
  var br = document.createElement('br');
  button.innerHTML = 'Click me and look at the console!';
  button.onclick = e => import(/* webpackChunkName: "print" */ './print').then(module => {
    var print = module.default;
    print();
  });
  
  element.appendChild(br);
  element.appendChild(button);
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  return element;
}
document.body.appendChild(component());