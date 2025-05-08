/**
 * 适配器模式（Adapter Pattern）是一种结构型设计模式，它允许将 不兼容 的对象包装在适配器中，从而使它们能够在一起工作
 */
// 目标接口
class Target {
  request() {
    console.log("Target: 请求已被调用");
  }
}

// 需要适配的类
class Adaptee {
  specificRequest() {
    console.log("Adaptee 方法已被访问");
  }
}

// 适配器类，将 Adaptee 转换为 Target
class Adapter extends Target {
  constructor(adaptee) {
    super();
    this.adaptee = adaptee;
  }

  request() {
    this.adaptee.specificRequest();
  }
}

// 使用适配器将客户端与 Adaptee 解耦
const client = new Adapter(new Adaptee());
client.request(); // Output: Adaptee 方法已被访问
