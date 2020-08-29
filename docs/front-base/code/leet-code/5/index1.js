// 239 滑动窗口最大值
var maxSlidingWindow = function(nums, k) {
  var array = [] // 窗口
  var result = []
  for(var i = 0; i < nums.length; i++) {
    if(i - k >= 0 && i - k == array[0]) {
      array.shift()
    }
    var length = array.length
    while(length > 0 && nums[i] > nums[array[length - 1]]) {
      array.pop()
      length = array.length
    }
    array.push(i)
    if(i >= k - 1) {
      result.push(nums[array[0]])
    }
  }
  return result
};

console.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3))


