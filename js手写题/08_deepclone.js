function deepClone(value, visited = new WeakMap()) {
  // 处理基本数据类型和 null
  if (value === null || typeof value !== "object") {
    return value;
  }

  // 处理循环引用
  if (visited.has(value)) {
    return visited.get(value);
  }

  // 处理 Date
  if (value instanceof Date) {
    return new Date(value);
  }

  // 处理 RegExp
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  // 处理 Set
  if (value instanceof Set) {
    const clonedSet = new Set();
    visited.set(value, clonedSet);
    value.forEach((item) => clonedSet.add(deepClone(item, visited)));
    return clonedSet;
  }

  // 处理 Map
  if (value instanceof Map) {
    const clonedMap = new Map();
    visited.set(value, clonedMap);
    value.forEach((val, key) =>
      clonedMap.set(deepClone(key, visited), deepClone(val, visited))
    );
    return clonedMap;
  }

  // 处理 Array
  if (Array.isArray(value)) {
    const clonedArray = [];
    visited.set(value, clonedArray);
    value.forEach((item, index) => {
      clonedArray[index] = deepClone(item, visited);
    });
    return clonedArray;
  }

  // 处理普通对象和继承的对象
  const clonedObj = Object.create(Object.getPrototypeOf(value));
  visited.set(value, clonedObj);
  Object.keys(value).forEach((key) => {
    clonedObj[key] = deepClone(value[key], visited);
  });
  Object.getOwnPropertySymbols(value).forEach((symbol) => {
    clonedObj[symbol] = deepClone(value[symbol], visited);
  });

  return clonedObj;
}

// 测试用例
function testDeepClone() {
  // 基本数据类型
  console.log(deepClone(42)); // 42
  console.log(deepClone("hello")); // 'hello'
  console.log(deepClone(null)); // null

  // Date
  const date = new Date();
  console.log(deepClone(date)); // Date 对象，值相同

  // RegExp
  const regex = /test/gi;
  console.log(deepClone(regex)); // RegExp 对象，值相同

  // Set
  const set = new Set([1, { a: 2 }]);
  const clonedSet = deepClone(set);
  console.log(clonedSet, clonedSet === set); // Set {1, {a: 2}}, false

  // Map
  const map = new Map([
    [1, "one"],
    [{ b: 3 }, 2],
  ]);
  const clonedMap = deepClone(map);
  console.log(clonedMap, clonedMap === map); // Map {1 => 'one', {b: 3} => 2}, false

  // Array
  const arr = [1, { c: 4 }];
  const clonedArr = deepClone(arr);
  console.log(clonedArr, clonedArr === arr); // [1, {c: 4}], false

  // 继承对象
  function Person(name) {
    this.name = name;
  }
  Person.prototype.greet = function () {
    return `Hi, ${this.name}`;
  };
  const person = new Person("Alice");
  const clonedPerson = deepClone(person);
  console.log(
    clonedPerson.name,
    clonedPerson.greet(),
    clonedPerson instanceof Person
  ); // 'Alice', 'Hi, Alice', true

  // 循环引用
  const obj = { a: 1 };
  obj.b = obj;
  const clonedObj = deepClone(obj);
  console.log(clonedObj.b === clonedObj, clonedObj.a); // true, 1
}

testDeepClone();
