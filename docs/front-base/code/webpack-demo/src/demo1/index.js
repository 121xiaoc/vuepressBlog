import _ from 'lodash';
import './style.css'
import Icon from './wuliu.png'
function component() {
  var element = document.createElement('div');

  // Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
  element.innerHTML = _.join(['Hello', 'webpack', '中午不睡'], ' ');
  const image = new Image()
  image.src = Icon
  element.appendChild(image)
  var element2 = document.createElement('div');
  element2.innerHTML = _.join(['Hello', 'webpack', '中午不睡'], ' ');
  element2.classList.add('red')
  element.appendChild(element2)
  return element;
}

document.body.appendChild(component());