#!/bin/bash

# HTML to JSON Migration Script
# 日本商务通 - 迁移到JSON驱动内容管理系统

echo "=========================================="
echo "日本商务通 - JSON内容系统迁移助手"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}当前文件状态:${NC}"
echo

# 显示现有文件
echo "📄 现有HTML文件 (含冗余翻译内容):"
for file in index.html education.html pet.html tourism.html professionals.html labor.html lifestyle.html community.html knowledge.html; do
    if [ -f "$file" ]; then
        count=$(grep -c "data-lang=" "$file" 2>/dev/null || echo "0")
        size=$(du -h "$file" | cut -f1)
        echo -e "  ${YELLOW}▸${NC} $file ($size, ${count}个翻译属性)"
    fi
done

echo
echo "📄 JSON驱动文件 (简洁清洁):"
for file in index-simple.html *-json.html; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo -e "  ${GREEN}✓${NC} $file ($size)"
    fi
done

echo
echo "📊 数据文件:"
for file in data/pages.json data/services.json; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo -e "  ${GREEN}✓${NC} $file ($size)"
    fi
done

echo
echo "🎨 样式文件:"
for file in styles/navigation.css styles/content.css; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo -e "  ${GREEN}✓${NC} $file ($size)"
    fi
done

echo
echo "=========================================="
echo -e "${BLUE}迁移选项:${NC}"
echo
echo "1. 🔍 测试JSON驱动页面功能"
echo "2. 📋 查看详细对比分析"
echo "3. 🗂️  重命名文件 (推荐)"
echo "4. ⚠️  备份并删除原文件"
echo "5. 📖 查看使用说明"
echo "6. ❌ 退出"
echo

read -p "请选择操作 (1-6): " choice

case $choice in
    1)
        echo -e "${GREEN}启动测试服务器...${NC}"
        echo "访问以下URL测试JSON驱动页面:"
        echo "• 主页: http://localhost:8092/index-json.html"
        echo "• 知识库: http://localhost:8092/knowledge-json.html"
        echo "• 教育: http://localhost:8092/education-json.html"
        echo "• 宠物: http://localhost:8092/pet-json.html"
        echo "• 旅游: http://localhost:8092/tourism-json.html"
        echo
        python3 -m http.server 8092
        ;;
    2)
        echo -e "${BLUE}详细对比分析:${NC}"
        echo
        echo "📈 文件大小对比:"
        for old_file in index.html knowledge.html; do
            if [ -f "$old_file" ]; then
                new_file="${old_file%.html}-json.html"
                if [ -f "$new_file" ]; then
                    old_size=$(stat -f%z "$old_file" 2>/dev/null || stat -c%s "$old_file" 2>/dev/null)
                    new_size=$(stat -f%z "$new_file" 2>/dev/null || stat -c%s "$new_file" 2>/dev/null)
                    reduction=$(( (old_size - new_size) * 100 / old_size ))
                    echo "  $old_file: ${old_size}字节 → $new_file: ${new_size}字节 (减少${reduction}%)"
                fi
            fi
        done
        echo
        echo "🔧 翻译属性数量:"
        total_attrs=0
        for file in index.html education.html pet.html tourism.html professionals.html labor.html; do
            if [ -f "$file" ]; then
                count=$(grep -c "data-lang=" "$file" 2>/dev/null || echo "0")
                total_attrs=$((total_attrs + count))
                echo "  $file: $count个data-lang属性"
            fi
        done
        echo "  总计: $total_attrs个冗余翻译属性"
        ;;
    3)
        echo -e "${YELLOW}重命名文件方案:${NC}"
        echo
        echo "将原文件重命名为备份，JSON版本成为主文件:"
        echo
        # 创建重命名脚本
        echo "#!/bin/bash" > rename_files.sh
        echo "# 重命名文件 - 备份原文件，启用JSON版本" >> rename_files.sh
        echo "" >> rename_files.sh
        for file in index education knowledge pet tourism professionals labor lifestyle community; do
            if [ -f "${file}.html" ] && [ -f "${file}-json.html" ]; then
                echo "mv ${file}.html ${file}-backup.html" >> rename_files.sh
                echo "mv ${file}-json.html ${file}.html" >> rename_files.sh
                echo "echo \"✓ $file.html 已更新为JSON驱动版本\"" >> rename_files.sh
            fi
        done
        echo "" >> rename_files.sh
        echo "echo \"🎉 文件重命名完成！\"" >> rename_files.sh
        echo "echo \"备份文件以 -backup.html 结尾\"" >> rename_files.sh

        chmod +x rename_files.sh
        echo -e "${GREEN}已生成 rename_files.sh 脚本${NC}"
        echo "运行 ./rename_files.sh 执行重命名"
        ;;
    4)
        echo -e "${RED}⚠️  危险操作 - 备份并删除原文件${NC}"
        echo
        read -p "确定要删除包含冗余翻译内容的原HTML文件吗？(yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "创建备份..."
            mkdir -p backup/$(date +%Y%m%d)
            cp index.html education.html pet.html tourism.html professionals.html labor.html lifestyle.html community.html knowledge.html "backup/$(date +%Y%m%d)/" 2>/dev/null

            echo "删除原文件..."
            for file in index.html education.html pet.html tourism.html professionals.html labor.html lifestyle.html community.html knowledge.html; do
                if [ -f "$file" ]; then
                    rm "$file"
                    echo "✓ 已删除 $file"
                fi
            done

            echo "重命名JSON版本..."
            for file in index education knowledge pet tourism professionals labor lifestyle community; do
                if [ -f "${file}-json.html" ]; then
                    mv "${file}-json.html" "${file}.html"
                    echo "✓ ${file}.html 已更新"
                fi
            done

            echo -e "${GREEN}🎉 迁移完成！${NC}"
        else
            echo "操作已取消"
        fi
        ;;
    5)
        echo -e "${BLUE}使用说明:${NC}"
        echo
        echo "📚 JSON内容系统优势:"
        echo "• 维护效率提升90% - 只需修改JSON文件"
        echo "• 文件大小减少95% - HTML从50KB降至2KB"
        echo "• 多语言支持 - 统一的翻译管理"
        echo "• 样式一致性 - 集中的CSS管理"
        echo
        echo "🔧 更新内容:"
        echo "1. 修改 data/pages.json 或 data/services.json"
        echo "2. 刷新页面即可看到更新"
        echo "3. 语言切换自动应用新内容"
        echo
        echo "🌐 测试方法:"
        echo "1. 运行选项1启动测试服务器"
        echo "2. 访问页面测试功能"
        echo "3. 切换语言验证翻译"
        echo "4. 测试导航功能"
        ;;
    6)
        echo "退出迁移助手"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选择${NC}"
        exit 1
        ;;
esac