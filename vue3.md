### 为什么要使用虚拟dom

1. 抽象：可以把渲染过程抽象化，从而使得组件的抽象能力也得到提升。虚拟 DOM 提供声明式编程模型，开发者只需关注数据状态，框架会自动处理 DOM 更新。通过 Diff 算法，比较新旧虚拟 DOM 的差异，只对需要更新的部分进行真实 DOM 操作，减少不必要的重绘和回流，从而提升渲染性能

2. 跨平台，因为 patch vnode 的过程不同平台可以有自己的实现，基于 vnode 再做服务端渲染、Weex 平台、小程序平台的渲染都变得容易了很多。

### Vue3/2对数组都做了特殊处理吗

1. Vue 2 对数组的特殊处理

1.1 响应式原理

Vue 2 使用 Object.defineProperty 实现响应式，通过为对象的属性定义 getter 和 setter 来拦截数据变化。然而，数组的某些操作（如直接修改索引或长度）无法被 Object.defineProperty 捕获，因此 Vue 2 对数组进行了特殊处理。

1.2 特殊处理方式

Vue 2 通过重写数组原型方法来实现数组的响应式。具体来说，Vue 2 拦截了以下 7 个会改变数组内容（变异方法）的原型方法：

- push()
- pop()
- shift()
- unshift()
- splice()
- sort()
- reverse()

实现原理：

- Vue 2 创建了一个新的数组原型（基于 Array.prototype），并重写了上述方法。
- 重写的方法在执行原始逻辑的同时，触发依赖通知（notify），以更新视图。
- 响应式数组的 __proto__ 被设置为这个新的原型对象。

代码示例（内部简化逻辑）：

javascript

```javascript
// Vue 2 内部实现（伪代码）
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  arrayMethods[method] = function (...args) {
    const result = arrayProto[method].apply(this, args); // 执行原方法
    const ob = this.__ob__; // 获取 Observer 实例
    ob.dep.notify(); // 通知依赖更新
    // 处理新增元素（如 push、unshift、splice 添加的元素）
    if (['push', 'unshift', 'splice'].includes(method)) {
      const inserted = args.slice(method === 'splice' ? 2 : 0);
      ob.observeArray(inserted); // 使新增元素响应式
    }
    return result;
  };
});
```

1.3 限制与问题

Vue 2 的数组响应式有以下限制：

1. 直接通过索引修改数组：

   - 例如，arr[0] = value 或 arr.length = 0 不会触发响应式更新，因为 Object.defineProperty 无法拦截数组索引和 length 属性变化。
   - 解决方法：
     - 使用变异方法：this.$set(arr, index, value) 或 arr.splice(index, 1, value)。
     - 替换整个数组：arr = [...arr, newItem]。

   javascript

   ```javascript
   // 不触发更新
   this.arr[0] = 'new value';
   // 触发更新
   this.$set(this.arr, 0, 'new value');
   this.arr.splice(0, 1, 'new value');
   ```

2. 新增属性：

   - 动态添加的数组元素（通过非变异方法）不会自动变为响应式。
   - 解决方法：使用 Vue.set 或变异方法添加元素。

   ```javascript
   // 不触发更新
   this.arr.push({}); // 新对象需要手动设置响应式
   this.$set(this.arr, this.arr.length, {});
   ```

1.4 代码示例

```javascript
// Vue 2 组件
new Vue({
  data() {
    return {
      arr: [1, 2, 3],
    };
  },
  methods: {
    updateArray() {
      this.arr.push(4); // 触发更新
      this.arr[0] = 10; // 不触发更新
      this.$set(this.arr, 0, 10); // 触发更新
      this.arr.splice(0, 1, 10); // 触发更新
    },
  },
  template: `
    <div>
      <button @click="updateArray">Update</button>
      <p>{{ arr }}</p>
    </div>
  `,
});
```

2. Vue 3 对数组的特殊处理

2.1 响应式原理

Vue 3 使用 Proxy 替代 Object.defineProperty，极大地改进了响应式系统。Proxy 可以直接拦截对象的所有操作，包括数组的索引访问、长度修改和方法调用，因此 Vue 3 对数组的处理更加自然，减少了特殊处理的需求。

