/**
 * 桥接模式（Bridge Pattern）是一种结构型设计模式，它将一个对象的抽象和实现分离开来，从而使它们都可以独立变化。
 */
// 实现类接口
class Implementor {
  operationImpl() {
    console.log("Implementor：执行操作");
  }
}

// 抽象类
class Abstraction {
  constructor(implementor) {
    this.implementor = implementor;
  }

  operation() {
    this.implementor.operationImpl();
  }
}

// 扩展抽象类
class RefinedAbstraction extends Abstraction {
  otherOperation() {
    console.log("RefinedAbstraction：其他操作");
  }
}

// 使用桥接模式
const implementor = new Implementor();
const abstraction = new Abstraction(implementor);
abstraction.operation(); // Output: Implementor：执行操作

const refinedAbstraction = new RefinedAbstraction(implementor);
refinedAbstraction.operation(); // Output: Implementor：执行操作
refinedAbstraction.otherOperation(); // Output: RefinedAbstraction：其他操作
