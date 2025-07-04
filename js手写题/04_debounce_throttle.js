// 防抖函数
// 原理：在事件触发后，延迟一段时间执行回调。如果在这段时间内事件再次触发，则重新计时。只有当指定时间内没有再次触发，回调才会执行。

function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    // 清除上一次的定时器
    clearTimeout(timer);
    // 设置新的定时器
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用示例
function handleInput(e) {
  console.log("输入值:", e.target.value);
}

const debouncedInput = debounce(handleInput, 300);
document.querySelector("input").addEventListener("input", debouncedInput);

// 节流函数
// 原理：在事件触发时，限制回调函数的执行频率，确保在指定时间间隔内最多执行一次。
function throttle(fn, interval) {
  let lastTime = 0;

  return function (...args) {
    const now = Date.now();
    // 如果距离上次执行时间超过了间隔时间，则执行
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用示例
function handleScroll() {
  console.log("滚动位置:", window.scrollY);
}

const throttledScroll = throttle(handleScroll, 200);
window.addEventListener("scroll", throttledScroll);

/**
 * 防抖函数：触发事件后，在指定时间内只执行最后一次操作
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {Object} options - 配置项
 * @param {boolean} options.immediate - 是否立即执行
 * @param {number} options.maxWait - 最大等待时间
 * @returns {Function} 防抖后的函数，包含 cancel 和 flush 方法
 */
function debounce(func, wait, options = {}) {
  let timeoutId;
  let lastArgs;
  let lastThis;
  let lastCallTime;
  const { immediate = false, maxWait = Infinity } = options;

  function debounced(...args) {
    const context = this;
    lastArgs = args;
    lastThis = context;
    const now = Date.now();

    if (!lastCallTime) lastCallTime = now;

    const invokeFunc = () => {
      lastCallTime = now;
      timeoutId = null;
      func.apply(context, args);
    };

    const shouldInvoke = immediate && !timeoutId;
    const maxWaitExceeded =
      maxWait !== Infinity && now - lastCallTime >= maxWait;

    if (timeoutId) clearTimeout(timeoutId);

    if (shouldInvoke || maxWaitExceeded) {
      invokeFunc();
    } else {
      timeoutId = setTimeout(() => {
        invokeFunc();
      }, wait);
    }

    lastCallTime = shouldInvoke ? now : lastCallTime;
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
      lastThis = null;
      lastCallTime = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs && lastThis) {
      func.apply(lastThis, lastArgs);
    }
    debounced.cancel();
  };

  return debounced;
}

/**
 * 节流函数：指定时间间隔内只执行一次操作
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 时间间隔（毫秒）
 * @param {Object} options - 配置项
 * @param {boolean} options.leading - 是否立即执行
 * @param {boolean} options.trailing - 是否在结束时执行最后一次
 * @returns {Function} 节流后的函数，包含 cancel 方法
 */
function throttle(func, wait, options = {}) {
  let timeoutId;
  let lastArgs;
  let lastThis;
  let lastCallTime;
  const { leading = true, trailing = true } = options;

  function throttled(...args) {
    const context = this;
    lastArgs = args;
    lastThis = context;
    const now = Date.now();

    if (!lastCallTime && !leading) lastCallTime = now;

    const remaining = wait - (now - (lastCallTime || 0));

    const invokeFunc = () => {
      lastCallTime = now;
      func.apply(context, args);
      if (!timeoutId) lastArgs = lastThis = null;
    };

    if (remaining <= 0) {
      if (!timeoutId) {
        if (leading) {
          invokeFunc();
        } else {
          lastCallTime = now;
        }
      }
      if (trailing) {
        if (!timeoutId) {
          timeoutId = setTimeout(() => {
            timeoutId = null;
            if (lastArgs) invokeFunc();
          }, wait);
        }
      }
    } else if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        invokeFunc();
      }, remaining);
    }
  }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
      lastThis = null;
      lastCallTime = null;
    }
  };

  return throttled;
}

// 防抖示例
const log = (msg) => console.log(msg, Date.now());
const debouncedLog = debounce(log, 1000, { immediate: true, maxWait: 3000 });

debouncedLog("Test 1"); // 立即执行
debouncedLog("Test 2"); // 被忽略
setTimeout(() => debouncedLog("Test 3"), 500); // 被忽略
setTimeout(() => debouncedLog("Test 4"), 1500); // 1000ms 后执行
setTimeout(() => debouncedLog.flush(), 2000); // 立即执行最后一次
setTimeout(() => debouncedLog.cancel(), 3000); // 取消所有待执行

// 节流示例
const throttledLog = throttle(log, 1000, { leading: true, trailing: true });

throttledLog("Test A"); // 立即执行
throttledLog("Test B"); // 被忽略
setTimeout(() => throttledLog("Test C"), 500); // 被忽略
setTimeout(() => throttledLog("Test D"), 1000); // 1000ms 后执行
setTimeout(() => throttledLog.cancel(), 2000); // 取消待执行
