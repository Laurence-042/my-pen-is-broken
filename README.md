# 🖋️ 言阅姬 (YanYueJi)

Steam 好评率98%，全球首款「寻找对话中敏感词」的游戏《ウーマンコミュニケーション/ 女性交流》通关后做的小玩具，既可以直接标红页面上的敏感词，也可以人工寻找敏感词并点击以标红。

## 🎯 两种模式

| 模式 | 功能 | 适用场景 |
|------|------|----------|
| **🤖 自动检测版** | 加载后立即扫描并高亮所有敏感词 | 让我看看这个网页会被言阅姬抓到多少次无意识风纪违反 |
| **👆 手动点击版** | 点击文字才检测敏感词并显示拼音 | 一定程度上模拟了原作，但是说实话自从我小学毕业就失去了在日常网页中找敏感词谐音的技能，所以我自己只用自动检测版 |

## 🌐 在线Demo

**👉 [点击这里体验在线版本](https://laurence-042.github.io/project/my-pen-is-broken/demo/bookmarks.html)**

> 在上面链接指向的页面中获取书签，然后那个页面同样提供了用于测试的示例文字！

## ⚠️ 已知限制

- **DoubleShot 重叠问题**: 当两个敏感词重叠时，自动模式只会标记其中一个，手动模式可以标记多个
- **拼音相同词汇重复计数**: 敏感词库中拼音相同的词会被分别计数，导致统计数量可能偏高

## 🛠️ 开发

### 项目结构
```
my-pen-is-broken/
├── src/
│   ├── index.js              # 核心逻辑
│   └── index.html            # HTML模板
├── scripts/
│   └── build-bookmarklets.js # 书签构建脚本
├── dist/
│   ├── bookmarks.html        # 书签使用页面
│   └── bookmarklets/         # 生成的书签文件
└── webpack配置文件...
```

### NPM 脚本
```bash
npm run build    # 构建书签版本
npm run start    # 启动开发服务器
npm run watch    # 监听文件变化
```

### 技术实现

```
原始文本 → 拼音转换 → Token化 → 敏感词匹配 → DOM替换
```
- **加载敏感词库**: 访问[57ing/Sensitive-word](https://github.com/57ing/Sensitive-word/blob/master/%E8%89%B2%E6%83%85%E8%AF%8D%E5%BA%93.txt)获取敏感词列表
- **拼音标准化**: 使用 `pinyin` 库对页面上的文本和敏感词库里的文本进行中文-拼音转换
- **模糊匹配**: 忽略标点符号进行无音调的拼音比对
- **DOM替换**: 自动模式下将匹配的部分标红，手动模式下给每个文本元素添加“点击时检测敏感词”的回调

## 📚 外部依赖

- **敏感词库**: [57ing/Sensitive-word](https://github.com/57ing/Sensitive-word/blob/master/%E8%89%B2%E6%83%85%E8%AF%8D%E5%BA%93.txt)
- **拼音转换**: [pinyin](https://www.npmjs.com/package/pinyin) 库
- **构建工具**: Webpack + Babel

## 📄 更多信息

- **详细构建说明**: [BUILD_GUIDE.md](./BUILD_GUIDE.md)
- **项目许可证**: [LICENSE](./LICENSE)

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！
