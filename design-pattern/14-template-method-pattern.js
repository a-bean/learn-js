/**
 * @class TemplateMethodPattern
 * @description 模板方法模式是一种行为设计模式。它定义了一个操作中的算法骨架，
 * 将某些步骤延迟到子类中实现。模板方法使得子类可以不改变算法的结构即可重新定义该算法的某些特定步骤。
 */

class Game {
  setup() {}

  start() {
    this.setup();
    this.play();
    this.finish();
  }

  play() {}

  finish() {}
}

class Chess extends Game {
  setup() {
    console.log("Setting up chess game");
  }

  play() {
    console.log("Playing chess");
  }

  finish() {
    console.log("Finishing chess game");
  }
}

class TicTacToe extends Game {
  setup() {
    console.log("Setting up TicTacToe game");
  }

  play() {
    console.log("Playing TicTacToe");
  }

  finish() {
    console.log("Finishing TicTacToe game");
  }
}

let game = new Chess();
game.start();

game = new TicTacToe();
game.start();
