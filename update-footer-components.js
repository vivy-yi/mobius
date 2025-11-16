#!/usr/bin/env node

/**
 * 批量更新脚本 - 将所有页面的footer替换为组件引用
 */

const fs = require('fs');
const path = require('path');

// 需要更新的文件列表
const filesToUpdate = [
    // 根目录文件
    'knowledge.html',
    'community.html',
    'team.html',

    // services目录文件
    'services/setup.html',
    'services/visa.html',
    'services/legal.html',
    'services/life.html',
    'services/business.html'
];

// 要替换的footer模式
const footerPatterns = [
    // 完整footer模式
    /\\s*<!-- Footer -->[\\s\\S]*?<\\/footer>\\s*/gi,

    // 简单footer模式
    /\\s*<footer class="footer">[\\s\\S]*?<\\/footer>\\s*/gi,

    // 脚本引用模式
    /\\s*<script src="\\.\\.\\/script\\.js"><\\/script>\\s*/gi
];

// 替换内容
const replacement = `
<script src="components/components.js"></script>
<script src="${p => p.includes('/services/') ? '../' : ''}script.js"></script>`;

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 移除所有footer相关代码
        footerPatterns.forEach(pattern => {
            const originalContent = content;
            content = content.replace(pattern, '');
            if (content !== originalContent) {
                modified = true;
            }
        });

        // 确保有组件引用和script.js引用
        const scriptPath = filePath.includes('/services/') ? '../' : '';
        if (!content.includes('components/components.js')) {
            // 在</body>前添加组件引用
            content = content.replace(
                /\\s*<\\/body>/,
                `\\n<script src="${scriptPath}components/components.js"></script>\\n<script src="${scriptPath}script.js"></script>\\n</body>`
            );
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 已更新: ${filePath}`);
        } else {
            console.log(`⏭️  无需更新: ${filePath}`);
        }

    } catch (error) {
        console.error(`❌ 更新失败 ${filePath}:`, error.message);
    }
}

// 执行更新
console.log('🚀 开始更新所有页面的footer组件...\n');

filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        updateFile(file);
    } else {
        console.log(`⚠️  文件不存在: ${file}`);
    }
});

console.log('\\n✨ Footer组件更新完成！');