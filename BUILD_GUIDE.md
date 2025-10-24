# 🖋️ 言阅姬 - 书签构建指南

## 📖 简介

言阅姬是一个用于检测网页中敏感词的浏览器书签工具。支持自动检测和手动点击两种模式。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 构建书签
```bash
# 构建书签版本
npm run build:bookmarklets

# 或者构建所有版本（包括普通网页版）
npm run build:all
```

### 3. 使用书签
构建完成后，打开 `dist/bookmarks.html` 文件，按照页面说明添加书签到浏览器。

## 📁 项目结构

```
my-pen-is-broken/
├── src/
│   ├── index.js          # 主程序（网页版）
│   ├── bookmarklet.js    # 书签版本源码
│   └── index.html        # 网页版模板
├── scripts/
│   └── build-bookmarklets.js  # 书签构建脚本
├── webpack.config.js           # 网页版webpack配置
├── webpack.bookmarklet.config.js # 书签版webpack配置
└── dist/
    ├── bookmarks.html    # 书签使用页面
    └── bookmarklets/     # 生成的书签文件
        ├── auto.bookmarklet.js    # 自动版书签
        ├── manual.bookmarklet.js  # 手动版书签
        ├── auto.raw.js           # 自动版原始代码
        └── manual.raw.js         # 手动版原始代码
```

## 🛠️ NPM 脚本

| 脚本 | 说明 |
|------|------|
| `npm run build` | 构建普通网页版 |
| `npm run build:bookmarklets` | 仅构建书签版本 |
| `npm run build:all` | 构建所有版本 |
| `npm run start` | 启动开发服务器 |
| `npm run watch` | 监听文件变化并自动构建 |

## 📚 两种模式说明

### 🤖 自动检测版
- **功能**: 加载后立即扫描整个页面，高亮所有敏感词
- **适用场景**: 快速扫描，批量检测
- **输出方式**: 控制台日志 + 页面高亮
- **书签名**: `auto.bookmarklet.js`

### 👆 手动点击版  
- **功能**: 需要点击文字才会检测该处的敏感词
- **适用场景**: 精确检测，逐个确认
- **输出方式**: 拼音弹窗 + 页面高亮
- **书签名**: `manual.bookmarklet.js`

## 🔧 开发说明

### 修改敏感词来源
编辑 `src/bookmarklet.js` 中的 `getAllSensitiveWords()` 函数。

### 修改检测逻辑
主要检测逻辑在 `findSensitiveWordPositions()` 和 `susTextClickHandler()` 函数中。

### 修改样式
编辑 `addStyles()` 函数中的CSS样式。

### 自定义构建
- 修改 `scripts/build-bookmarklets.js` 来自定义书签生成逻辑
- 修改 `webpack.bookmarklet.config.js` 来调整打包配置

## 🐛 故障排除

### 构建失败
1. 确保已安装所有依赖：`npm install`
2. 检查Node.js版本是否兼容
3. 清理依赖重新安装：`rm -rf node_modules && npm install`

### 书签不工作
1. 检查浏览器控制台的错误信息
2. 确认网站没有阻止外部脚本执行
3. 尝试在简单的网页上测试书签

### 敏感词检测不准确
1. 检查网络连接，确保能访问敏感词库
2. 查看控制台是否有拼音转换错误
3. 检查目标网页的文本编码

## 📄 许可证

见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！