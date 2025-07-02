## 1. 生产环境处理静态资源

1. 自定义部署域名

```ts
// vite.config.ts
// 是否为生产环境，在生产环境一般会注入 NODE_ENV 这个环境变量，见下面的环境变量文件配置
const isProduction = process.env.NODE_ENV === 'production';
// 填入项目的 CDN 域名地址
const CDN_URL = 'xxxxxx';

// 具体配置
{
  base: isProduction ? CDN_URL: '/'
}

// .env.development
NODE_ENV=development

// .env.production
NODE_ENV=production

```

有时候可能项目中的某些图片需要存放到另外的存储服务

第一种方式

```vue
<img src={new URL('./logo.png', import.meta.env.VITE_IMG_BASE_URL).href} />
```

第二种：编写插件

```ts
// vite-plugin-cdn-rewrite.ts
import type { Plugin } from 'vite';
import path from 'path';

interface CDNOptions {
  js?: string;
  css?: string;
  img?: string;
  originHost?: string; // 例如 https://aaa.com
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//.test(url) || url.startsWith('//');
}

function normalizePath(p: string): string {
  return p.replace(/^\/+/, '');
}

export default function cdnRewritePlugin(cdn: CDNOptions = {}): Plugin {
  const { js, css, img, originHost } = cdn;

  return {
    name: 'vite-plugin-cdn-rewrite',
    enforce: 'post',
    apply: 'build',

    generateBundle(_, bundle) {
      for (const [fileName, asset] of Object.entries(bundle)) {
        const ext = path.extname(fileName).toLowerCase();

        // 🔹 替换 CSS 中的 url()
        if (asset.type === 'asset' && typeof asset.source === 'string' && ext === '.css') {
          if (img) {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            asset.source = asset.source.replace(/url\(["']?(.+?\.(png|jpe?g|gif|svg|webp))["']?\)/g, (_, p1) => {
              if (isAbsoluteUrl(p1)) {
                // 如果以 originHost 开头就替换
                if (originHost && p1.startsWith(originHost)) {
                  const relativePath = p1.replace(originHost, '');
                  return `url(${img}${normalizePath(relativePath)})`;
                }
                return `url(${p1})`; // 保持原样
              }
              return `url(${img}${normalizePath(p1)})`;
            });
          }
        }

        // 🔹 替换 chunk 里的资源路径（JS）
        if (asset.type === 'chunk') {
          if (img) {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            asset.code = asset.code.replace(/"([^"]+\.(png|jpe?g|gif|svg|webp))"/g, (_, p1) => {
              if (isAbsoluteUrl(p1)) {
                if (originHost && p1.startsWith(originHost)) {
                  const relativePath = p1.replace(originHost, '');
                  return `"${img}${normalizePath(relativePath)}"`;
                }
                return `"${p1}"`;
              }
              return `"${img}${normalizePath(p1)}"`;
            });
          }

          if (js) {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            asset.code = asset.code.replace(/import\.meta\.url\s*\+\s*["']([^"']+)["']/g, (_, p1) => {
              if (isAbsoluteUrl(p1)) return `"${p1}"`;
              return `"${js}${normalizePath(p1)}"`;
            });
          }
        }

        // 🔹 替换图片资源本身的路径（如 image-b584c637.png）
        if (asset.type === 'asset' && ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
          if (img) {
            asset.fileName = normalizePath(`assets/${path.basename(asset.fileName)}`);
            // Note: 这里不修改内容，仅建议配合 `base` + CDN 使用
          }
        }
      }
    },
  };
}

```

2. 单文件 or 内

在 Vite 中，所有的静态资源都有两种构建方式，一种是打包成一个单文件，另一种是通过 base64 编码的格式内嵌到代码中。

Vite 中内置的优化方案是下面这样的:

- 如果静态资源体积 >= 4KB，则提取成单独的文件
- 如果静态资源体积 < 4KB，则作为 base64 格式的字符串内联

```ts
// vite.config.ts
{
  build: {
    // 8 KB
    assetsInlineLimit: 8 * 1024
  }
}

```

svg 格式的文件不受这个临时值的影响，始终会打包成单独的文件，因为它和普通格式的图片不一样，需要动态设置一些属性

3. 图片压缩

   图片资源的体积往往是项目产物体积的大头，如果能尽可能精简图片的体积，那么对项目整体打包产物体积的优化将会是非常明显的。

```ts
//vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

{
  plugins: [
    // 忽略前面的插件
    viteImagemin({
      // 无损压缩配置，无损压缩下图片质量不会变差
      optipng: {
        optimizationLevel: 7
      },
      // 有损压缩配置，有损压缩下图片质量可能会变差
      pngquant: {
        quality: [0.8, 0.9],
      },
      // svg 优化
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  ]
}

```

