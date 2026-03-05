import type { Route } from '@/types';
import { ViewType } from '@/types';
import cacheModule from '@/utils/cache/index';
import logger from '@/utils/logger';

import api from '../twitter/api';
import utils from '../twitter/utils';
import { getAllAccounts } from './twitter-accounts';

// 缓存有效期 30 分钟（秒）
const CACHE_TTL = 30 * 60;

export const route: Route = {
    path: '/twitter/all',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/my/twitter/all',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'TWITTER_AUTH_TOKEN',
                description: 'Twitter auth_token cookie',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Aggregated Twitter Feed',
    maintainers: ['hellolingan'],
    handler,
};

async function handler(ctx) {
    const accounts = getAllAccounts();
    const cacheKey = 'my:twitter:all';

    // 尝试从缓存读取（缓存存储为 JSON 字符串）
    const cached = await cacheModule.tryGet(
        cacheKey,
        async () => {
            await api.init();

            // 并发请求所有账号，使用 allSettled 避免单个失败影响整体
            const results = await Promise.allSettled(
                accounts.map(async (username) => {
                    try {
                        const userInfo = await api.getUser(username);
                        const data = await api.getUserTweets(username, {});
                        if (!data || !userInfo) {
                            return [];
                        }
                        const items = utils.ProcessFeed(ctx, { data });
                        return (items || []).map((item: Record<string, any>) => ({
                            ...item,
                            _source: username,
                        }));
                    } catch (error) {
                        logger.warn(`Failed to fetch tweets for @${username}: ${error}`);
                        return [];
                    }
                })
            );

            const allItems = results.filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled').flatMap((r) => r.value);

            // 按发布时间倒序排列
            allItems.sort((a, b) => {
                const dateA = new Date(a.pubDate || 0).getTime();
                const dateB = new Date(b.pubDate || 0).getTime();
                return dateB - dateA;
            });

            return JSON.stringify(allItems);
        },
        CACHE_TTL
    );

    const items = typeof cached === 'string' ? JSON.parse(cached) : cached;

    // 在每条内容前添加博主名称
    const enrichedItems = (items as Array<Record<string, any>>).map((item) => {
        const authorName = Array.isArray(item.author) ? item.author[0]?.name : item.author;
        if (authorName && item.description) {
            item.description = `<p><strong>📢 ${authorName} (@${item._source})</strong></p>${item.description}`;
        }
        return item;
    });

    return {
        title: '50+ 全球顶尖 KOL 的 X 动态聚合',
        link: 'https://x.com',
        description: '聚合 AI、科技、投资、Web3、地缘政治、开发者、跨境电商等领域的顶尖 KOL 动态',
        item: enrichedItems,
        allowEmpty: true,
    };
}
