/**
 * 知乎风格文章互动功能
 * 包含点赞、收藏、评论、分享等功能
 */

class ZhihuArticleInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.initLikeButtons();
        this.initCollectButtons();
        this.initCommentButtons();
        this.initShareButtons();
        this.loadSavedInteractions();
    }

    // 初始化点赞功能
    initLikeButtons() {
        const likeButtons = document.querySelectorAll('.zhihu-like-btn');

        likeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const count = parseInt(this.dataset.count) || 0;
                const isActive = this.classList.contains('active');
                const countSpan = this.querySelector('.zhihu-interaction-count');

                if (isActive) {
                    this.classList.remove('active');
                    this.dataset.count = count - 1;
                    countSpan.textContent = count > 1 ? `${count - 1} 赞同` : '赞同';
                } else {
                    this.classList.add('active');
                    this.dataset.count = count + 1;
                    countSpan.textContent = `${count + 1} 赞同`;
                }

                // 保存到本地存储
                const articleId = this.getArticleId();
                this.saveInteraction('like', articleId, !isActive);
            }.bind(this));
        });
    }

    // 初始化收藏功能
    initCollectButtons() {
        const collectButtons = document.querySelectorAll('.zhihu-collect-btn');

        collectButtons.forEach(button => {
            button.addEventListener('click', function() {
                const count = parseInt(this.dataset.count) || 0;
                const isActive = this.classList.contains('active');
                const countSpan = this.querySelector('.zhihu-interaction-count');

                if (isActive) {
                    this.classList.remove('active');
                    this.dataset.count = count - 1;
                    countSpan.textContent = count > 1 ? `${count - 1} 收藏` : '收藏';
                } else {
                    this.classList.add('active');
                    this.dataset.count = count + 1;
                    countSpan.textContent = `${count + 1} 收藏`;
                }

                // 保存到本地存储
                const articleId = this.getArticleId();
                this.saveInteraction('collect', articleId, !isActive);
            }.bind(this));
        });
    }

    // 初始化评论功能
    initCommentButtons() {
        const commentButtons = document.querySelectorAll('.zhihu-comment-btn');

        commentButtons.forEach(button => {
            button.addEventListener('click', function() {
                const commentCount = parseInt(this.dataset.count) || 0;
                const countSpan = this.querySelector('.zhihu-interaction-count');

                // 如果有评论区域，滚动到评论区域
                const commentsSection = document.querySelector('.zhihu-comments-section');
                if (commentsSection) {
                    commentsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    // 模拟打开评论弹窗
                    this.showCommentModal();
                }

                // 更新评论计数（这里只是示例，实际应该从后端获取）
                if (commentCount === 0) {
                    this.dataset.count = 1;
                    countSpan.textContent = '1 评论';
                }
            }.bind(this));
        });
    }

    // 初始化分享功能
    initShareButtons() {
        const shareButtons = document.querySelectorAll('.zhihu-share-btn');

        shareButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.showShareModal();
            }.bind(this));
        });
    }

    // 显示评论弹窗
    showCommentModal() {
        const modal = document.createElement('div');
        modal.className = 'zhihu-modal-overlay';
        modal.innerHTML = `
            <div class="zhihu-modal">
                <div class="zhihu-modal-header">
                    <h3>发表评论</h3>
                    <button class="zhihu-modal-close">&times;</button>
                </div>
                <div class="zhihu-modal-body">
                    <textarea class="zhihu-comment-input" placeholder="写下你的评论..."></textarea>
                </div>
                <div class="zhihu-modal-footer">
                    <button class="zhihu-btn zhihu-btn-secondary">取消</button>
                    <button class="zhihu-btn zhihu-btn-primary">发表评论</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindModalEvents(modal);
    }

    // 显示分享弹窗
    showShareModal() {
        const modal = document.createElement('div');
        modal.className = 'zhihu-modal-overlay';
        modal.innerHTML = `
            <div class="zhihu-modal zhihu-share-modal">
                <div class="zhihu-modal-header">
                    <h3>分享到</h3>
                    <button class="zhihu-modal-close">&times;</button>
                </div>
                <div class="zhihu-modal-body">
                    <div class="zhihu-share-platforms">
                        <button class="zhihu-share-platform" data-platform="wechat">
                            <i class="fab fa-weixin"></i>
                            <span>微信</span>
                        </button>
                        <button class="zhihu-share-platform" data-platform="weibo">
                            <i class="fab fa-weibo"></i>
                            <span>微博</span>
                        </button>
                        <button class="zhihu-share-platform" data-platform="qq">
                            <i class="fab fa-qq"></i>
                            <span>QQ</span>
                        </button>
                        <button class="zhihu-share-platform" data-platform="link">
                            <i class="fas fa-link"></i>
                            <span>复制链接</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindModalEvents(modal);
        this.initSharePlatforms(modal);
    }

    // 绑定弹窗事件
    bindModalEvents(modal) {
        const closeBtn = modal.querySelector('.zhihu-modal-close');
        const cancelBtn = modal.querySelector('.zhihu-btn-secondary');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // 初始化分享平台按钮
    initSharePlatforms(modal) {
        const platforms = modal.querySelectorAll('.zhihu-share-platform');

        platforms.forEach(platform => {
            platform.addEventListener('click', function() {
                const platformType = this.dataset.platform;
                this.handleShare(platformType);
                modal.remove();
            }.bind(this));
        });
    }

    // 处理分享
    handleShare(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);

        switch (platform) {
            case 'wechat':
                // 微信分享需要显示二维码
                this.showQRCode(window.location.href);
                break;
            case 'weibo':
                window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`);
                break;
            case 'qq':
                window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`);
                break;
            case 'link':
                this.copyToClipboard(window.location.href);
                break;
        }
    }

    // 显示二维码
    showQRCode(url) {
        // 这里应该调用二维码生成API，这里简化处理
        alert(`请使用微信扫描以下链接：\n${url}`);
    }

    // 复制到剪贴板
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('链接已复制到剪贴板');
        }).catch(() => {
            // 降级处理
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('链接已复制到剪贴板');
        });
    }

    // 显示提示信息
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'zhihu-toast';
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2000);
    }

    // 获取文章ID
    getArticleId() {
        // 从URL或其他方式获取文章唯一标识
        const url = window.location.pathname;
        return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
    }

    // 保存互动数据到本地存储
    saveInteraction(type, articleId, isActive) {
        const key = `zhihu_${type}_${articleId}`;
        localStorage.setItem(key, isActive.toString());
    }

    // 加载保存的互动数据
    loadSavedInteractions() {
        const articleId = this.getArticleId();

        // 加载点赞状态
        const likeKey = `zhihu_like_${articleId}`;
        const likeState = localStorage.getItem(likeKey) === 'true';
        if (likeState) {
            const likeBtn = document.querySelector('.zhihu-like-btn');
            if (likeBtn) {
                likeBtn.classList.add('active');
            }
        }

        // 加载收藏状态
        const collectKey = `zhihu_collect_${articleId}`;
        const collectState = localStorage.getItem(collectKey) === 'true';
        if (collectState) {
            const collectBtn = document.querySelector('.zhihu-collect-btn');
            if (collectBtn) {
                collectBtn.classList.add('active');
            }
        }
    }
}

