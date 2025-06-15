class MyPromise {
  constructor(executor) {
    this.state = "pending"; // Promise 状态：pending, fulfilled, rejected
    this.value = undefined; // 成功值或失败原因
    this.onFulfilledCallbacks = []; // 成功回调队列
    this.onRejectedCallbacks = []; // 失败回调队列

    const resolve = (value) => {
      if (this.state !== "pending") return;
      if (value instanceof MyPromise) {
        return value.then(resolve, reject);
      }
      this.state = "fulfilled";
      this.value = value;
      queueMicrotask(() => {
        this.onFulfilledCallbacks.forEach((callback) => callback(this.value));
      });
    };

    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = reason;
      queueMicrotask(() => {
        this.onRejectedCallbacks.forEach((callback) => callback(this.value));
      });
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // 确保 onFulfilled 和 onRejected 是函数
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    return new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        try {
          const result = onFulfilled(this.value);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };

      const handleRejected = () => {
        try {
          const result = onRejected(this.value);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === "fulfilled") {
        queueMicrotask(handleFulfilled);
      } else if (this.state === "rejected") {
        queueMicrotask(handleRejected);
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        MyPromise.resolve(onFinally()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

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
