// 建造者模式是一种对象创建设计模式，它旨在通过一步步的构建流程来创建复杂对象

// 创建 Product 类
class Sandwich {
  constructor() {
    this.ingredients = [];
  }

  addIngredient(ingredient) {
    this.ingredients.push(ingredient);
  }
  toString() {
    return this.ingredients.join(", ");
  }
}

// 创建一个建造者类
class SandwichBuilder {
  constructor() {
    this.sandwich = new Sandwich();
  }

  reset() {
    this.sandwich = new Sandwich();
  }

  build() {
    return this.sandwich;
  }

  putMeat(meat) {
    this.sandwich.addIngredient(meat);
  }

  putCheese(cheese) {
    this.sandwich.addIngredient(cheese);
  }

  putVegetables(vegetables) {
    this.sandwich.addIngredient(vegetables);
  }

  get result() {
    return this.sandwich;
  }
}

// 创建用户（director）使用的 builder
class SandwichMaker {
  constructor() {
    this.builder = new SandwichBuilder();
  }

  createCheeseSteakSandwich() {
    this.builder.reset();
    this.builder.putMeat("ribeye steak");
    this.builder.putCheese("provolone");
    this.builder.putVegetables(["onion"]);
    return this.builder.result;
  }
}

const sandwichMaker = new SandwichMaker();
const cheeseSteakSandwich = sandwichMaker.createCheeseSteakSandwich();
console.log(cheeseSteakSandwich.toString()); // ribeye steak, provolone, onion