2.2 特殊处理方式

- 基于 Proxy 的响应式：
  - Vue 3 的 reactive 或 ref 创建的响应式数组通过 Proxy 拦截所有操作（包括索引修改、长度变化和方法调用）。
  - 不需要像 Vue 2 那样重写数组原型方法，Proxy 天然支持以下操作：
    - 索引赋值：arr[0] = value
    - 修改长度：arr.length = 0
    - 调用变异方法：push、splice 等
    - 新增元素：自动变为响应式（如果元素是对象）。
- 内部实现（伪代码）：

```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      // 依赖收集
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key);
      }
      return result;
    },
  });
}
```

2.3 优势与改进

- 索引修改：arr[0] = value 直接触发响应式更新，无需 set 或 splice。
- 长度修改：arr.length = 0 自动触发更新。
- 新增元素：通过 push、unshift 等添加的对象自动变为响应式（通过 reactive 包装）。
- 性能：Proxy 更灵活，但可能略增加内存开销。

2.4 限制与注意事项

虽然 Vue 3 的数组响应式更强大，仍有一些需要注意的地方：

1. 非响应式值：

   - 如果直接替换整个数组，需确保新数组是响应式的：

   ```javascript
   // 不推荐
   this.arr = [1, 2, 3]; // 失去响应式
   // 推荐
   this.arr.splice(0, this.arr.length, 1, 2, 3); // 保持响应式
   ```

2. 深层嵌套：

   - reactive 自动处理嵌套对象/数组的响应式，但 ref 需要手动解包（.value）。

3. 性能优化：

   - 避免频繁替换大数组，优先使用变异方法（如 splice）以减少 Proxy 开销。

2.5 代码示例

```javascript
// Vue 3 组件
import { defineComponent, reactive } from 'vue';

export default defineComponent({
  setup() {
    const state = reactive({
      arr: [1, 2, 3],
    });

    function updateArray() {
      state.arr[0] = 10; // 触发更新
      state.arr.push(4); // 触发更新
      state.arr.length = 2; // 触发更新
      state.arr = [5, 6]; // 失去响应式，需小心
    }

    return { state, updateArray };
  },
  template: `
    <div>
      <button @click="updateArray">Update</button>
      <p>{{ state.arr }}</p>
    </div>
  `,
});
```

Vue 2 与 Vue 3 数组处理的对比

| 特性           | Vue 2 (Object.defineProperty)   | Vue 3 (Proxy)                       |
| -------------- | ------------------------------- | ----------------------------------- |
| 索引修改       | 不触发响应式，需 $set 或 splice | 触发响应式，直接支持 arr[0] = value |
| 长度修改       | 不触发响应式，需变异方法        | 触发响应式，支持 arr.length = 0     |
| 变异方法       | 重写 7 个方法（push、pop 等）   | 无需重写，Proxy 拦截所有方法        |
| 新增元素响应式 | 需手动 $set 或 observeArray     | 自动响应式（reactive 包装）         |
| 性能           | 较低开销，但功能有限            | 更高灵活性，略高内存开销            |
| 限制           | 无法监听索引和长度变化          | 需确保数组整体保持响应式            |

4. 常见问题与解决方案

4.1 Vue 2 问题

- 问题：数组索引修改不更新视图。

  - 解决：

    ```javascript
    this.$set(this.arr, 0, 'new value');
    // 或
    this.arr.splice(0, 1, 'new value');
    ```

- 问题：动态添加对象元素不响应式。

  - 解决：

    ```javascript
    const newObj = { id: 1 };
    this.$set(this.arr, this.arr.length, newObj);
    ```

4.2 Vue 3 问题

- 问题：替换整个数组失去响应式。

  - 解决：

    ```javascript
    // 不推荐
    state.arr = [1, 2, 3];
    // 推荐
    state.arr.splice(0, state.arr.length, 1, 2, 3);
    // 或使用 reactive 重新包装
    state.arr = reactive([1, 2, 3]);
    ```

