
/**
 * 单例模式的目的是确保一个类只有一个实例，并为该实例提供全局访问点。
 * */

class Logger {
  constructor() {
    if (!Logger.instance) {
      this.logs = [];
      Logger.instance = this;
    }
    return Logger.instance;
  }

  log(message) {
    this.logs.push(message);
    console.log("Logger:", message);
  }

  printLogCount(){
    console.log(this.logs.length);
  }
}

const logger = new Logger();
Object.freeze(logger);

logger.log("First message");
logger.printLogCount(); // 1

const logger2 = new Logger();
logger2.log("Second message");
logger2.printLogCount(); // 2
