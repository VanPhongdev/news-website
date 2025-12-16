require('dotenv').config();
const Parser = require('rss-parser');
const mongoose = require('mongoose');
const Article = require('../models/Article');
const Category = require('../models/Category');
const User = require('../models/User');

const parser = new Parser();

// Mapping RSS feeds với categories trong database
const RSS_FEEDS = [
    {
        url: 'https://vnexpress.net/rss/thoi-su.rss',
        categorySlug: 'chinh-tri',
        source: 'VnExpress'
    },
    {
        url: 'https://vnexpress.net/rss/kinh-doanh.rss',
        categorySlug: 'kinh-te',
        source: 'VnExpress'
    },
    {
        url: 'https://vnexpress.net/rss/the-thao.rss',
        categorySlug: 'the-thao',
        source: 'VnExpress'
    },
    {
        url: 'https://vnexpress.net/rss/giai-tri.rss',
        categorySlug: 'giai-tri',
        source: 'VnExpress'
    },
    {
        url: 'https://vnexpress.net/rss/phap-luat.rss',
        categorySlug: 'phap-luat',
        source: 'VnExpress'
    },
    {
        url: 'https://vnexpress.net/rss/suc-khoe.rss',
        categorySlug: 'suc-khoe',
        source: 'VnExpress'
    },
    {
        url: 'https://vnexpress.net/rss/khoa-hoc.rss',
        categorySlug: 'khoa-hoc-cong-nghe',
        source: 'VnExpress'
    },
    {
        url: 'https://vnexpress.net/rss/gia-dinh.rss',
        categorySlug: 'doi-song-xa-hoi',
        source: 'VnExpress'
    },
    {
        url: 'https://vnexpress.net/rss/giao-duc.rss',
        categorySlug: 'giao-duc',
        source: 'VnExpress'
    }
];

// Hàm lấy tất cả authors
async function getAuthors() {
    const authors = await User.find({ role: 'author' });

    if (authors.length === 0) {
        console.log('⚠️  Không tìm thấy author nào, tạo rss-bot...');
        const rssBot = await User.create({
            username: 'rss-bot',
            email: 'rss-bot@tintuc24h.com',
            password: 'rss-bot-password-' + Date.now(),
            role: 'author'
        });
        return [rssBot];
    }

    return authors;
}

// Hàm chọn random author
function getRandomAuthor(authors) {
    return authors[Math.floor(Math.random() * authors.length)];
}

// Hàm tạo slug từ tiêu đề
function createSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Hàm lấy excerpt từ content
function getExcerpt(content, maxLength = 200) {
    if (!content) return '';

    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');

    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength).trim() + '...';
}

// Hàm fetch tin từ một RSS feed
async function fetchFeed(feedConfig, authors, categories) {
    try {
        console.log(`\n📡 Đang fetch: ${feedConfig.source} - ${feedConfig.categorySlug}...`);

        const feed = await parser.parseURL(feedConfig.url);
        const category = categories.find(c => c.slug === feedConfig.categorySlug);

        if (!category) {
            console.log(`⚠️  Không tìm thấy category: ${feedConfig.categorySlug}`);
            return { success: 0, skipped: 0, failed: 0 };
        }

        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        console.log(`   Tìm thấy ${feed.items.length} bài viết`);

        const TARGET_NEW_ARTICLES = 5; // Mục tiêu: lấy 5 bài mới
        const MAX_ITEMS_TO_CHECK = 20; // Tối đa kiểm tra 20 bài

        // Duyệt qua các bài cho đến khi đủ số lượng hoặc hết bài
        for (let i = 0; i < Math.min(feed.items.length, MAX_ITEMS_TO_CHECK); i++) {
            // Dừng nếu đã đủ số bài mới
            if (successCount >= TARGET_NEW_ARTICLES) {
                break;
            }

            const item = feed.items[i];

            try {
                const slug = createSlug(item.title);

                // Kiểm tra bài viết đã tồn tại chưa (check theo title để tránh trùng)
                const existing = await Article.findOne({ title: item.title });
                if (existing) {
                    skippedCount++;
                    continue;
                }

                // Random chọn author
                const randomAuthor = getRandomAuthor(authors);

                // Tạo bài viết mới
                const articleData = {
                    title: item.title,
                    slug: slug,
                    content: item.content || item.contentSnippet || item.description || '',
                    excerpt: getExcerpt(item.contentSnippet || item.description),
                    thumbnail: item.enclosure?.url || '',
                    category: category._id,
                    author: randomAuthor._id,
                    status: 'published', // Tự động publish
                    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                    views: 0
                };

                await Article.create(articleData);
                successCount++;
                console.log(`   ✅ Đã lưu: ${item.title.substring(0, 50)}...`);

            } catch (error) {
                failedCount++;
                console.log(`   ❌ Lỗi: ${error.message}`);
            }
        }

        return { success: successCount, skipped: skippedCount, failed: failedCount };

    } catch (error) {
        console.log(`❌ Lỗi fetch feed ${feedConfig.source}: ${error.message}`);
        return { success: 0, skipped: 0, failed: 0 };
    }
}

// Hàm chính
async function fetchAllNews() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Đã kết nối MongoDB\n');

        // Lấy authors và categories
        const authors = await getAuthors();
        const categories = await Category.find();

        console.log(`� Authors: ${authors.length} tác giả (${authors.map(a => a.username).join(', ')})`);
        console.log(`📁 Categories: ${categories.length} chuyên mục\n`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        let totalSuccess = 0;
        let totalSkipped = 0;
        let totalFailed = 0;

        // Fetch từng feed
        for (const feedConfig of RSS_FEEDS) {
            const result = await fetchFeed(feedConfig, authors, categories);
            totalSuccess += result.success;
            totalSkipped += result.skipped;
            totalFailed += result.failed;

            // Delay giữa các requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 KẾT QUẢ:');
        console.log(`   ✅ Thành công: ${totalSuccess} bài`);
        console.log(`   ⏭️  Đã tồn tại: ${totalSkipped} bài`);
        console.log(`   ❌ Thất bại: ${totalFailed} bài`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

// Chạy script
fetchAllNews();
