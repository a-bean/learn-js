class TaskQueue {
  constructor() {
    this.tasks = []; // 任务队列
    this.isPaused = false; // 暂停状态
    this.isRunning = false; // 运行状态
  }

  // 添加任务
  addTask(task) {
    this.tasks.push(task);
    if (!this.isRunning && !this.isPaused) {
      this.run();
    }
    return this;
  }

  // 运行任务队列
  async run() {
    this.isRunning = true;
    while (this.tasks.length > 0 && !this.isPaused) {
      const task = this.tasks.shift();
      try {
        await task();
      } catch (error) {
        console.error("Task error:", error);
      }
    }
    this.isRunning = false;
  }

  // 暂停队列
  pause() {
    this.isPaused = true;
  }

  // 恢复队列
  resume() {
    if (this.isPaused && this.tasks.length > 0) {
      this.isPaused = false;
      if (!this.isRunning) {
        this.run();
      }
    }
  }

  // 清空队列
  clear() {
    this.tasks = [];
    this.isPaused = false;
    this.isRunning = false;
  }
}

// 示例使用
async function example() {
  const queue = new TaskQueue();

  // 模拟异步任务
  const task1 = () =>
    new Promise((resolve) =>
      setTimeout(() => {
        console.log("Task 1 executed");
        resolve();
      }, 1000)
    );

  const task2 = () =>
    new Promise((resolve) =>
      setTimeout(() => {
        console.log("Task 2 executed");
        resolve();
      }, 1000)
    );

  const task3 = () =>
    new Promise((resolve) =>
      setTimeout(() => {
        console.log("Task 3 executed");
        resolve();
      }, 1000)
    );

  // 添加任务
  queue.addTask(task1).addTask(task2).addTask(task3);

  // 模拟暂停
  setTimeout(() => {
    console.log("Pausing queue...");
    queue.pause();
  }, 1500);

  // 模拟恢复
  setTimeout(() => {
    console.log("Resuming queue...");
    queue.resume();
  }, 3000);
}

// 运行示例
example();
