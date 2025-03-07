const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { period = '1d' } = ctx.params;

    const response = await got({
        url: 'https://yande.re/post/popular_recent.json',
        params: {
            period,
        },
    });

    const posts = response.data;

    const titles = {
        '1d': 'Last 24 hours',
        '1w': 'Last week',
        '1m': 'Last month',
        '1y': 'Last year',
    };

    const mime = {
        jpg: 'jpeg',
        png: 'png',
    };

    const title = titles[period];

    ctx.state.data = {
        title: `${title} - yande.re`,
        link: `https://yande.re/post/popular_recent?period=${period}`,
        item: posts.map((post) => ({
            title: `${post.tags} Rating:${post.rating} Score:${post.score}`,
            id: `${ctx.path}#${post.id}`,
            guid: `${ctx.path}#${post.id}`,
            link: `https://yande.re/post/show/${post.id}`,
            author: post.author,
            pubDate: new Date(post.created_at * 1e3).toUTCString(),
            description: (() => {
                const result = [`<img referrerpolicy="no-referrer" src="${post.sample_url}" />`];
                result.push(`<p>Rating:${post.rating}</p> <p>Score:${post.score}</p>`);
                if (post.source) {
                    result.push(`<a href="${post.source}">Source</a>`);
                }
                if (post.parent_id) {
                    result.push(`<a href="https://yande.re/post/show/${post.parent_id}">Parent</a>`);
                }
                return result.join('');
            })(),
            enclosure_url: post.file_url,
            enclosure_type: `image/${mime[post.file_ext]}`,
            category: post.tags.split(/\s+/),
        })),
    };
};