4. 雪碧图优化

在实际的项目中我们还会经常用到各种各样的 svg 图标，虽然 svg 文件一般体积不大，但 Vite 中对于 svg 文件会始终打包成单文件，大量的图标引入之后会导致网络请求增加，大量的 HTTP 请求会导致网络解析耗时变长，页面加载性能直接受到影响。这个问题怎么解决呢？

HTTP2 的多路复用设计可以解决大量 HTTP 的请求导致的网络加载性能问题，因此雪碧图技术在 HTTP2 并没有明显的优化效果，这个技术更适合在传统的 HTTP 1.1 场景下使用(比如本地的 Dev Server)。

假设页面有 100 个 svg 图标，将会多出 100 个 HTTP 请求，依此类推。我们能不能把这些 svg 合并到一起，从而大幅减少网络请求呢？

答案是可以的。这种合并图标的方案也叫`雪碧图`，我们可以通过`vite-plugin-svg-icons`来实现这个方案

```ts
// vite.config.ts
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

{
  plugins: [
    // 省略其它插件
    createSvgIconsPlugin({
      iconDirs: [path.join(__dirname, 'src/assets/icons')]
    })
  ]
}
```

## 2. 为什么需要预构建?

依赖预构建主要做了两件事情：

1. 将其他格式(如 UMD 和 CommonJS)的产物转换为 ESM 格式，使其在浏览器通过 `<script type="module"><script>`的方式正常加载。

2. 打包第三方库的代码，将各个第三方库分散的文件合并到一起，减少 HTTP 请求数量，避免页面加载性能劣化。

#### 场景一: 动态 import

在某些动态 import 的场景下，由于 Vite 天然按需加载的特性，经常会导致某些依赖只能在运行时被识别出来。

```ts
// src/locales/zh_CN.js
import objectAssign from "object-assign";
console.log(objectAssign);

// main.tsx
const importModule = (m) => import(`./locales/${m}.ts`);
importModule("zh_CN");
```

在这个例子中，动态 import 的路径只有运行时才能确定，无法在预构建阶段被扫描出来。

Vite 运行时发现了新的依赖，随之重新进行依赖预构建，并刷新页面。这个过程也叫**二次预构建**。在一些比较复杂的项目中，这个过程会执行很多次。二次预构建的成本也比较大。我们不仅需要把预构建的流程重新运行一遍，还得重新刷新页面，并且需要重新请求所有的模块。尤其是在大型项目中，这个过程会严重拖慢应用的加载速度！因此，我们要尽力避免运行时的**二次预构建**。具体怎么做呢？你可以通过`include`参数提前声明需要按需加载的依赖:

```ts
// vite.config.ts
{
  optimizeDeps: {
    include: [
      // 按需加载的依赖都可以声明到这个数组里
      "object-assign",
    ];
  }
}
```

## 3. Vite 架构图

#### 性能利器——Esbuild

1. 依赖预构建——作为 Bundle 工具

2. 单文件编译——作为 TS 和 JSX 编译工具

3. 代码压缩——作为压缩工具

#### 构建基石——Rollup

1. 生产环境 Bundle

​	 a. CSS 代码分割。如果某个异步模块中引入了一些 CSS 代码，Vite 就会自动将这些 CSS 抽取出来生成单独的文件，提高线上产物的`缓存复用率`。

​	b. 自动预加载。Vite 会自动为入口 chunk 的依赖自动生成预加载标签`<link rel="modulepreload">` ，如:

```html
<head>
  <!-- 省略其它内容 -->
  <!-- 入口 chunk -->
  <script type="module" crossorigin src="/assets/index.250e0340.js"></script>
  <!--  自动预加载入口 chunk 所依赖的 chunk-->
  <link rel="modulepreload" href="/assets/vendor.293dca09.js">
</head>
```

这种适当预加载的做法会让浏览器提前下载好资源，优化页面性能。

​	c. 异步 Chunk 加载优化。

2. 兼容插件机制

## 4.模块联邦

## 5. 系统化优化

### 网络优化

#### 1. HTTP2

传统的 `HTTP 1.1` 存在**队头阻塞**的问题，同一个 TCP 管道中同一时刻只能处理一个 HTTP 请求，也就是说如果当前请求没有处理完，其它的请求都处于阻塞状态，另外浏览器对于同一域名下的并发请求数量都有限制，比如 Chrome 中只允许 `6` 个请求并发（这个数量不允许用户配置），也就是说请求数量超过 6 个时，多出来的请求只能**排队**、等待发送。

