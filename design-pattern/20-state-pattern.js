/**
 * @class State
 * @description 状态模式（State）是一种行为型设计模式，它允许
 * 对象在其内部状态发生改变时改变其行为。状态模式通过将每个状态封
 * 装在一个类中，使得对于该状态进行的任何操作都可以在该类中处理。
 * 从而将状态转换的代码从主要业务逻辑中抽离出来，避免出现大量 if-else 语句。
 */

class Context {
  constructor() {
    this.state = new ConcreteStateA(this);
  }

  setState(state) {
    this.state = state;
  }

  request() {
    this.state.handle();
  }
}

class State {
  constructor(context) {
    this.context = context;
  }

  handle() {
    throw new Error("You have to implement the method handle!");
  }
}

class ConcreteStateA extends State {
  handle() {
    console.log("Handle State A");
    this.context.setState(new ConcreteStateB(this.context));
  }
}

class ConcreteStateB extends State {
  handle() {
    console.log("Handle State B");
    this.context.setState(new ConcreteStateA(this.context));
  }
}

const context = new Context();
context.request(); // Handle State A
context.request(); // Handle State B
context.request(); // Handle State A
