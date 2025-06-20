function Conver(number, base = 2) {
  let rem,
    res = "",
    digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    stack = [];

  while (number) {
    rem = number % base;
    stack.push(rem);

    number = Math.floor(number / base);
  }

  while (stack.length) {
    res += digits[stack.pop()];
  }

  return res;
}
// 测试
console.log(Conver(10)); // 输出: "1010"
console.log(Conver(10, 16)); // 输出: "A"
console.log(Conver(255, 16)); // 输出: "FF"
console.log(Conver(255, 8)); // 输出: "377"
console.log(Conver(255, 2)); // 输出: "11111111"
console.log(Conver(255, 36)); // 输出: "73"
console.log(Conver(1000, 36)); // 输出: "RS"
console.log(Conver(1000, 16)); // 输出: "3E8"
console.log(Conver(1000, 8)); // 输出: "1750"
