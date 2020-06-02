
var findMedianSortedArrays = function(nums1, nums2) {
  var n = nums1.length
  var m = nums2.length
  var k = n + m
  var odd = k % 2 === 0 // 是否是偶数
  return splitArray(nums1, nums2, odd ? Math.floor(k / 4) : Math.floor(k / 4) + 1, k /2)
  function splitArray(array1, array2, k, all) {
    var flat = array1[k - 1] <= array2[k - 1]
    console.log(1)
    if(flat) {
      array1.splice(0, k)
    } else {
      array2.splice(0, k)
    }
    if(k == 1) {
      return flat ? array2[0] : array1[0]
    }
    all = all - k
    return splitArray(array1, array2, Math.floor(all / 2), all)
  }
};

var nums1 = [1, 3]
var nums2 = [2]
findMedianSortedArrays(nums1, nums2)

nums1 = [1, 2]
nums2 = [3, 4]
findMedianSortedArrays(nums1, nums2)