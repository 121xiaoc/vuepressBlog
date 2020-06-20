# CSS

## 移动端 0.5px高度分隔线
(2020.06.17)
``` css {9}
&::after {
  position: absolute;
  box-sizing: border-box;
  content: ' ';
  pointer-events: none;
  right: 0;
  bottom: 0;
  left: 0;
  border-bottom: 1px solid #ebedf0;
  transform: scaleY(.5);
}
```
## 问题 VUE scoped
子组件第一个div用了和父组件中已存在的class,导致父组件设置的样式应用到了子组件
