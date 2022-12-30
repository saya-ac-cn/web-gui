# Tauri + React + Typescript

# 初始化
```shell
# 使用 yarn
yarn create tauri-app

# 或使用 npx
npx create-tauri-app
```

# 项目结构

```text
[web-gui] # 项目名称
├─ [node_modules] # 前端依赖
├─ [src] # 前端程序源
├─ [src-tauri] # Tauri 程序源
│    ├─ [icons] # 应用程序图标
│    ├─ [src] # Tauri App 程序源，例如系统菜单，托盘，插件配置等
│    ├─ [target] # 构建的产物会被放入此文件夹中，target 目录的结构取决于是否使用 --target 标志为特定的平台构建
│    ├─ build.rs # Tauri 构建应用
│    ├─ Cargo.lock # 包含了依赖的精确描述信息，类似于 yarn.lock 或 package-lock.json
│    ├─ Cargo.toml # Tauri (Rust) 项目清单
│    └─ tauri.conf.json # 自定义 Tauri 应用程序的配置文件，例如应用程序窗口尺寸，应用名称，权限等
├─ index.html # 项目主界面
├─ package.json # 前端项目清单
├─ tsconfig.json # typescript 配置文件
├─ vite.config.ts # vite 配置文件
├─ package-lock.json # 前端依赖的精确描述信息
└─ ... # 其他
```

# 启动项目

有两种启动方式：

## 1. 启动 web 项目

纯前端项目，不和操作系统产生任何交互
```shell
npm run dev
```

## 2. 启动 tauri 项目

需要和操作系统产生交互，如系统文件读写操作

第一次启动项目时，tauri 会根据src-tauri/Cargo.toml 去下载相关依赖（导致第一次启动比较慢），第二次启动会快很多。

```shell
npm run tauri dev
```

# 检查信息

检查 Tauri 信息以确保一切设置正确，在对问题进行分类时，此信息可能很有用。

```shell
yarn tauri info
```