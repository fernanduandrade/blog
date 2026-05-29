import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const posts = await serverQueryContent(event, '/pt/blog')
    .sort({ date: -1 })
    .find()

  const baseUrl = 'https://fernandoandrade.dev'

  const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description || ''}]]></description>
      <link>${baseUrl}${post._path?.replace('/pt', '')}</link>
      <guid>${baseUrl}${post._path?.replace('/pt', '')}</guid>
      <pubDate>${new Date(post.date || Date.now()).toUTCString()}</pubDate>
    </item>
  `).join('')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Fernando Andrade — Blog</title>
    <description>Software Engineer from Brazil. Writing about software, productivity and systems.</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return feed
})
