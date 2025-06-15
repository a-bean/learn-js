class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(callback);
    return this;
  }

  // 触发事件
  emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      const callbacks = this.events.get(eventName);
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${eventName} callback:`, error);
        }
      });
    }
    return this;
  }

  // 取消订阅
  off(eventName, callback) {
    if (this.events.has(eventName)) {
      const callbacks = this.events.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.events.delete(eventName);
      }
    }
    return this;
  }

  // 一次性订阅
  once(eventName, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(eventName, onceWrapper);
    };
    this.on(eventName, onceWrapper);
    return this;
  }
}

const emitter = new EventEmitter();

// 订阅事件
emitter.on("greet", (name) => console.log(`Hello, ${name}!`));

// 触发事件
emitter.emit("greet", "Alice"); // 输出: Hello, Alice!

// 一次性事件
emitter.once("once", () => console.log("This runs once"));
emitter.emit("once"); // 输出: This runs once
emitter.emit("once"); // 无输出
