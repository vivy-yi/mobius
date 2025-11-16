# 知识库JSON数据系统

## 概述

知识库页面现在使用JSON文件存储文章数据，实现了内容与代码分离，便于管理和维护。

## 文件结构

```
data/
├── articles.json      # 主要文章数据文件
└── README.md         # 本说明文件
```

## JSON数据结构

### 1. categories (分类数据)

每个分类包含多篇文章，支持以下字段：

```json
{
  "categories": {
    "business": [
      {
        "id": "article-unique-id",
        "title": "文章标题",
        "excerpt": "文章摘要（150字以内）",
        "date": "2024年1月15日",
        "readingTime": "15分钟阅读",
        "views": "1,245",
        "icon": "fas fa-building",
        "tags": ["标签1", "标签2"],
        "url": "knowledge/article-detail.html",
        "featured": true,
        "difficulty": "中级",
        "category": "企业落地"
      }
    ]
  }
}
```

### 2. metadata (元数据)

```json
{
  "metadata": {
    "totalArticles": 10,
    "lastUpdated": "2024-01-30",
    "version": "1.0.0",
    "categories": [
      {
        "id": "business",
        "name": "企业落地",
        "count": 2,
        "icon": "fas fa-building",
        "color": "#3b82f6"
      }
    ]
  }
}
```

## 支持的分类

- `business` - 企业落地
- `visa` - 签证政策
- `tax` - 税务筹划
- `subsidy` - 补助金申请
- `legal` - 法务合规

## 文章字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| id | ✅ | 唯一标识符，用于URL和内部引用 |
| title | ✅ | 文章标题 |
| excerpt | ✅ | 文章摘要，建议150字以内 |
| date | ✅ | 发布日期，格式："YYYY年MM月DD日" |
| readingTime | ✅ | 预计阅读时间 |
| views | ✅ | 浏览次数，格式："数字"或"数字 阅读" |
| icon | ✅ | Font Awesome图标类名 |
| tags | ✅ | 标签数组，至少包含1个标签 |
| url | ✅ | 文章详情页URL，必须以"knowledge/"开头 |
| featured | ❌ | 是否为特色文章（默认false） |
| difficulty | ❌ | 难度级别：初级/中级/高级 |
| category | ❌ | 分类名称（中文） |

## 添加新文章

1. 在对应的分类中添加新文章对象
2. 确保 `id` 字段唯一
3. 更新 `metadata.totalArticles`
4. 更新对应分类的 `count` 字段
5. 创建对应的HTML详情页面

## 技术实现

### ArticleCardManager 类

新的 `ArticleCardManager` 类提供了以下功能：

- **异步数据加载**：从JSON文件动态加载数据
- **降级处理**：JSON加载失败时使用默认数据
- **搜索功能**：支持按标题、摘要、标签搜索
- **加载状态**：显示加载动画和空状态
- **错误处理**：完善的错误处理和日志记录

### 主要方法

```javascript
// 等待数据加载完成
await manager.waitForDataLoad()

// 获取分类统计
const stats = manager.getCategoryStats()

// 增强搜索功能
const results = await manager.searchArticlesEnhanced('关键词')

// 生成文章网格
await manager.generateArticleGrid('business', 'business-articles')
```

## 测试

### 自动化测试

运行自动化测试验证JSON数据结构：

```bash
node test-automated.js
```

### 浏览器测试

访问 `http://localhost:8081/knowledge.html` 查看实际效果。

## 维护指南

### 1. 数据更新

- 修改JSON文件后，刷新浏览器即可看到更新
- 建议定期备份JSON数据文件

### 2. 数据验证

- 使用自动化测试确保数据结构正确
- 检查所有URL是否有效
- 确保图片资源存在

### 3. 性能优化

- JSON文件会自动缓存，浏览器刷新时会重新加载
- 大量文章时考虑实现分页功能

## 故障排除

### JSON加载失败

1. 检查文件路径：`./data/articles.json`
2. 确保JSON格式正确（可使用在线验证工具）
3. 检查HTTP服务器配置（需要CORS支持）

### 文章不显示

1. 检查分类ID是否正确
2. 确认 `metadata.categories` 包含对应分类
3. 检查浏览器控制台错误信息

## 扩展功能建议

- [ ] 添加文章发布状态控制
- [ ] 实现文章排序功能
- [ ] 添加文章作者信息
- [ ] 支持多语言版本
- [ ] 集成CMS系统

---

**最后更新**: 2024年11月16日
**版本**: 1.0.0
**维护者**: Mobius开发团队