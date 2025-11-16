#!/usr/bin/env python3
import json
import os
import shutil

def create_id_mapping():
    """创建当前混乱ID到标准化ID的映射表"""
    return {
        # Business类别
        "japan-company-registration-2024": "business-article-company-registration",
        "japan-business-setup-guide": "business-article-setup-guide",
        "business-faq-001": "business-faq-restaurant",
        "business-faq-002": "business-faq-beauty-salon",

        # Visa类别
        "japan-visa-guide-2024": "visa-article-management-guide",
        "japan-high-talent-visa": "visa-article-talent-points",
        "visa-faq-001": "visa-faq-renewal",

        # Tax类别
        "japan-tax-guide-2024": "tax-article-declaration-guide",
        "japan-consumption-tax": "tax-article-consumption-tax",
        "tax-faq-001": "tax-faq-registration",
        "tax-faq-002": "tax-faq-subsidy-application",

        # Subsidy类别
        "japan-it-subsidy-2024": "subsidy-article-it-digital",
        "japan-green-subsidy": "subsidy-article-green-environmental",
        "subsidy-faq-001": "subsidy-faq-success-tips",

        # Legal类别
        "japan-labor-law-guide-2024": "legal-article-labor-law",
        "japan-personal-data-protection": "legal-article-data-protection",
        "legal-faq-001": "legal-faq-contract",
        "legal-faq-002": "legal-faq-ip-protection",

        # Life类别
        "japan-banking-guide": "life-article-banking",
        "japan-housing-guide": "life-article-housing",
        "life-faq-001": "life-faq-banking-account"
    }

def load_articles_json():
    """加载articles.json文件"""
    with open('data/articles.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_articles_json(data):
    """保存articles.json文件"""
    with open('data/articles.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_articles_ids(data, id_mapping):
    """更新articles.json中的所有ID引用"""
    # 更新categories中的文章ID
    for category, articles in data['categories'].items():
        for article in articles:
            old_id = article['id']
            if old_id in id_mapping:
                new_id = id_mapping[old_id]
                article['id'] = new_id

                # 更新URL字段
                if 'url' in article:
                    old_url = article['url']
                    if old_url.startswith('knowledge/'):
                        new_url = f"knowledge/{new_id}.html"
                        article['url'] = new_url
                    elif old_url.startswith('../services/'):
                        # FAQ类文章保持原URL，因为它们链接到服务页面
                        pass

    # 更新metadata中的hotContent引用
    if 'hotContent' in data['metadata']:
        for hot_item in data['metadata']['hotContent']:
            old_id = hot_item['id']
            if old_id in id_mapping:
                hot_item['id'] = id_mapping[old_id]

    return data

def rename_html_files(id_mapping):
    """重命名HTML文件以匹配新的ID"""
    knowledge_dir = 'knowledge'
    if not os.path.exists(knowledge_dir):
        print(f"❌ 目录 {knowledge_dir} 不存在")
        return

    renamed_count = 0

    for old_id, new_id in id_mapping.items():
        old_file = os.path.join(knowledge_dir, f"{old_id}.html")
        new_file = os.path.join(knowledge_dir, f"{new_id}.html")

        if os.path.exists(old_file):
            # 更新HTML文件内容中的ID引用
            with open(old_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 更新HTML文件中的ID引用（如果有的话）
            content = content.replace(f'data-id="{old_id}"', f'data-id="{new_id}"')

            # 写入新文件
            with open(new_file, 'w', encoding='utf-8') as f:
                f.write(content)

            # 删除旧文件
            os.remove(old_file)

            print(f"✅ 重命名: {old_id}.html -> {new_id}.html")
            renamed_count += 1
        else:
            print(f"⚠️  文件不存在: {old_file}")

    print(f"📊 总共重命名了 {renamed_count} 个HTML文件")

def verify_integrity(data, id_mapping):
    """验证重构后的完整性"""
    print("\n🔍 验证重构完整性...")

    issues = []

    # 检查categories中的所有文章
    for category, articles in data['categories'].items():
        for article in articles:
            new_id = article['id']

            # 检查URL是否正确
            if 'url' in article:
                url = article['url']
                if url.startswith('knowledge/'):
                    expected_filename = url.split('/')[-1]
                    if expected_filename != f"{new_id}.html":
                        issues.append(f"URL不匹配: ID {new_id} -> URL {url}")

                    # 检查HTML文件是否存在
                    file_path = url
                    if not os.path.exists(file_path):
                        issues.append(f"HTML文件不存在: {file_path}")

    # 检查hotContent引用
    if 'hotContent' in data['metadata']:
        for hot_item in data['metadata']['hotContent']:
            hot_id = hot_item['id']
            found = False
            for category, articles in data['categories'].items():
                for article in articles:
                    if article['id'] == hot_id:
                        found = True
                        break
                if found:
                    break
            if not found:
                issues.append(f"hotContent引用的文章不存在: {hot_id}")

    if issues:
        print("❌ 发现以下问题:")
        for issue in issues:
            print(f"   - {issue}")
        return False
    else:
        print("✅ 重构完整性验证通过!")
        return True

def main():
    print("🚀 开始标准化articles.json的ID结构...")

    # 创建ID映射表
    id_mapping = create_id_mapping()
    print(f"📋 ID映射表包含 {len(id_mapping)} 个条目")

    # 加载articles.json
    print("📂 加载articles.json...")
    data = load_articles_json()

    # 更新文章ID
    print("🔄 更新文章ID...")
    data = update_articles_ids(data, id_mapping)

    # 保存更新后的articles.json
    print("💾 保存更新后的articles.json...")
    save_articles_json(data)

    # 重命名HTML文件
    print("📁 重命名HTML文件...")
    rename_html_files(id_mapping)

    # 验证完整性
    success = verify_integrity(data, id_mapping)

    if success:
        print("\n🎉 ID标准化重构完成!")
        print("📊 重构摘要:")
        print(f"   - 更新了 {len(id_mapping)} 个文章ID")
        print("   - 所有HTML文件已重命名")
        print("   - articles.json已更新")
        print("   - 完整性验证通过")
    else:
        print("\n⚠️  重构过程中发现问题，请检查上述错误信息")

if __name__ == "__main__":
    main()