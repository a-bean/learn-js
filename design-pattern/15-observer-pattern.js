/**
 * @class Observer
 * @description 观察者模式是一种行为设计模式，其中对象之间存在一对多的依赖关系。
 * 当一个对象的状态发生变化时，它的所有依赖者都得到通知并自动更新。观察者模式将对
 * 象之间的关系解耦，使得它们可以独立变化。
 */

class Subject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    this.observers.push(observer);
  }

  detach(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify() {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }
}

class Observer {
  update(subject) {}
}

class ConcreteSubject extends Subject {
  constructor(state) {
    super();
    this.state = state;
  }

  set_state(state) {
    this.state = state;
    this.notify();
  }

  get_state() {
    return this.state;
  }
}

class ConcreteObserver extends Observer {
  update(subject) {
    console.log(`Got updated value: ${subject.get_state()}`);
  }
}

let subject = new ConcreteSubject("initial state");
let observer = new ConcreteObserver();

subject.attach(observer);
subject.set_state("new state");
