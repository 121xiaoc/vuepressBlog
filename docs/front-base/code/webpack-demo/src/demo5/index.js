// import _ from 'lodash';
// import printMe from './print.js';
import { cube, square } from './math.js';
  function component() {
    var element = document.createElement('div');
    element.innerHTML = [
      'Hello webpack!',
      '5 cubed is equal to ' + cube(5),
      '5 square is qqual to' + square(5)
    ].join('\n\n');
    console.log(11111111)
    return element;
  }

  document.body.appendChild(component());