#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 路径配置
const srcPath = path.join(__dirname, '../src');
const srcIndexPath = path.join(srcPath, 'index.js');
const distPath = path.join(__dirname, '../dist');
const outputDir = path.join(distPath, 'bookmarklets');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 读取原始源代码
const originalCode = fs.readFileSync(srcIndexPath, 'utf8');

function buildWithAutoMode(autoMode) {
    const modeName = autoMode ? 'auto' : 'manual';
    console.log(`📖 构建 ${modeName} 版本...`);
    
    // 替换源代码中的 autoMode 值
    const modifiedCode = originalCode.replace(
        /(var|const|let)\s+autoMode\s*=\s*(true|false)/g,
        `const autoMode = ${autoMode}`
    );
    
    // 写入修改后的源代码
    fs.writeFileSync(srcIndexPath, modifiedCode);
    
    try {
        // 运行 webpack 构建
        console.log(`⚙️  运行 webpack 构建 ${modeName} 版本...`);
        execSync('npx webpack --config webpack.bookmarklet.config.js', {
            cwd: path.join(__dirname, '..'),
            stdio: 'pipe'
        });
        
        // 读取构建后的文件
        const bundlePath = path.join(distPath, 'bookmarklet.bundle.js');
        if (!fs.existsSync(bundlePath)) {
            throw new Error(`Bundle file not found: ${bundlePath}`);
        }
        
        const bundleCode = fs.readFileSync(bundlePath, 'utf8');
        
        // 创建书签格式
        const bookmarklet = `javascript:(function(){${bundleCode}})();`;
        
        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 保存书签文件
        const bookmarkletFilename = `${modeName}.bookmarklet.js`;
        const rawFilename = `${modeName}.raw.js`;
        
        fs.writeFileSync(path.join(outputDir, bookmarkletFilename), bookmarklet);
        fs.writeFileSync(path.join(outputDir, rawFilename), bundleCode);
        
        console.log(`✅ ${modeName} 版本构建完成: ${bookmarkletFilename}`);
        
        return {
            mode: modeName,
            code: bookmarklet,
            rawCode: bundleCode
        };
        
    } catch (error) {
        console.error(`❌ ${modeName} 版本构建失败:`, error.message);
        throw error;
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '\n': '&#10;',
        '\r': '&#13;'
    };
    return text.replace(/[&<>"'\n\r]/g, function(m) { return map[m]; });
}

function generateHTML(bookmarklets) {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>言阅姬</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .bookmarklet-section {
            margin-bottom: 40px;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            background-color: #fafafa;
        }
        .bookmarklet-section.auto {
            border-color: #4CAF50;
        }
        .bookmarklet-section.manual {
            border-color: #2196F3;
        }
        h2 {
            color: #555;
            margin-top: 0;
        }
        .description {
            margin-bottom: 15px;
            color: #666;
            line-height: 1.6;
        }
        .bookmark-link {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px 5px;
            transition: transform 0.2s;
            font-weight: bold;
        }
        .bookmark-link:hover {
            transform: translateY(-2px);
            text-decoration: none;
            color: white;
        }
        .auto .bookmark-link {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }
        .manual .bookmark-link {
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        }
        .code-section {
            margin-top: 20px;
        }
        .code-section details {
            margin-top: 10px;
        }
        .code-section summary {
            cursor: pointer;
            color: #666;
            font-weight: bold;
            padding: 8px;
            background: #f0f0f0;
            border-radius: 4px;
        }
        .code-section pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin-top: 10px;
            font-size: 12px;
            line-height: 1.4;
        }
        .instructions {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #2196F3;
        }
        .instructions h3 {
            margin-top: 0;
            color: #1976D2;
        }
        .step {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        .step::before {
            content: "→";
            position: absolute;
            left: 0;
            color: #2196F3;
            font-weight: bold;
        }
        .version-info {
            text-align: center;
            color: #888;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .known-issues {
            background: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #ffc107;
        }
        .known-issues h3 {
            margin-top: 0;
            color: #856404;
        }
        .issue {
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 5px;
            border-left: 3px solid #ffc107;
        }
        .issue-title {
            font-weight: bold;
            color: #856404;
            margin-bottom: 5px;
        }
        .issue-description {
            color: #6c5700;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖋️ 言阅姬 - YanYueji is watching you</h1>

        <p>Steam好评率98%，全球首款「寻找对话中敏感词」的游戏《ウーマンコミュニケーション/ 女性交流》通关后做的小玩具，既可以直接标红页面上的敏感词，也可以人工寻找敏感词并点击以标红</p>
        
        <div class="instructions">
            <h3>📋 使用说明</h3>
            <div class="step">右键点击下方对应的书签链接</div>
            <div class="step">选择"添加到书签"或"收藏链接"</div>
            <div class="step">在需要检测的网页上点击书签即可使用</div>
            <div class="step">自动版会立即高亮所有敏感词，手动版需要点击文字才会显示</div>
        </div>

        <div class="known-issues">
            <h3>⚠️ 已知问题</h3>
            <div class="issue">
                <div class="issue-title">🔄 DoubleShot 重叠问题</div>
                <div class="issue-description">
                    当页面上存在两个敏感词重叠（DoubleShot）时，自动模式只会标记出其中一个敏感词，但手动模式可以通过点击同时标记多个重叠的敏感词。
                </div>
            </div>
            <div class="issue">
                <div class="issue-title">🔢 拼音相同词汇重复计数</div>
                <div class="issue-description">
                    如果敏感词库中有多个拼音相同的单词，它们会被分别计数。例如：页面上只有一个词"测试"，但敏感词库里有拼音相同的"测试"、"侧视"、"策士"，那么启动时的统计信息会显示页面上有3个敏感词而不是1个。
                </div>
            </div>
        </div>

${bookmarklets.map(bookmarklet => `
        <div class="bookmarklet-section ${bookmarklet.mode}">
            <h2>📖 ${bookmarklet.mode === 'auto' ? '自动检测版' : '手动点击版'}</h2>
            <div class="description">
                ${bookmarklet.mode === 'auto' 
                    ? '自动扫描并高亮页面中的所有敏感词，检测结果会在控制台输出。' 
                    : '需要点击文字才会检测并显示敏感词的拼音，适合手动精确查看。'}
            </div>
            
            <a href="${escapeHtml(bookmarklet.code)}" class="bookmark-link">
                🔖 ${bookmarklet.mode === 'auto' ? '自动版书签' : '手动版书签'}
            </a>
            
            <div class="code-section">
                <details>
                    <summary>📄 查看书签代码</summary>
                    <pre><code>${escapeHtml(bookmarklet.code)}</code></pre>
                </details>
            </div>
        </div>
`).join('')}

        <div class="bookmarklet-section">
            <h2>您可以在下面的段落上测试它们</h2>

            <p>火焰可以燒毀玩家的物品，除非它們受到防火毯的保護或具有防火屬性。擁有足夠高的火抗性（約+15）或濕潤狀態也可以防止物品被燒毀。早期玩家可以拋出藥水創造水坑站在其中，或使用澆水壺將自己澆濕，以抵禦火焰相關敵人。</p>
            <p>卧槽，逼我写脚本是吧</p>
            <p>炸鸡可乐 <small style="color: #666;">（注意：有些敏感词库不会把"饥渴"作为敏感词，只会把"性饥渴"作为敏感词）</small></p>
            <p>女性交流</p>
            <p>全交给我吧！</p>
            <p>女性焦思处</p>
            <p>黑岩射井手</p>
        </div>

        <div class="version-info">
            <p>构建时间: ${new Date().toLocaleString('zh-CN')}</p>
            <p>版本: ${require('../package.json').version}</p>
        </div>
    </div>

    <script>
        // 防止意外点击书签链接在当前页面执行
        document.addEventListener('DOMContentLoaded', function() {
            const bookmarkLinks = document.querySelectorAll('.bookmark-link');
            bookmarkLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    if (confirm('这是一个书签链接。\\n\\n请右键点击并选择"添加到书签"，而不是直接点击。\\n\\n是否继续执行？（仅用于测试）')) {
                        return true;
                    }
                    e.preventDefault();
                    return false;
                });
            });
        });
    </script>
</body>
</html>`;
    
    return html;
}

try {
    console.log('📖 开始构建书签工具...');
    
    // 构建两个版本
    const autoBookmarklet = buildWithAutoMode(true);
    const manualBookmarklet = buildWithAutoMode(false);
    
    const bookmarklets = [autoBookmarklet, manualBookmarklet];
    
    // 生成HTML页面
    const htmlContent = generateHTML(bookmarklets);
    const htmlPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlContent);
    
    console.log(`🎉 书签工具构建完成！`);
    console.log(`📁 输出目录: ${outputDir}`);
    console.log(`🌐 打开 ${htmlPath} 查看和使用书签`);
    
    // 同时在根目录的dist下创建一个快捷方式
    const mainHtmlPath = path.join(distPath, 'bookmarks.html');
    fs.writeFileSync(mainHtmlPath, htmlContent);
    console.log(`🔗 快捷访问: ${mainHtmlPath}`);
    
} catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
} finally {
    // 恢复原始源代码
    console.log('🔄 恢复原始源代码...');
    fs.writeFileSync(srcIndexPath, originalCode);
}