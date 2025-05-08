/**
 * @class Iterator
 * @description 迭代器模式是一种行为设计模式，它提供了一种方式来顺序
 * 访问集合对象中的元素。迭代器模式将遍历集合的责任交给迭代器，而不是集
 * 合自己。这样就可以将集合的实现和遍历算法的实现分离开来，从而提供更好的灵活性。
 */

class Iterator {
  constructor(items) {
    this.items = items;
    this.cursor = 0;
  }

  has_next() {
    return this.cursor < this.items.length;
  }

  next() {
    const item = this.items[this.cursor];
    this.cursor += 1;
    return item;
  }
}

class Collection {
  constructor() {
    this.items = [];
  }

  add_item(item) {
    this.items.push(item);
  }

  iterator() {
    return new Iterator(this.items);
  }
}

const collection = new Collection();
collection.add_item("item 1");
collection.add_item("item 2");
collection.add_item("item 3");

const iterator = collection.iterator();
while (iterator.has_next()) {
  console.log(iterator.next());
}