因此，在 HTTP 1.1 协议中，**队头阻塞**和**请求排队**问题很容易成为网络层的性能瓶颈。而 HTTP 2 的诞生就是为了解决这些问题，它主要实现了如下的能力：

- **多路复用**。将数据分为多个二进制帧，多个请求和响应的数据帧在同一个 TCP 通道进行传输，解决了之前的队头阻塞问题。而与此同时，在 HTTP2 协议下，浏览器不再有同域名的并发请求数量限制，因此请求排队问题也得到了解决。
- **Server Push**，即服务端推送能力。可以让某些资源能够提前到达浏览器，比如对于一个 html 的请求，通过 HTTP 2 我们可以同时将相应的 js 和 css 资源推送到浏览器，省去了后续请求的开销。

Vite 配置中进行使用:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    // https 选项需要开启
    https: true,
  },
});

```

插件的原理也比较简单，由于 HTTP2 依赖 TLS 握手，插件会帮你自动生成 TLS 证书，然后支持通过 HTTPS 的方式启动，而 Vite 会自动把 HTTPS 服务升级为 HTTP2。

> 其中有一个特例，即当你使用 Vite 的 proxy 配置时，Vite 会将 HTTP2 降级为 HTTPS，不过这个问题你可以通过[vite-plugin-proxy-middleware](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwilliamyorkl%2Fvite-plugin-proxy-middleware)插件解决。

###  vite比webpqck快 快在哪些方面呢

1. 开发服务器启动速度快

- Vite：Vite 的开发服务器利用浏览器原生支持的 ES 模块（ESM），无需在启动时对整个项目进行打包。Vite 仅对依赖（如 node_modules 中的库）进行预打包（使用 esbuild，速度极快），并按需加载和编译源代码。这使得开发服务器的冷启动时间极短，通常在几秒内完成，即使项目规模较大。
- Webpack：Webpack 在启动开发服务器时需要扫描所有源代码和依赖，生成完整的打包图（bundle graph），并进行预打包。这个过程在大型项目中可能需要几十秒甚至几分钟。

2. 热模块替换（HMR）速度快

- Vite：Vite 的 HMR（Hot Module Replacement）基于原生 ESM，仅更新发生变化的模块及其直接依赖，而无需重新打包整个应用。浏览器直接请求更新后的模块，更新速度通常在 50ms 以内，即使在大型项目中也能保持稳定。Vite 还通过 HTTP 头（如 304 Not Modified）优化缓存，减少不必要的请求。
- Webpack：Webpack 的 HMR 需要重建受影响的模块及其依赖的部分打包图，并推送更新到浏览器。对于大型项目，HMR 的更新时间可能达到 100-500ms，甚至在复杂场景下高达数秒（如 TypeScript 项目）

3. 按需加载和编译

- Vite：Vite 在开发环境中不预先打包整个应用，而是根据浏览器请求按需编译和加载模块。这种“懒加载”方式减少了初始编译的工作量，尤其适合模块化程度高的项目。Vite 还通过并行加载（利用浏览器对 ESM 的支持）和依赖预打包优化了加载速度。
- Webpack：Webpack 采用“全量打包”方式，在开发时需要预先处理所有模块及其依赖，生成打包文件。这导致初始加载和后续更新的开销较大，尤其在模块数量多时。

4. 依赖预打包效率高

- Vite：Vite 使用 esbuild（基于 Go 语言）进行依赖预打包，esbuild 比 JavaScript 实现的打包工具（如 Webpack 使用的 Terser 或 Babel）快 10-100 倍。Vite 将 CommonJS 或 UMD 格式的依赖转换为 ESM，并缓存结果，减少重复编译。
- Webpack：Webpack 依赖 JavaScript 工具链（如 Babel 或 Terser）处理依赖，速度较慢，尤其在处理大量第三方库时开销大。此外，Webpack 的缓存机制需要额外的配置优化。

5. 生产构建速度（部分场景）

- Vite：Vite 在生产环境中使用 Rollup 进行打包，Rollup 专注于 ESM，生成更小、更高效的打包文件。Vite 的异步分块加载优化（Async Chunk Loading Optimization）通过并行加载模块和公共 chunk 减少了网络请求开销。
- Webpack：Webpack 的生产构建功能强大，支持复杂的代码分割和优化，但其构建过程涉及更多步骤（如 loader 处理、插件执行），在大型项目中构建时间可能较长。

6. 内存使用效率高

- Vite：由于按需加载和编译，Vite 的内存占用较低，即使项目规模增长，内存使用量也保持稳定。例如，小型项目中 Vite 可能占用 30MB 内存，大型项目约 42MB。
- Webpack：Webpack 需要维护完整的模块图，内存占用随项目规模增长显著增加。小型项目可能占用 100MB 以上，大型项目可能高达 240MB 或更多。

## vite HMR原理 为什么会那么快

Vite 的 HMR 基于浏览器原生 ES 模块（ESM）支持和高效的开发服务器架构，通过 WebSocket 通信、按需编译和模块级更新实现快速的模块替换。以下是其核心工作流程：

1. 开发服务器与客户端通信

- 初始化：Vite 启动开发服务器（基于 esbuild 和 Koa），并通过 WebSocket 建立与浏览器的双向通信通道。客户端运行时（Vite 注入的 HMR 客户端代码）会监听服务器发送的更新事件。
- 文件监听：Vite 使用文件系统监听工具（如 chokidar）监控项目文件的更改（包括 .js、.vue、.css 等文件）。
- 事件触发：当检测到文件变化时，Vite 分析受影响的模块及其依赖关系，并通过 WebSocket 通知客户端需要更新的模块。
- 基于 ESM 的模块加载

- Vite 利用浏览器原生支持的 ES 模块（通过 <script type="module">）加载源代码。在开发环境中，Vite 不打包整个应用，而是将源文件按需编译为 ESM 格式，并通过 HTTP 提供给浏览器。
- 模块更新：当某个模块（例如 App.vue 或 style.css）发生变化，Vite 只重新编译该模块，并通过 WebSocket 通知浏览器加载更新后的模块 URL（如 http://localhost:5173/src/App.vue?hash=xxx）。
- 动态导入：客户端通过 import() 动态加载更新后的模块，替换旧模块，而无需刷新整个页面。
- 模块替换逻辑

- 模块热替换：Vite 的 HMR 客户端根据文件类型和框架（如 Vue、React）执行不同的替换策略：
  - JavaScript/TS 模块：通过动态 import 加载新模块，并调用模块提供的 hot.accept 回调（开发者定义）或框架特定的更新逻辑。
  - Vue 单文件组件：Vite 的 Vue 插件会解析 .vue 文件的变化（模板、脚本或样式），仅更新受影响的部分（如重新渲染组件或更新样式）。
  - CSS 模块：CSS 文件变化时，Vite 直接替换 <link> 标签或更新 <style> 内容，触发浏览器重新渲染样式。
- 依赖追踪：Vite 维护一个模块依赖图（Module Graph），记录模块之间的导入关系。当一个模块更新时，Vite 分析其依赖链，通知相关模块进行更新（但通常只更新直接受影响的模块）。
- 框架特定的 HMR 支持

- Vite 针对主流框架（如 Vue、React、Svelte）提供了定制化的 HMR 插件：
  - Vue：Vite 的 @vitejs/plugin-vue 插件支持细粒度的更新，例如只更新组件的模板或状态，而无需重新加载整个组件树。
  - React：通过 react-refresh 插件，Vite 支持 React Fast Refresh，保留组件状态，仅更新修改的组件。
  - 其他框架：类似地，Vite 的插件生态支持 Svelte、Preact 等框架的 HMR，优化更新逻辑。
- 缓存与优化

- 浏览器缓存：Vite 在模块 URL 中加入时间戳或哈希（如 App.vue?t=1698765432），确保浏览器加载最新的模块，同时利用 HTTP 缓存（如 304 Not Modified）减少不必要的请求。
- 预打包依赖：Vite 在开发服务器启动时使用 esbuild 预打包 node_modules 中的依赖，转换为 ESM 格式并缓存，避免运行时重复解析。
- 回退机制

- 如果模块不支持 HMR（例如修改了无法热更新的代码，如全局变量或入口文件），Vite 会触发全页面刷新（Full Reload）作为回退，确保开发体验不中断。

为什么 Vite 的 HMR 那么快？

Vite 的 HMR 速度快（通常 <50ms）的原因可以归结为以下几个关键点：

1. 基于原生 ESM，按需加载

- 原理：Vite 不像 Webpack 那样在开发时生成完整的打包文件，而是利用浏览器对 ESM 的原生支持，按需加载和编译模块。HMR 只更新发生变化的模块，而不是重新打包整个应用。
- 速度优势：
  - 模块级更新：例如，修改一个组件只重新编译该组件（几十 KB 的代码），而 Webpack 可能需要重新构建部分或全部打包图（可能涉及数 MB 的代码）。
  - 并行加载：浏览器可以并行请求多个模块，减少网络瓶颈。
  - 量化对比：Vite 的 HMR 更新时间通常在 10-50ms，而 Webpack 的 HMR 可能需要 100-500ms，尤其在大型项目中差距明显。
- esbuild 的高效编译

- 原理：Vite 使用 esbuild（基于 Go 语言）进行模块编译和依赖预ਰ