
var longestPalindrome = function(s) {
  console.log(1)
  for(var i = 0; i < s.length; i++){
    for(var j = 0; j <= i; j++) {
      var str = s.substring(j, s.length - i + j)
      if(str === str.split('').reverse().join('')) {
        return str
      }
    }
  }
  return ''
};
