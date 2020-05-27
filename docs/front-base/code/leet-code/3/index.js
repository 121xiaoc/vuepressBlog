var lengthOfLongestSubstring = function(s) {
  var count = s ? 1 : 0;
  console.log(1)
  for(var i = 1; i <= s.length; i++) {
    if(count != i) 
      break
    for(var j = 0; j < s.length-count; j++) {
      var str = s.substring(j, j + i)
      if(str.indexOf(s[j + i]) == -1) {
        count++
        break
      }
    }
  }
  return count
};

lengthOfLongestSubstring('abcabcbb')
lengthOfLongestSubstring('bbbbb')
lengthOfLongestSubstring('pwwkew')




