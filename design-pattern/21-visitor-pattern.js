/**
 * @class Visitor
 * @description 访问者模式（Visitor）是一种行为型设计模式，
 * 它允许你将算法封装在一个或多个访问者类中，从而让你在不改变
 * 各个元素类接口的前提下定义作用于这些元素的新操作。
 */

class Element {
  accept(visitor) {
    throw new Error("You have to implement the method accept!");
  }
}

class ConcreteElementA extends Element {
  accept(visitor) {
    visitor.visitConcreteElementA(this);
  }

  operationA() {
    console.log("Operation A of Concrete Element A.");
  }
}

class ConcreteElementB extends Element {
  accept(visitor) {
    visitor.visitConcreteElementB(this);
  }

  operationB() {
    console.log("Operation B of Concrete Element B.");
  }
}

class Visitor {
  visitConcreteElementA(element) {
    console.log(`Visit Concrete Element A with ${element.operationA()}`);
  }

  visitConcreteElementB(element) {
    console.log(`Visit Concrete Element B with ${element.operationB()}`);
  }
}

const elementA = new ConcreteElementA();
const elementB = new ConcreteElementB();
const visitor = new Visitor();

elementA.accept(visitor);
elementB.accept(visitor);
