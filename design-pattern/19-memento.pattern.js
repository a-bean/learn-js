/**
 * @class Memento
 * @description 备忘录模式（Memento）是一种行为型设计模式，
 * 它允许你在不暴露对象实现细节的情况下保存和恢复对象的状态。
 * 备忘录模式涉及到三个角色：备忘录（Memento）, 发起人（Originator）, 管理者（Caretaker）。
 */

class Memento {
  constructor(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }
}

class Originator {
  constructor(state) {
    this.state = state;
  }

  setState(state) {
    this.state = state;
  }

  createMemento() {
    return new Memento(this.state);
  }

  restoreMemento(memento) {
    this.state = memento.getState();
  }

  getState() {
    return this.state;
  }
}

class Caretaker {
  constructor() {
    this.mementos = [];
  }

  addMemento(memento) {
    this.mementos.push(memento);
  }

  getMemento(index) {
    return this.mementos[index];
  }
}

const originator = new Originator("State A");
const caretaker = new Caretaker();

// Save state
caretaker.addMemento(originator.createMemento());

// change state
originator.setState("State B");

console.log(`Current State: ${originator.getState()}`);

// Restore state
originator.restoreMemento(caretaker.getMemento(0));

console.log(`Current State: ${originator.getState()}`);
