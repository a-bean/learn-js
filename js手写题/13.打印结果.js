// 1.
const obj = {
  a: 0,
};

obj["1"] = 0;

obj[++obj.a] = obj.a++;
const values = Object.values(obj);

obj[values[1]] = obj.a;
console.log(obj); // { '1': 1, '2': 2, a: 2 }

// 2.
var a = 1;
function fn() {
  // console.log(a);
  let a = 2;
}

// fn(); // 报错：Uncaught ReferenceError: Cannot access 'a' before initialization

// // 二次封装组件
// // 深浅拷贝
// // 幽灵依赖
// // 怎么创建一个没有prototype为空的对象
// // 如何获取元素的width
// // 作用域

const p = new Promise((resolve, reject) => {
  console.log(0);
  reject();
  console.log(1);
  resolve();
  console.log(2);
});

p.then((res) => {
  console.log(3);
})
  .then((res) => {
    console.log(4);
  })
  .catch((res) => {
    console.log(5);
  })
  .then((res) => {
    console.log(6);
  })
  .catch((res) => {
    console.log(7);
  })
  .then((res) => {
    console.log(8);
  });

// function test({ success, error } = {}) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       const t = Math.random();
//       const right = t > 0.5;
//       if (right) {
//         success && success(t);
//         resolve(t);
//       } else {
//         error && error();
//         reject();
//       }
//     }, 1000);
//   });
// }

// test({
//   success: (t) => {
//     console.log("ssss", t);
//   },
//   error: () => {},
// });

// test()
//   .then((t) => {
//     console.log("success", t);
//   })
//   .catch(() => {
//     console.log("error");
//   });

function lightLine(str, word) {
  let result = "";
  let i = 0;

  while (i < str.length) {
    if (
      i <= str.length - word.length &&
      str.substr(i, word.length).toLowerCase() === word.toLowerCase()
    ) {
      result += "<em>" + str.substr(i, word.length) + "</em>";
      i += word.length;
    } else {
      result += str[i];
      i++;
    }
  }

  return result;
}

// 数组拍平
function flattenArray(arr, depth = Infinity) {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i]) && depth > 0) {
      res.push(...flattenArray(arr[i], depth - 1));
    } else {
      res.push(arr[i]);
    }
  }
  return res;
}

function redLight() {
  console.log("red");
}
function greenLight() {
  console.log("green");
}
function yellowLight() {
  console.log("yellow");
}
const task = (light, timer) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      light();
      resolve();
    }, timer);
  });
};

const step = async () => {
  await task(redLight, 3000);
  await task(greenLight, 2000);
  await task(yellowLight, 1000);
  step();
};

step();

// 使用Promise实现每隔1秒输出1,2,3
for (let i = 1; i <= 3; i++) {
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(i);
    }, i * 1000);
  }).then((value) => {
    console.log(value);
  });
}

for (let i = 1; i <= 3; i++) {
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(i);
    }, i * 1000);
  }).then((value) => {
    console.log(value);
  });
}

// 实现mergePromise函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组data中。
const time = (timer) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timer);
  });
};

const ajax1 = () =>
  time(2000).then(() => {
    console.log(1);
    return 1;
  });

const ajax2 = () =>
  time(1000).then(() => {
    console.log(2);
    return 2;
  });

const ajax3 = () =>
  time(1000).then(() => {
    console.log(3);
    return 3;
  });

function mergePromise(ajaxArray) {
  let data = [];
  let promise = Promise.resolve(); // 初始状态为已解决的 Promise
  ajaxArray.forEach((ajax) => {
    promise = promise.then(ajax).then((res) => {
      data.push(res);
      return data; // 返回当前的 data 数组
    });
  });
  return promise;
}

mergePromise([ajax1, ajax2, ajax3]).then((data) => {
  console.log("done");
  console.log(data); // data 为 [1, 2, 3]
});

// 8.6 限制异步操作的并发个数并尽可能快的完成全部
// 有8个图片资源的url，已经存储在数组urls中。
// urls类似于['https://image1.png', 'https://image2.png', ....]
// 而且已经有一个函数function loadImg，输入一个url链接，返回一个Promise，该Promise在图片下载完成的时候resolve，下载失败则reject。
// 但有一个要求，任何时刻同时下载的链接数量不可以超过3个。
// 请写一段代码实现这个需求，要求尽可能快速地将所有图片下载完成。
var urls = [
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting1.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting2.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting3.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting4.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting5.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn6.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn7.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn8.png",
];
function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      console.log("一张图片加载完成");
      resolve(img);
    };
    img.onerror = function () {
      reject(new Error("Could not load image at" + url));
    };
    img.src = url;
  });
}

function limitLoad(urls, handler, limit) {
  const data = []; // 存储所有的加载结果
  let p = Promise.resolve();

  const handleUrls = (urls) => {
    // 这个函数是为了生成3个url为一组的二维数组
    const doubleDim = [];
    const len = Math.ceil(urls.length / limit); // Math.ceil(8 / 3) = 3
    console.log(len); // 3, 表示二维数组的长度为3
    for (let i = 0; i < len; i++) {
      doubleDim.push(urls.slice(i * limit, (i + 1) * limit));
    }
    return doubleDim;
  };

  const ajaxImage = (urlCollect) => {
    // 将一组字符串url 转换为一个加载图片的数组
    console.log(urlCollect);
    return urlCollect.map((url) => handler(url));
  };

  const doubleDim = handleUrls(urls); // 得到3个url为一组的二维数组
  doubleDim.forEach((urlCollect) => {
    p = p
      .then(() => Promise.all(ajaxImage(urlCollect)))
      .then((res) => {
        data.push(...res); // 将每次的结果展开，并存储到data中 (res为：[img, img, img])
        return data;
      });
  });
  return p;
}

limitLoad(urls, loadImg, 3).then((res) => {
  console.log(res); // 最终得到的是长度为8的img数组: [img, img, img, ...]
  res.forEach((img) => {
    document.body.appendChild(img);
  });
});

function limitLoad1(urls, handler, limit) {
  let sequence = [].concat(urls); // 复制urls
  let promises = sequence.splice(0, limit).map((url, index) => {
    return handler(url).then(() => {
      return index;
    });
  });

  return sequence
    .reduce((pCollect, url) => {
      return pCollect
        .then(() => {
          return Promise.race(promises);
        })
        .then((fastestIndex) => {
          promises[fastestIndex] = handler(url).then(() => {
            return fastestIndex;
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }, Promise.resolve())
    .then(() => {
      return Promise.all(promises);
    });
}

limitLoad1(urls, loadImg, 3)
  .then((res) => {
    console.log("图片全部加载完毕");
    console.log(res);
  })
  .catch((err) => {
    console.error(err);
  });

// 如何取消一个promise?
function wrap(p) {
  let obj = {};
  let p1 = new Promise((resolve, reject) => {
    obj.resolve = resolve;
    obj.reject = reject;
  });
  obj.promise = Promise.race([p1, p]);
  return obj;
}

let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(123);
  }, 1000);
});
let obj = wrap(promise);
obj.promise.then((res) => {
  console.log(res);
});
// obj.resolve("请求被拦截了");
