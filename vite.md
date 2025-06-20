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

	2. 单文件 or 内联？

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

 