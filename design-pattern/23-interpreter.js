/**
 * @class Interpreter
 * @description 解释器模式（Interpreter）是一种行为型设计模式，
 * 它能够将一种语言（通常是一种编程语言）或者表达式的文法表示为解析树，
 * 并定义一个解释器，使用该解释器来解释这个语言或者表达式。
 */

class Context {
  constructor(input) {
    this.input = input;
    this.output = 0;
  }
}

class Expression {
  interpreter(context) {
    throw new Error("You have to implement the method interpreter!");
  }
}

class ThousandExpression extends Expression {
  interpreter(context) {
    const str = context.input;
    if (str.startsWith("M")) {
      context.output += 1000;
      context.input = str.slice(1);
    }
  }
}

class HundredExpression extends Expression {
  interpreter(context) {
    const str = context.input;
    if (str.startsWith("C")) {
      context.output += 100;
      context.input = str.slice(1);
    } else if (str.startsWith("CD")) {
      context.output += 400;
      context.input = str.slice(2);
    } else if (str.startsWith("CM")) {
      context.output += 900;
      context.input = str.slice(2);
    }
  }
}

class TenExpression extends Expression {
  interpreter(context) {
    const str = context.input;
    if (str.startsWith("X")) {
      context.output += 10;
      context.input = str.slice(1);
    } else if (str.startsWith("XL")) {
      context.output += 40;
      context.input = str.slice(2);
    } else if (str.startsWith("XC")) {
      context.output += 90;
      context.input = str.slice(2);
    }
  }
}

class OneExpression extends Expression {
  interpreter(context) {
    const str = context.input;
    if (str.startsWith("I")) {
      context.output += 1;
      context.input = str.slice(1);
    } else if (str.startsWith("IV")) {
      context.output += 4;
      context.input = str.slice(2);
    } else if (str.startsWith("V")) {
      context.output += 5;
      context.input = str.slice(1);
    } else if (str.startsWith("IX")) {
      context.output += 9;
      context.input = str.slice(2);
    }
  }
}

class Interpreter {
  static parse(roman) {
    const context = new Context(roman);
    const tree = [
      new ThousandExpression(),
      new HundredExpression(),
      new TenExpression(),
      new OneExpression(),
    ];
    tree.forEach((expression) => expression.interpreter(context));
    return context.output;
  }
}

console.log(Interpreter.parse("CDXLVIII"));
