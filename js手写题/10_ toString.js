function numberToString(num) {
  return num.toLocaleString();
}

function numberToString1(num) {
  const str = num.toString();
  let result = "";
  for (let i = str.length - 1, count = 0; i >= 0; i--) {
    result = str[i] + result;
    count++;
    if (count % 3 === 0 && i !== 0) {
      result = "," + result;
    }
  }
  return result;
}

// 测试
console.log(numberToString(1234567890)); // 输出: 1,234,567,890

// 测试
console.log(numberToString1(1234567890)); // 输出: 1,234,567,890
