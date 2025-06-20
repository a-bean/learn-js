function compareVersions(versions) {
  return versions.sort((a, b) => {
    const tempA = a.split(".");
    console.log(tempA, "tempA");

    const tempB = b.split(".");
    const maxLen = Math.max(tempA.length, tempB.length);
    for (let i = 0; i < maxLen; i++) {
      const valueA = +tempA[i] || 0;
      const valueB = +tempB[i] || 0;
      if (valueA === valueB) {
        continue;
      }
      return valueA - valueB;
    }
    return 0;
  });
}

// 测试用例
function testCompareVersions() {
  console.log(compareVersions(["1.0.0", "1.0.1", "1.0.10", "1.0.2"])); // ["1.0.0", "1.0.1", "1.0.2", "1.0.10"]
  console.log(compareVersions(["2.1", "2.0.1", "2.0.10", "2.0"])); // ["2.0", "2.0.1", "2.0.10", "2.1"]
  console.log(compareVersions(["1.0", "1.0.0", "1.0.0.0"])); // ["1.0", "1.0.0", "1.0.0.0"]
  console.log(compareVersions(["1.0.0-alpha", "1.0.0-beta", "1.0.0"])); // ["1.0.0-alpha", "1.0.0-beta", "1.0.0"]
  console.log(compareVersions(["1.0.0", "1.0.0", "1.0.0"])); // ["1.0.0", "1.0.0", "1.0.0"]
  console.log(compareVersions(["1.0.0", "1.0.0", "1.0.0"])); // ["1.0.0", "1.0.0", "1.0.0"]
}

testCompareVersions();
