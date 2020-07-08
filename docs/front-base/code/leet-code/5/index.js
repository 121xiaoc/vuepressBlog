
var longestPalindrome = function(s) {
  var point = []
  if(s.length == 1) {
    return s
  } else if (s.length == 2) {
    s[0] == s[1] ? s : s[0]
  }
  for(var i = 0; i < s.length; i++) {
    point[i] = []
    point[i][i] = true
  }
  let max = 1
  let begin = 0
  for(var j = 1; j < s.length; j ++) {
    for(var i = 0; i < j; i ++) {
      if(s[i] == s[j]) {
        if(point[i + 1][j - 1] == undefined || point[i + 1][j - 1]) {
          point[i][j] = true
        } else {
          point[i][j] = false
        }
      } else {
        point[i][j] = false
      }
      if(point[i][j] && (j - i + 1) > max) {
        max = j - i + 1
        begin = i
      }
    }
  }
  console.log(point)
  return s.substring(begin, max)
};

// 测试用例
var str = 'a'
console.log(longestPalindrome(str))
var str = 'aaa'
console.log(longestPalindrome(str))
