// import _ from 'lodash';
import './style.css'
  function component() {
    if(process.env.NODE_ENV === 'production') {
      console.log('is production mode')
    }
    var element = document.createElement('div');
    element.innerHTML = [
      'Hello webpack!',
      '5 cubed is equal to',
      '5 square is qqual to'
    ].join('\n\n');
    console.log(11111111)
    return element;
  }

  document.body.appendChild(component());