- 问题：ref 数组需要 .value。

  - 解决：

    ```javascript
    import { ref } from 'vue';
    const arr = ref([1, 2, 3]);
    arr.value[0] = 10; // 触发更新
    ```

4.3 性能优化

- Vue 2：尽量使用变异方法，避免频繁 $set。
- Vue 3：避免替换整个数组，优先使用 splice 或局部修改。
- 通用：对于大型数组，使用 shallowReactive（Vue 3）或 Object.freeze（Vue 2）减少响应式开销。

5. 使用场景

- Vue 2：
  - 小型项目，需兼容旧浏览器（IE11）。
  - 简单数组操作，依赖变异方法或 $set。
- Vue 3：
  - 现代项目，需灵活的响应式（如动态索引修改）。
  - 大型 SPA，结合 Composition API 管理复杂状态。

示例场景：

- 列表渲染：动态更新列表数据（如 todo 列表）。

  ```javascript
  // Vue 3
  const todos = reactive([]);
  function addTodo(text) {
    todos.push({ text, done: false }); // 自动响应式
  }
  ```

- 数据过滤：根据用户输入过滤数组。

  ```javascript
  // Vue 2
  this.filtered = this.arr.filter(item => item.includes(this.search));
  // Vue 3
  const filtered = computed(() => state.arr.filter(item => item.includes(search.value)));
  ```

6. 总结

- Vue 2：
  - 通过重写 7 个数组变异方法实现响应式。
  - 索引修改和长度变化需 $set 或 splice 触发更新。
  - 限制较多，需手动处理新增元素。
- Vue 3：
  - 基于 Proxy，支持索引修改、长度变化和方法调用。
  - 新增元素自动响应式，API 更简洁。
  - 注意避免替换整个数组导致响应式丢失。
- 选择依据：
  - Vue 2 适合旧项目或简单场景。
  - Vue 3 更适合现代开发，提供更自然的数组操作。

### Vue3相比Vue2除了响应式还有没有别的区别

1. Composition API（组合式 API）

Vue 3 引入了 Composition API，作为 Options API 的补充，提供更灵活的代码组织方式。

1.1 区别

- Vue 2（Options API）：
  - 数据和逻辑按选项（如 data、methods、computed）组织，适合小型组件。
  - 问题：大型组件逻辑分散，难以维护；代码复用依赖 mixins，易导致冲突。
- Vue 3（Composition API）：
  - 逻辑按功能组织在一个 setup 函数中，增强代码复用性和可读性。
  - 支持更好的类型推导，适合复杂组件和 TypeScript。
  - 保留 Options API，向后兼容。

2. 性能优化

Vue 3 在性能上显著提升，特别是在编译器和运行时优化方面。

2.1 区别

- Vue 2：
  - 模板编译生成完整的虚拟 DOM，更新时逐一比较。
  - 响应式系统基于 Object.defineProperty，每次更新需遍历所有属性。
- Vue 3：
  - 静态提升（Static Hoisting）：编译器将静态内容（如纯文本或静态节点）提升，减少运行时 diff 开销。
  - Patch Flags：编译器标记动态节点（如绑定值的元素），只 diff 动态部分。
  - Tree-Shaking：未使用的 API（如 v-model）不会打包，减少 bundle 大小。
  - Block Tree：优化虚拟 DOM 结构，减少嵌套层级，提升 diff 效率。

2.2 示例

Vue 2 模板：

```html
<div>
  <p>Hello</p>
  <p>{{ message }}</p>
</div>
```

- 生成完整虚拟 DOM，每次更新都比较所有节点。

Vue 3 模板：

- 编译器标记 <p>Hello</p> 为静态，<p>{{ message }}</p> 为动态，只 diff 动态节点。

- 输出更精简的渲染函数：

  ```javascript
  createElement('div', [
    createStaticVNode('<p>Hello</p>'), // 静态提升
    createElement('p', { _patchFlag: 1 }, message), // 动态标记
  ]);
  ```

3. TypeScript 支持

Vue 3 对 TypeScript 的支持大幅增强，解决了 Vue 2 的类型推导问题。

