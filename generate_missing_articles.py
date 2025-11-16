#!/usr/bin/env python3
import json
import os

def extract_article_ids():
    """从articles.json中提取所有文章ID"""
    with open('data/articles.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    article_ids = []
    # 提取categories中的所有文章ID
    for category, articles in data['categories'].items():
        for article in articles:
            article_ids.append(article['id'])

    # 如果有FAQ数据，则提取FAQ中的ID
    if 'faqs' in data:
        for category, faqs in data['faqs'].items():
            for faq in faqs:
                article_ids.append(faq['id'])

    return article_ids

def get_existing_html_files():
    """获取已存在的HTML文件名（不含扩展名）"""
    html_dir = 'knowledge'
    if not os.path.exists(html_dir):
        return []

    existing_files = []
    for file in os.listdir(html_dir):
        if file.endswith('.html'):
            existing_files.append(file[:-5])  # 移除.html扩展名

    return existing_files

def generate_html_for_article(article_data, output_dir):
    """为单篇文章生成HTML文件"""
    article_id = article_data['id']
    title = article_data['title']
    excerpt = article_data['excerpt']
    date = article_data['date']
    reading_time = article_data['readingTime']
    content = article_data.get('content', '')

    # 生成HTML内容
    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Mobius知识库</title>
    <meta name="description" content="{excerpt}">
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
                    <span class="article-date">{date}</span>
                    <span class="article-reading-time">{reading_time}</span>
                </div>
                <h1 class="article-title">{title}</h1>
                <div class="article-excerpt">
                    <p>{excerpt}</p>
                </div>
            </header>

            <div class="article-content">
                <div class="content-wrapper">
                    {content}
                </div>
            </div>

            <footer class="article-footer">
                <div class="article-tags">
                    {generate_tags(article_data.get('tags', []))}
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

    # 写入HTML文件
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{article_id}.html")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✅ 生成HTML文件: {output_path}")

def generate_tags(tags):
    """生成标签HTML"""
    if not tags:
        return ""

    tag_html = ""
    for tag in tags:
        tag_html += f'<span class="article-tag">{tag}</span>'

    return tag_html

def main():
    print("🚀 开始分析articles.json并生成缺失的HTML文件...")

    # 获取所有文章ID
    article_ids = extract_article_ids()
    print(f"📋 发现 {len(article_ids)} 篇文章")

    # 获取已存在的HTML文件
    existing_files = get_existing_html_files()
    print(f"📁 已存在 {len(existing_files)} 个HTML文件")

    # 找出缺失的文章
    missing_articles = []
    with open('data/articles.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    for category, articles in data['categories'].items():
        for article in articles:
            if article['id'] not in existing_files:
                missing_articles.append(article)

    # 如果有FAQ数据，也检查FAQ中的缺失文件
    if 'faqs' in data:
        for category, faqs in data['faqs'].items():
            for faq in faqs:
                if faq['id'] not in existing_files:
                    missing_articles.append(faq)

    print(f"❌ 缺失 {len(missing_articles)} 个HTML文件")

    # 为缺失的文章生成HTML文件
    if missing_articles:
        print("\n📝 开始生成HTML文件...")
        for article in missing_articles:
            generate_html_for_article(article, 'knowledge')
    else:
        print("✅ 所有HTML文件都已存在！")

if __name__ == "__main__":
    main()