/**
 * 自定义Promise实现类
 * 符合Promises/A+规范的Promise实现
 */
class MyPromise {
  /**
   * Promise构造函数
   * @param {Function} executor 执行器函数，接收resolve和reject两个参数
   */
  constructor(executor) {
    this.state = "pending"; // Promise 状态：pending(等待态), fulfilled(成功态), rejected(失败态)
    this.value = undefined; // 存储成功值或失败原因
    this.onFulfilledCallbacks = []; // 成功回调函数队列
    this.onRejectedCallbacks = []; // 失败回调函数队列

    /**
     * resolve函数，将Promise状态改为fulfilled
     * @param {any} value Promise成功值
     */
    const resolve = (value) => {
      if (this.state !== "pending") return; // 状态一旦改变，就不能再变
      if (value instanceof MyPromise) {
        // 如果value是Promise实例，则递归处理
        return value.then(resolve, reject);
      }
      this.state = "fulfilled";
      this.value = value;
      // 使用微任务执行所有成功回调
      queueMicrotask(() => {
        this.onFulfilledCallbacks.forEach((callback) => callback(this.value));
      });
    };

    /**
     * reject函数，将Promise状态改为rejected
     * @param {any} reason Promise失败原因
     */
    const reject = (reason) => {
      if (this.state !== "pending") return; // 状态一旦改变，就不能再变
      this.state = "rejected";
      this.value = reason;
      // 使用微任务执行所有失败回调
      queueMicrotask(() => {
        this.onRejectedCallbacks.forEach((callback) => callback(this.value));
      });
    };

    // 执行器函数可能会抛出错误，需要捕获
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * then方法，返回一个新的Promise实例
   * @param {Function} onFulfilled 成功回调函数
   * @param {Function} onRejected 失败回调函数
   * @returns {MyPromise} 新的Promise实例
   */
  then(onFulfilled, onRejected) {
    // 参数校验，确保onFulfilled和onRejected是函数
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    // 返回新的Promise实例，实现链式调用
    return new MyPromise((resolve, reject) => {
      /**
       * 处理成功状态的函数
       */
      const handleFulfilled = () => {
        try {
          const result = onFulfilled(this.value);
          // 处理返回值是Promise的情况
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };

      /**
       * 处理失败状态的函数
       */
      const handleRejected = () => {
        try {
          const result = onRejected(this.value);
          // 处理返回值是Promise的情况
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };

      // 根据当前Promise状态执行相应的操作
      if (this.state === "fulfilled") {
        queueMicrotask(handleFulfilled);
      } else if (this.state === "rejected") {
        queueMicrotask(handleRejected);
      } else {
        // pending状态时，将回调存入队列
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });
  }

  /**
   * catch方法，用于处理Promise的错误情况
   * @param {Function} onRejected 失败回调函数
   * @returns {MyPromise} 新的Promise实例
   */
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
   * finally方法，无论Promise结果如何都会执行
   * @param {Function} onFinally finally回调函数
   * @returns {MyPromise} 新的Promise实例
   */
  finally(onFinally) {
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        MyPromise.resolve(onFinally()).then(() => {
          throw reason;
        })
    );
  }

  /**
   * 将给定的值转换为Promise对象
   * @param {any} value 要转换的值
   * @returns {MyPromise} Promise实例
   */
  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  /**
   * 返回一个rejected状态的Promise对象
   * @param {any} reason 拒绝原因
   * @returns {MyPromise} Promise实例
   */
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  /**
   * 接收一组Promise实例，当所有Promise都成功时返回成功，任一失败则返回失败
   * @param {Array<MyPromise>} promises Promise实例数组
   * @returns {MyPromise} Promise实例
   */
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let resolvedCount = 0;
      if (!promises.length) return resolve(results);

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then((value) => {
          results[index] = value;
          resolvedCount++;
          if (resolvedCount === promises.length) resolve(results);
        }, reject);
      });
    });
  }

  /**
   * 接收一组Promise实例，返回最先完成的Promise结果
   * @param {Array<MyPromise>} promises Promise实例数组
   * @returns {MyPromise} Promise实例
   */
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// 基本用法
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve("Success!"), 1000);
});

promise
  .then((value) => {
    console.log(value); // 输出: Success!
    return "Next step";
  })
  .then((value) => console.log(value)); // 输出: Next step

// 错误处理
new MyPromise((resolve, reject) => {
  reject("Error occurred");
}).catch((error) => console.log(error)); // 输出: Error occurred

// MyPromise.all
MyPromise.all([
  MyPromise.resolve(1),
  MyPromise.resolve(2),
  new MyPromise((resolve) => setTimeout(() => resolve(3), 1000)),
]).then((values) => console.log(values)); // 输出: [1, 2, 3]

// MyPromise.race
MyPromise.race([
  new MyPromise((resolve) => setTimeout(() => resolve("First"), 1000)),
  new MyPromise((resolve) => setTimeout(() => resolve("Second"), 500)),
]).then((value) => console.log(value)); // 输出: Second
