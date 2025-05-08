/**
 * 原型模式（Prototype Pattern）是一种创建型设计模式，它可以用于创建对象的成本相对较高，
 * 但对于由相同属性的对象可以通过克隆来创建。原型模式将对象的创建过程和对象的使用过程分离，
 * 它通过克隆已有对象来创建新的对象，从而避免了昂贵的对象创建过程。在 JavaScript 中，
 * 原型模式的实现很容易，因为它天然支持对象的 clone（即浅拷贝）
 */

// 创造一个原型对象
const carPrototype = {
  wheels: 4,
  color: "red",
  start() {
    console.log("Start the car");
  },
  stop() {
    console.log("Stop the car");
  },
};

// 使用Object.create()方法克隆
const car1 = Object.create(carPrototype);
console.log(car1); // Output: {}
console.log(car1.wheels); // Output: 4
car1.color = "blue";
car1.start = function () {
  console.log("Start the car 1");
};
console.log(car1.color); // Output: blue
console.log(carPrototype.color); // Output: red
car1.start(); // Output: Start the car 1
carPrototype.start(); // Output: Start the car

carPrototype.wheels = 10;
console.log(car1.wheels); // Output: 10
