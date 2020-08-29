/**
 * @param {string} moves
 * @return {boolean}
 */
var judgeCircle = function(moves) {
  var result1 = 0
  var result2 = 0
  for(var i = 0; i < moves.length; i++) {
    switch(moves[i]) {
      case 'R':
        result1 ++
        break
      case 'L':
        result1 --
        break
      case 'U':
        result2 ++
        break
      case 'D':
        result2 --
        break
    }
  }
  return result1 == 0 && result2 == 0
};

console.log(judgeCircle("UD"))
