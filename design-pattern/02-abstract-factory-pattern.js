/**
 * 抽象工厂模式提供了一种封装一组具有相同主题的单个工厂的方式。它有一个接口，
 * 用于创建相关或依赖对象的家族，而不需要指定实际实现的类
 */

// 创建一组主题对象类型的抽象类
class AnimalFood {
  provide() {
    throw new Error("This method must be implemented.");
  }
}

class AnimalToy {
  provide() {
    throw new Error("This method must be implemented.");
  }
}

// 创建一组具体代表家族的对象
class HighQualityDogFood extends AnimalFood {
  provide() {
    return "High quality dog food";
  }
}

class HighQualityDogToy extends AnimalToy {
  provide() {
    return "High quality dog toy";
  }
}

class CheapCatFood extends AnimalFood {
  provide() {
    return "Cheap cat food";
  }
}

class CheapCatToy extends AnimalToy {
  provide() {
    return "Cheap cat toy";
  }
}

// 创建一个抽象工厂
class AnimalProductsAbstractFactory {
  createFood() {
    throw new Error("This method must be implemented.");
  }

  createToy() {
    throw new Error("This method must be implemented.");
  }
}

// 创建具体工厂类
class HighQualityAnimalProductsFactory extends AnimalProductsAbstractFactory {
  createFood() {
    return new HighQualityDogFood();
  }

  createToy() {
    return new HighQualityDogToy();
  }
}

class CheapAnimalProductsFactory extends AnimalProductsAbstractFactory {
  createFood() {
    return new CheapCatFood();
  }

  createToy() {
    return new CheapCatToy();
  }
}

// 使用具体工厂类来创建相关的对象
const highQualityAnimalProductsFactory = new HighQualityAnimalProductsFactory();
console.log(highQualityAnimalProductsFactory.createFood().provide()); // Output: High quality dog food
console.log(highQualityAnimalProductsFactory.createToy().provide()); // Output: High quality dog toy

const cheapAnimalProductsFactory = new CheapAnimalProductsFactory();
console.log(cheapAnimalProductsFactory.createFood().provide()); // Output: Cheap cat food
console.log(cheapAnimalProductsFactory.createToy().provide()); // Output: Cheap cat toy
