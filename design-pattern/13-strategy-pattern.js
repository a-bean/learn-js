/**
 * @class Strategy
 * @description 策略模式是一种设计模式，它定义了一系列算法，并将每个算法封装起来，
 * 使它们可以相互替换。策略模式让算法独立于使用它的客户端而独立变化。这种模式属于行为型模式。
 */

class Strategy {
  constructor(name) {
    this.name = name;
  }

  execute() {}
}

class StrategyA extends Strategy {
  execute() {
    console.log("Executing strategy A");
  }
}

class StrategyB extends Strategy {
  execute() {
    console.log("Executing strategy B");
  }
}

class Context {
  constructor(strategy) {
    this.strategy = strategy;
  }

  executeStrategy() {
    this.strategy.execute();
  }
}

let context = new Context(new StrategyA("A"));
context.executeStrategy(); // Executing strategy A

context.strategy = new StrategyB("B");
context.executeStrategy(); // Executing strategy B
