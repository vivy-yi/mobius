#!/usr/bin/env python3
import json
import os
import glob

def create_markdown_html_content(article_data, article_id):
    """创建Markdown格式的HTML内容"""

    # 基本的HTML结构
    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{article_data['title']} - Mobius知识库</title>
    <meta name="description" content="{article_data['excerpt']}">
    <link rel="stylesheet" href="../style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <div class="container">
        <article class="knowledge-article">
            <header class="article-header">
                <div class="article-meta">
                    <span class="article-date">{article_data['date']}</span>
                    <span class="article-reading-time">{article_data['readingTime']}</span>
                </div>
                <h1 class="article-title">{article_data['title']}</h1>
                <div class="article-excerpt">
                    <p>{article_data['excerpt']}</p>
                </div>
            </header>

            <div class="article-content">
                <div class="markdown-content">
                    <h2>概述</h2>
                    <p>{article_data['excerpt']}</p>

                    <h2>主要要点</h2>

                    <h3>核心信息</h3>
                    <ul>
                        <li><strong>发布日期：</strong>{article_data['date']}</li>
                        <li><strong>阅读时间：</strong>{article_data['readingTime']}</li>
                        <li><strong>分类：</strong>{article_data['category']}</li>
                        <li><strong>类型：</strong>{article_data['type']}</li>
                    </ul>

                    <h3>相关标签</h3>
                    <p>{', '.join(article_data['tags'])}</p>

                    <h2>详细信息</h2>
                    <p>本文章详细介绍{article_data['category']}相关的专业知识和实用指南。如需了解更多信息，请联系Mobius专业顾问。</p>

                    <h2>专业服务</h2>
                    <p>Mobius为您提供全方位的{article_data['category']}支持服务，包括专业咨询、申请协助、后续跟进等。通过我们的专业服务，让您的{article_data['category']}过程更加顺畅高效。</p>

                    <h2>联系方式</h2>
                    <p>如需了解更多信息或获取专业咨询，请联系我们的专业顾问团队。</p>
                </div>
            </div>

            <footer class="article-footer">
                <div class="article-tags">
                    {generate_article_tags_html(article_data.get('tags', []))}
                </div>
                <div class="article-back-link">
                    <a href="../knowledge.html" class="back-link">
                        <i class="fas fa-arrow-left"></i>
                        返回知识库
                    </a>
                </div>
            </footer>
        </article>
    </div>
</body>
</html>"""

    return html_content

def generate_article_tags_html(tags):
    """生成文章标签HTML"""
    if not tags:
        return ""

    tag_html = ""
    for tag in tags:
        tag_html += f'<span class="article-tag">{tag}</span>\n'

    return tag_html.strip()

def load_articles_json():
    """加载articles.json文件"""
    with open('data/articles.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    print("🔄 开始转换为Markdown格式HTML...")

    # 加载articles.json
    data = load_articles_json()

    # 查找所有现有HTML文件
    existing_files = glob.glob('knowledge/*.html')
    converted_count = 0

    for file_path in existing_files:
        file_name = os.path.basename(file_path)
        article_id = file_name[:-5]  # 移除.html扩展名

        # 在articles.json中查找对应的文章数据
        found_article = None
        for category, articles in data['categories'].items():
            for article in articles:
                if article['id'] == article_id:
                    found_article = article
                    break
            if found_article:
                break

        if found_article:
            # 生成新的Markdown格式HTML内容
            new_content = create_markdown_html_content(found_article, article_id)

            # 写入文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"✅ 转换完成: {file_name}")
            converted_count += 1
        else:
            print(f"⚠️  未找到文章数据: {file_name}")

    print(f"🎉 转换完成！共处理了 {converted_count} 个HTML文件")

if __name__ == "__main__":
    main()