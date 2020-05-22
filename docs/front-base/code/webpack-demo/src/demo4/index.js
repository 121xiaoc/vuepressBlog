import _ from 'lodash';
import printMe from './print.js';
import './style.css'
  function component() {
    var element = document.createElement('div');
    var btn = document.createElement('button');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    btn.innerHTML = 'Click me and check the console111S!';
    btn.onclick = printMe;
    element.classList.add('red')
    element.appendChild(btn);
    return element;
  }

  document.body.appendChild(component());