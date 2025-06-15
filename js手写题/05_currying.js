function curry(fn) {
  const arity = fn.length; // 获取函数的参数数量

  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// 示例函数
function add(a, b, c) {
  return a + b + c;
}

// 柯里化
const curriedAdd = curry(add);

// 逐步调用
console.log(curriedAdd(1)(2)(3)); // 输出: 6
console.log(curriedAdd(1, 2)(3)); // 输出: 6
console.log(curriedAdd(1)(2, 3)); // 输出: 6
console.log(curriedAdd(1, 2, 3)); // 输出: 6

// 参数复用
const addFive = curriedAdd(5);
console.log(addFive(2)(3)); // 输出: 10
console.log(addFive(10)(20)); // 输出: 35
