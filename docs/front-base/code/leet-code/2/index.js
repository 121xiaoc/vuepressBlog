/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
// var addTwoNumbers = function(l1, l2) {

// };
function ListNode(val) {
  this.val = val;
  this.next = null;
}
var addTwoNumbers = function(l1, l2) {
  var startNode = null
  var node = null
  var isJW = false // 是否进位
  while(l1 || l2) {
    var value = 0
    if(l1) {
      value += l1.val
      l1 = l1.next
    }
    if(l2) {
      value += l2.val
      l2 = l2.next
    }
    isJW && (value = value + 1)
    if(value >= 10) {
      value = value % 10
      isJW = true
    } else {
      isJW = false
    }
    if(node) {
      var preNode = node
      node = new ListNode(value)
      preNode.next = node
    } else {
      node = new ListNode(value)
      startNode = node
    }
  }
  if(isJW) {
    var preNode = node
    node = new ListNode(1)
    preNode.next = node
  }
  return startNode
};

var node1 = new ListNode(2)
var node2 = new ListNode(4)
var node3 = new ListNode(3)

var node4 = new ListNode(5)
var node5 = new ListNode(6)
var node6 = new ListNode(4)

node1.next = node2
node2.next = node3
node4.next = node5
node5.next = node6

var result = addTwoNumbers(node1, node4)
console.log(result)

// 第一次提交 没有考率其中有一个是 null 
// l1.val + l2.val
// so l1 ? l1.val : 0 + l2 ? l2.val : 0

/**
 * 第二次提交 三目运算符优先级问题
 * l1 ? l1.val : 0 + l2 ? l2.val : 0
 */