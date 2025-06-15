class Subject {
  constructor() {
    this.observers = new Set();
  }

  // 添加观察者
  addObserver(observer) {
    if (typeof observer.update === "function") {
      this.observers.add(observer);
    } else {
      console.warn("Observer must have an update method");
    }
    return this;
  }

  // 移除观察者
  removeObserver(observer) {
    this.observers.delete(observer);
    return this;
  }

  // 通知所有观察者
  notify(data) {
    this.observers.forEach((observer) => {
      try {
        observer.update(data);
      } catch (error) {
        console.error("Error in observer update:", error);
      }
    });
    return this;
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }

  update(data) {
    console.log(`${this.name} received update:`, data);
  }
}

// 创建被观察者和观察者
const subject = new Subject();
const observer1 = new Observer("Observer 1");
const observer2 = new Observer("Observer 2");

// 添加观察者
subject.addObserver(observer1).addObserver(observer2);

// 通知更新
subject.notify({ message: "State changed!" });
// 输出:
// Observer 1 received update: { message: 'State changed!' }
// Observer 2 received update: { message: 'State changed!' }

// 移除观察者
subject.removeObserver(observer1);

// 再次通知
subject.notify({ message: "Another update" });
// 输出:
// Observer 2 received update: { message: 'Another update' }
