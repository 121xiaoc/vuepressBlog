
var findMedianSortedArrays = function(nums1, nums2) {
  var n = nums1.length
  var m = nums2.length
  var k = n + m
  var odd = k % 2 === 0 // 是否是偶数
  odd && (k = k - 1)
  // console.log(1)
  return splitArray(nums1, nums2, Math.floor(k / 4) , Math.floor(k / 2))
  function splitArray(array1, array2, k, all) {
    var k = Math.floor(all % 2 == 0 ? all / 2 : all / 2 + 1)
    var spliceNum = 0
    if(array1.length == 0) {
      var index = all == 0 ? 0 : all
      if(odd) {
        return (array2[index] + array2[index + 1]) / 2
      } else {
        return array2[index]
      }
    }
    if(array2.length == 0) {
      var index = all == 0 ? 0 : all
      if(odd) {
        return (array1[index] + array1[index + 1]) / 2
      } else {
        return array1[index]
      }
    }
    if(all == 0) { // 表示 不是 1 就是 2个
      return (array1[0] + array2[0]) / 2
    }
    var right1 = array1.length > k ? k - 1 : array1.length - 1 
    var right2 = array2.length > k ? k - 1 : array2.length - 1
    var flat = array1[right1] <= array2[right2]
    if(flat) {
      spliceNum = array1.splice(0, right1 + 1).length
    } else {
      spliceNum = array2.splice(0, right2 + 1).length
    }
    all = all - spliceNum
    if(all == 0) {
      
      if(odd) {
        odd = false       
        return (((array1[0] <= array2[0] && array1[0] != undefined) || array2[0] == undefined ? array1[0] : array2[0]) + splitArray(array1, array2, Math.floor(1 / 2), 1)) / 2
      } else {
        return (array1[0] <= array2[0] && array1[0] != undefined) || array2[0] == undefined ? array1[0] : array2[0]
      }
    }
    return splitArray(array1, array2, Math.floor(all / 2), all)
  }
};

var nums1 = [1, 3]
var nums2 = [2]
findMedianSortedArrays(nums1, nums2)

nums1 = [1, 2]
nums2 = [3, 4]
findMedianSortedArrays(nums1, nums2)

var nums1 = []
var nums2 = [1]
findMedianSortedArrays(nums1, nums2)

var nums1 = []
var nums2 = [1, 2, 3, 4]
findMedianSortedArrays(nums1, nums2)

findMedianSortedArrays(nums1, nums2)

[1,2]
[1,2,3]
findMedianSortedArrays([1,2], [1,2,3])

[2,3]
[1]
findMedianSortedArrays([2,3], [1])