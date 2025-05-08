/**
 * @class Command
 * @description 命令模式（Command）是一种行为型设计模式，它
 * 将请求或操作封装到一个对象中，从而允许你将请求或操作的发起者
 * 与具体执行者解耦。命令模式可以将请求或操作参数化，甚至在运行时动态地组合命令
 */

class Command {
  constructor(receiver) {
    this.receiver = receiver;
  }

  execute() {
    throw new Error("You have to implement the method execute!");
  }
}

class ConcreteCommandA extends Command {
  execute() {
    this.receiver.actionA();
  }
}

class ConcreteCommandB extends Command {
  execute() {
    this.receiver.actionB();
  }
}

class Receiver {
  actionA() {
    console.log("Receiver Action A.");
  }

  actionB() {
    console.log("Receiver Action B.");
  }
}

class Invoker {
  constructor() {
    this.commands = new Map();
  }

  setCommand(key, command) {
    this.commands.set(key, command);
  }

  executeCommand(key) {
    const command = this.commands.get(key);
    if (!command) {
      console.log(`Command ${key} is not found.`);
      return;
    }
    command.execute();
  }
}

const receiver = new Receiver();
const invoker = new Invoker();

invoker.setCommand("A", new ConcreteCommandA(receiver));
invoker.setCommand("B", new ConcreteCommandB(receiver));

invoker.executeCommand("A"); // Receiver Action A.
invoker.executeCommand("B"); // Receiver Action B.
