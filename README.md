# Tecretary

Tecretary 是一个比特币高频交易回测工具 for JavaScript。

## 特性

- 支持异步策略
- 支持事件触发式策略
- 模拟了交易所处理时间和网络延迟
- 模拟了你的 taker 订单对盘口的影响
- 非侵入式

### Drawbacks

- 只支持限价单
- 只支持 SQLite 导入回测数据

## 接口

你需要将你的策略写成这个接口

```ts
interface ServiceConstructor{
    new (context: ContextLike): Service;
}

interface Service {
    start(): Promise<void>;
    stop(): Promise<void>;
}
```

这个接口完全兼容阿里开源 node 进程管理器 Pandora。

由于本框架是非侵入式的，context 是你的策略与 Tecretary 进行交互的唯一通道。

```ts
interface ContextLike {
    [marketId: number]: {
        [accountId: number]: {
            makeLimitOrder(order: LimitOrder): Promise<OrderId>;
            getOpenOrders(): Promise<OpenOrder[]>;
            cancelOrder(orderId: OrderId): Promise<void>;
            getAssets(): Promise<Assets>;
        };
        on(event: 'orderbook', listener: (orderbook: Orderbook) => void): this;
        on(event: 'trades', listener: (trades: Trade[]) => void): this;
        off(event: 'orderbook', listener: (orderbook: Orderbook) => void): this;
        off(event: 'trades', listener: (trades: Trade[]) => void): this;
        once(event: 'orderbook', listener: (orderbook: Orderbook) => void): this;
        once(event: 'trades', listener: (trades: Trade[]) => void): this;
    };
    sleep: (ms: number) => Promise<void>;
    now: () => number;
    escape: <T>(v: T) => Promise<T>;
}
```

### marketId & accountId

### 异步策略

- 使用 context.now 函数来获取当前模拟时间。
- 当你想将函数 f *模拟*推迟 x 毫秒后运行，一律使用 `context.sleep(x).then(f)`

对于任何除了

- 原生 async function 返回值
- context.sleep 返回值

之外的 PromiseLike，代入 context.escape 来通知框架暂停模拟时间进程。

上面是容易记忆的傻瓜规则，适用于对 JavaScript 不熟悉的同学。对 JavaScript 熟悉的同学可以了解一下这个框架的基本原理，你就能更灵活地遵守这些规则。

## 基本原理

复习一下 JS 引擎维护的三个队列

- 一个事件循环 microtask queue 简称微队列。runtime 原生 Promise 在 fulfilled 时会自动将 then 里函数加入这个队列的末尾排队。
- 一个事件循环 macrotask queue 简称宏队列。其他所有事件绑定的函数（除非显示指定）都是在这个队列末尾排队，包括 Timer，IO 等。
- 一个 Timer 优先队列。当 Timer 时间到时，将这个 Timer 绑定的回调函数加入宏队列末尾排队。

微队列的优先级比宏队列高，只要微队列非空，就先跑微队列中的函数。

为了让你的异步策略和后台的模拟交易所能快进，Tecretary 自己实现了一个模拟时间线，以及这个模拟时间线的 Timer 优先队列。这个 Timer 优先队列中存储了

- 你的策略创建的 Timer
- 模拟交易所用于推送每一个回测数据的 Timer

context 上的 sleep 函数是就是创建模拟时间线的 Timer。context 上的 now 函数获取的是这个模拟时间线的当前时间。

Tecretary 自动运行下面这个调度过程

1. 从 Timer 优先队列中取出时间最近的 Timer
1. 将模拟时间线的当前时间设为这个 Timer 设定的时间
1. 将这个 Timer 绑定的函数加入宏队列末尾排队
1. 将本调度过程加入宏队列末尾排队

如果你的策略在某一个数据触发的协程中，将该协程的某一个事件循环排到了宏队列里，和调度过程混在宏队列里一起排队，可能导致这个协程在下一个数据触发之前运行不完。例如如下代码

```js
class Strategy {
    constructor(context) {
        context.on('trades', async trades => {
            /* L1 */ console.log(context.now());
            /* L2 */ await new Promise(resolve => void setImmediate(resolve));
            /* L3 */ console.log(context.now());
        });
    }
}
```

第 1 次调度（简称调度 1）将推送第 1 条 trades（简称 trades 1）的协程（简称协程 1）和第 2 次调度加入宏队列。此时宏队列长这样

1. 协程 1 
2. 调度 2

引擎从宏队列中取出队首运行。当运行到 L1 时，此时宏队列长这样

1. 调度 2

当运行到 L2 的 setImmediate 时，引擎将 resolve 加入宏队列。此时宏队列长这样

1. 调度 2
1. 协程 1 的 L2 的 resolve

当协程 1 的 L2 的 await 运行时，引擎会切出这个协程，到宏队列里取出队首运行，调度 2 将模拟时间线的当前时间快进到 trades 2 的时间，并将协程 2 和调度 3 加入宏队列。此时宏队列长这样

1. 协程 1 的 L2 的 resolve
1. 协程 2
1. 调度 3

此时协程 1 中的 L3 还没开始跑，但模拟时间线的时间已经是 trades 2 的时间了。等到协程 1 中 L3 跑的时候，输出的早已经不是 trades 1 的时间了。如同你在实盘上用了一台 30 年前的计算机，一个数据还没处理完，交易所就把下一个数据发来了。

因此你的策略务必保证任何异步事件

- 要么加入微队列。
- 要么通过 context 提供的 sleep 函数加入模拟时间线的 Timer 优先队列，再由框架自动替你加入宏队列。
- 要么直接加入宏队列之后用 context.escape 函数通知框架让框架下一次调度之前先等等你这个异步事件发生。

总之宏队列已经专用于调度，只有微队列可以自由使用，而宏队列每次使用都必须 escape。

```js
class Strategy {
    constructor(context) {
        context.on('trades', async trades => {
            await Promise.resolve(); // push into microtask queue
            await context.sleep(0); // push into simulative timer queue
            await context.escape(
                new Promise(resolve => void setImmediate(resolve)),
            ); // push into macrotask queue and inform Tecretary
        });
    }
}
```

## Widgets

工欲善其事，必先利其器。

- Startable - 健壮的服务型类框架
- Pollerloop - 优雅的异步循环
