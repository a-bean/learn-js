/**
 * @class Mediator
 * @description 中介者模式（Mediator）是一种行为型设计模式，
 * 它允许你减少组件之间的直接依赖关系，将它们通过一个中介者对象
 * 进行交互。通过避免在组件之间显式引用彼此，中介者可以让你更容易地复用组件。
 */

class Mediator {
  constructor() {
    this.components = new Set();
  }

  register(component) {
    component.mediator = this;
    this.components.add(component);
  }

  notify(sender, event) {
    this.components.forEach((component) => {
      if (component !== sender) {
        component.receive(sender, event);
      }
    });
  }
}

class Component {
  constructor(name) {
    this.name = name;
    this.mediator = null;
  }

  send(event) {
    console.log(`Send event ${event} from ${this.name}`);
    this.mediator.notify(this, event);
  }

  receive(sender, event) {
    console.log(`Receive event ${event} from ${sender.name} by ${this.name}`);
  }
}

const mediator = new Mediator();
const componentA = new Component("Component A");
const componentB = new Component("Component B");
const componentC = new Component("Component C");
mediator.register(componentA);
mediator.register(componentB);
mediator.register(componentC);

componentA.send("Hello"); //Send event Hello from Component A, Receive event Hello from Component A by Component B, Receive event Hello from Component A by Component C
