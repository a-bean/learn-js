// 1.
const obj = {
  a: 0,
};

obj["1"] = 0;

obj[++obj.a] = obj.a++;
const values = Object.values(obj);

obj[values[1]] = obj.a;
console.log(obj); // { '1': 1, '2': 2, a: 2 }

// 2.
var a = 1;
function fn() {
  console.log(a);
  let a = 2;
}

fn(); // 报错：Uncaught ReferenceError: Cannot access 'a' before initialization

// 二次封装组件
// 深浅拷贝
// 幽灵依赖
// 怎么创建一个没有prototype为空的对象
// 如何获取元素的width
// 作用域
