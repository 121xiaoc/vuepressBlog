# CSS
## 移动端 .5 高度分隔线
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