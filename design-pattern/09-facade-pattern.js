/**
 * 外观模式（Facade Pattern）是一种结构型设计模式，它为一组复杂的子系统提供了一个更简单的接口。
 */

// 子系统1
class Subsystem1 {
  operation1() {
    console.log("Subsystem1：执行操作1");
  }
}

// 子系统2
class Subsystem2 {
  operation2() {
    console.log("Subsystem2：执行操作2");
  }
}

// 外观类
class Facade {
  constructor() {
    this.subsystem1 = new Subsystem1();
    this.subsystem2 = new Subsystem2();
  }

  operation() {
    this.subsystem1.operation1();
    this.subsystem2.operation2();
  }
}

// 客户端代码
const facade = new Facade();
facade.operation(); // Output: Subsystem1：执行操作1，Subsystem2：执行操作2
