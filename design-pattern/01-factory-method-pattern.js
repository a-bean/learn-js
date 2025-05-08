/**
 *工厂方法模式定义了一个创建对象的接口，但是由子类决定要实例化的类是哪一个。
 *可以将对象的创建和使用分离，使得系统更加灵活
 */

class Animal {
  speak() {
    throw new Error("You have to implement the method speak!");
  }
}

class Dog extends Animal {
  speak() {
    return "Woof!";
  }
}

class Cat extends Animal {
  speak() {
    return "Meow!";
  }
}

// 实现工厂模式
class AnimalFactory {
  createAnimal(animalType) {
    switch (animalType) {
      case "dog":
        return new Dog();
      case "cat":
        return new Cat();
      default:
        throw new Error(`Invalid animal type: ${animalType}`);
    }
  }
}

const animalFactory = new AnimalFactory();
const dog = animalFactory.createAnimal("dog");
console.log(dog.speak()); // Woof!
const cat = animalFactory.createAnimal("cat");
console.log(cat.speak()); // Meow!
