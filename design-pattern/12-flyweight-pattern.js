/**
 * @class Flyweight Pattern
 * @description 享元模式是一种结构型设计模式，
 * 它通过共享对象来最小化内存使用和类实例化的数量
 */

// Flyweight 工厂类
class FlyweightFactory {
  constructor() {
    this.flyweights = {};
  }

  getFlyweight(key) {
    if (!this.flyweights[key]) {
      this.flyweights[key] = new ConcreteFlyweight(key);
    }

    return this.flyweights[key];
  }
}

// 具体 Flyweight 类
class ConcreteFlyweight {
  constructor(key) {
    this.key = key;
  }

  operation() {
    console.log(`ConcreteFlyweight ${this.key}: 执行操作`);
  }
}

// 使用享元模式
const factory = new FlyweightFactory();
const flyweight1 = factory.getFlyweight("key");
const flyweight2 = factory.getFlyweight("key");
flyweight1.operation(); // Output: ConcreteFlyweight key: 执行操作
flyweight2.operation(); // Output: ConcreteFlyweight key: 执行操作
console.log(flyweight1 === flyweight2); // Output: true