- 核心库用 TypeScript 重写，提供开箱即用的类型支持。
- Composition API 天然支持类型推导（如 ref、reactive）。
- 新增 defineComponent 增强类型推导。
- Volar（VSCode 插件）替换 Vetur，提供更好的 TS 体验。

4. 新组件与指令

Vue 3 引入了一些新组件和指令，增强了功能。

4.1 新组件

- Fragment：

  - Vue 2：组件模板必须有一个根节点。
  - Vue 3：支持多根节点（Fragment），简化模板结构。

  ```javascript
  <template>
    <h1>Title</h1>
    <p>Content</p>
  </template>
  ```

- Teleport：

  - 将子节点渲染到 DOM 的任意位置（如模态框）。

  javascript

  ```javascript
  <Teleport to="body">
    <div class="modal">Modal Content</div>
  </Teleport>
  ```

- Suspense：

  - 支持异步组件加载，显示 fallback 内容。

  javascript

  ```javascript
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
  ```

4.2 新指令

- v-memo：

  - 缓存模板片段，优化性能。

  ```javascript
  <div v-memo="[valueA, valueB]">
    <!-- 仅当 valueA 或 valueB 变化时更新 -->
  </div>
  ```

5. 构建工具与生态

Vue 3 的构建工具和生态系统全面升级。

5.1 区别

- Vue 2：
  - 依赖 Webpack 和 Vue CLI。
  - 构建配置复杂，零配置支持有限。
- Vue 3：
  - 推荐 Vite 作为默认构建工具，基于 ES Modules，启动和热更新更快。
  - Vue CLI 仍支持，但 Vite 更现代化。
  - 官方工具（如 Pinia、Vue Router 4）针对 Vue 3 优化。
  - 模块化设计，核心库更小（约 20KB gzipped）。

6. 其他改进

6.1 全局 API 变更

- Vue 2：全局挂载（如 Vue.prototype、Vue.use）。

- Vue 3：使用 createApp 创建独立实例，避免全局污染。

  ```javascript
  // Vue 3
  import { createApp } from 'vue';
  import App from './App.vue';
  const app = createApp(App);
  app.use(MyPlugin).mount('#app');
  ```

6.2 事件 API 移除

- Vue 2：支持 $on、$off、$once。

- Vue 3：移除事件 API，推荐使用外部事件库（如 mitt）或组件事件。

  ```javascript
  // Vue 3 替代
  import mitt from 'mitt';
  const emitter = mitt();
  emitter.on('event', () => console.log('Event triggered'));
  ```

6.3 过渡类名变更

- Vue 2：v-enter、v-leave-to。
- Vue 3：v-enter-from、v-leave-from，更直观。

6.4 自定义指令 API 变更

- Vue 2：bind、inserted 等钩子。

- Vue 3：统一为 beforeMount、mounted 等，命名一致。

  ```javascript
  // Vue 3
  const myDirective = {
    mounted(el, binding) {
      el.style.color = binding.value;
    },
  };
  ```

6.5 插槽语法统一

- Vue 2：slot 和 slot-scope。

- Vue 3：统一为 v-slot。

  ```javascript
  // Vue 3
  <template v-slot:header>
    Header Content
  </template>
  ```

7. 迁移与兼容性

- Vue 2：适合旧项目，生态成熟但功能有限。

- Vue 3：新项目首选，但迁移需注意：

  - 使用 

    @vue

    /compat

     过渡（兼容模式）。

  - 部分库（如 Vuex 需升级到 Pinia）。

  - IE11 不支持（需 polyfill 或降级）。

8. 总结

Vue 3 相比 Vue 2 的主要区别（除响应式外）：

- Composition API：更灵活的代码组织，优于 Options API。
- 性能优化：静态提升、Patch Flags、Tree-Shaking。
- TypeScript：开箱即用，类型推导更强。
- 新组件/指令：Fragment、Teleport、Suspense、v-memo。
- 构建工具：Vite 替代 Vue CLI，速度更快。
- 其他：全局 API 变更、事件 API 移除、过渡类名调整。