# Vue前端开发的笔记

涂轶翔



## 关于Vue中加载Pomelo

Pomelo和SocketIO的模块是由main.vue进行加载，然后任何地方都可以访问 `pomelo` 这个全局变量

需要注意的是，`pomelo.on('route', callback)` 如果多次调用，是不会清除之前所添加的回调函数的，所以我的解决方案如下：  
​	在main.vue中有一个on_receive字典，里面存储相应route应该调用的方法。on_receive应该在pomelo加载完之后初始化，之后任何时候可以通过修改其中的值来修改回调。



## 关于在哪里写js

`<script>` 里面有几个部分：

#### `data()`

我目前只是用它来初始化一些数据，以防止undefined造成一些无法预期的结果

#### `methods()`

可以理解为vue的这一个component是一个类，然后methods里面定义其中的函数。函数要想访问成员变量/函数都需要加 `this.` 

#### `created()` `mounted()` `beforeMount()` 等

是在vue的不同阶段执行（一次）的代码，具体可以参考[官方文档](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
