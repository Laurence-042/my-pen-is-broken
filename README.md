# my-pen-is-broken
Steam 好评率98%，全球首款「寻找对话中敏感词」的游戏《ウーマンコミュニケーション/ 女性交流》通关后做的小玩具，既可以直接标红页面上的敏感词，也可以人工寻找敏感词并点击以标红

# 使用方式
打开[Bookmarklet Creator with Script Includer](https://mrcoles.com/bookmarklet/)，按需复制[preBuild](./preBuild)下的文件内容（一个是启动后直接标红所有“无意识敏感词”的自动版，另一个是手工标记的手动版），生成书签代码

创建一个书签，名称任意，URL填刚刚生成的书签代码

然后在您怀疑有“无意识敏感词”的网页上点击书签就能标红了！您可以在控制台中检查具体匹配到了哪些原始敏感词

![手动版使用示例](./doc/readme.gif)

# 外部依赖：
敏感词库：https://github.com/57ing/Sensitive-word/blob/master/%E8%89%B2%E6%83%85%E8%AF%8D%E5%BA%93.txt
