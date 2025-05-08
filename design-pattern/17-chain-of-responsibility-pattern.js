/**
 * @class ChainOfResponsibilityParrent
 * @description 责任链模式（Chain of Responsibility）是一种行为型设计模式。
 * 它可以让多个对象都有机会处理请求，从而避免将请求的发送者和接收者耦合在一起。
 * 将这些对象连成一个链，并沿着这条链传递请求，直到有一个对象处理它为止。
 */

class Handler {
  constructor() {
    this.nextHandler = null;
  }

  setNextHandler(handler) {
    this.nextHandler = handler;
  }

  handleRequest(request) {
    if (this.nextHandler !== null) {
      return this.nextHandler.handleRequest(request);
    }
    return null;
  }
}

class ConcreteHandlerA extends Handler {
  handleRequest(request) {
    if (request === "A") {
      return `Handle Request ${request}`;
    }
    return super.handleRequest(request);
  }
}

class ConcreteHandlerB extends Handler {
  handleRequest(request) {
    if (request === "B") {
      return `Handle Request ${request}`;
    }
    return super.handleRequest(request);
  }
}

class ConcreteHandlerC extends Handler {
  handleRequest(request) {
    if (request === "C") {
      return `Handle Request ${request}`;
    }
    return super.handleRequest(request);
  }
}

const handlerA = new ConcreteHandlerA();
const handlerB = new ConcreteHandlerB();
const handlerC = new ConcreteHandlerC();

handlerA.setNextHandler(handlerB);
handlerB.setNextHandler(handlerC);

console.log(handlerA.handleRequest("A")); // Handle Request A
console.log(handlerA.handleRequest("B")); // Handle Request B
console.log(handlerA.handleRequest("C")); // Handle Request C
console.log(handlerA.handleRequest("D")); // null
