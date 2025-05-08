/**
 * 装饰模式（Decorator Pattern）是一种结构型设计模式，
 * 它允许在不影响其他对象的情况下，动态地将功能添加到对象中
 */

// 抽象组件类
class Component {
  operation() {
    console.log("Component：基础操作");
  }
}

// 具体组件类
class ConcreteComponent extends Component {
  operation() {
    super.operation();
    console.log("ConcreteComponent：具体操作");
  }
}

// 抽象装饰器类
class Decorator extends Component {
  constructor(component) {
    super();
    this.component = component;
  }

  operation() {
    this.component.operation();
  }
}

// 具体装饰器类
class ConcreteDecoratorA extends Decorator {
  operation() {
    super.operation();
    console.log("ConcreteDecoratorA：添加操作");
  }
}

class ConcreteDecoratorB extends Decorator {
  operation() {
    super.operation();
    console.log("ConcreteDecoratorB：添加操作");
  }
}

// 使用装饰器组合对象
const component = new ConcreteComponent();
const decoratorA = new ConcreteDecoratorA(component);
const decoratorB = new ConcreteDecoratorB(decoratorA);
decoratorB.operation();