// 当页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new ZhihuArticleInteractions();
});

// 添加必要的CSS样式
const style = document.createElement('style');
style.textContent = `
    .zhihu-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .zhihu-modal {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .zhihu-share-modal {
        max-width: 400px;
    }

    .zhihu-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #EBEEF0;
    }

    .zhihu-modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1A1A1A;
    }

    .zhihu-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #8590A6;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .zhihu-modal-close:hover {
        background: #F6F6F6;
    }

    .zhihu-modal-body {
        padding: 20px;
    }

    .zhihu-modal-footer {
        padding: 20px;
        border-top: 1px solid #EBEEF0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }

    .zhihu-comment-input {
        width: 100%;
        min-height: 100px;
        padding: 12px;
        border: 1px solid #EBEEF0;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
    }

    .zhihu-comment-input:focus {
        outline: none;
        border-color: #0084FF;
    }

    .zhihu-btn {
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
    }

    .zhihu-btn-secondary {
        background: #F6F6F6;
        color: #8590A6;
    }

    .zhihu-btn-secondary:hover {
        background: #E5E5E5;
    }

    .zhihu-btn-primary {
        background: #0084FF;
        color: white;
    }

    .zhihu-btn-primary:hover {
        background: #0077E6;
    }

    .zhihu-share-platforms {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    .zhihu-share-platform {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        border: 1px solid #EBEEF0;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
    }

    .zhihu-share-platform:hover {
        border-color: #0084FF;
        background: #E5F3FF;
    }

    .zhihu-share-platform i {
        font-size: 24px;
        margin-bottom: 8px;
        color: #0084FF;
    }

    .zhihu-share-platform span {
        font-size: 14px;
        color: #1A1A1A;
    }

    .zhihu-toast {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .zhihu-toast.show {
        opacity: 1;
    }
`;

document.head.appendChild(style);