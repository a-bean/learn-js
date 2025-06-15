// 异步加法
function asyncAdd(a, b, cb) {
  setTimeout(() => {
    cb(null, a + b);
  }, Math.random() * 1000);
}
async function total() {
  const res1 = await sum(1, 2, 3, 4, 5, 6, 4);
  const res2 = await sum(1, 2, 3, 4, 5, 6, 4);
  return [res1, res2];
}
total();
// 实现下sum函数。注意不能使用加法，在sum中借助asyncAdd完成加法。尽可能的优化这个方法的时间。
function sum(...args) {
  // 将回调风格的 asyncAdd 转换为 Promise
  function asyncAddPromise(a, b) {
    return new Promise((resolve, reject) => {
      asyncAdd(a, b, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // 如果参数少于 2 个，直接返回结果
  if (args.length === 0) return Promise.resolve(0);
  if (args.length === 1) return Promise.resolve(args[0]);

  // 递归合并函数
  async function merge(numbers) {
    if (numbers.length <= 1) return numbers[0] || 0;

    const promises = [];
    // 两两配对并行计算
    for (let i = 0; i < numbers.length; i += 2) {
      if (i + 1 < numbers.length) {
        promises.push(asyncAddPromise(numbers[i], numbers[i + 1]));
      } else {
        promises.push(Promise.resolve(numbers[i])); // 奇数个时保留最后一个
      }
    }

    // 等待本轮结果
    const results = await Promise.all(promises);

    // 递归合并结果
    return merge(results);
  }

  return merge(args);
}
