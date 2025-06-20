function sum(...args) {
  // 内部函数用于计算总和
  function calculateSum() {
    return args.reduce((acc, val) => acc + val, 0);
  }

  // 返回一个函数，允许继续添加参数
  const innerFunction = (...newArgs) => {
    args.push(...newArgs);
    return innerFunction; // 返回自身以支持链式调用
  };

  // 添加 sumOf 方法来获取总和
  innerFunction.sumOf = calculateSum;

  return innerFunction;
}

// 设计一个sum函数，使其满足以下要求
sum(1, 2).sumOf(); // 返回 3

sum(1, 2)(3).sumOf(); // 返回 6

sum(1)(2, 3, 4).sumOf(); // 返回 10

sum(1, 2)(3, 4)(5).sumOf(); // 返回 15
// 测试代码
console.log(sum(1, 2).sumOf()); // 输出 3
console.log(sum(1, 2)(3).sumOf()); // 输出 6
console.log(sum(1)(2, 3, 4).sumOf()); // 输出 10
console.log(sum(1, 2)(3, 4)(5).sumOf()); // 输出 15
