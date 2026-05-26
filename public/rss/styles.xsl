<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="rss/channel/title"/> — RSS Feed</title>
        <style>
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          :root{--bg:#0f172a;--surface:#1e293b;--border:#334155;--text:#e2e8f0;--muted:#94a3b8;--accent:#38bdf8;--accent-hover:#7dd3fc;--green:#4ade80;--radius:12px}
          body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;min-height:100vh}
          a{color:var(--accent);text-decoration:none;transition:color .2s}
          a:hover{color:var(--accent-hover)}
          .container{max-width:820px;margin:0 auto;padding:2rem 1.5rem}
          header{background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-bottom:1px solid var(--border);padding:3rem 0}
          header .container{display:flex;flex-direction:column;gap:.75rem}
          h1{font-size:2rem;font-weight:700;letter-spacing:-.025em}
          .description{color:var(--muted);font-size:1.05rem;max-width:600px}
          .meta{display:flex;gap:1.5rem;flex-wrap:wrap;margin-top:.5rem}
          .meta span{font-size:.875rem;color:var(--muted);display:flex;align-items:center;gap:.35rem}
          .meta span::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green)}
          .badge{display:inline-block;background:var(--accent);color:var(--bg);font-size:.75rem;font-weight:600;padding:.2rem .6rem;border-radius:999px;letter-spacing:.025em}
          .feed-info{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem 1.5rem;margin-bottom:2rem}
          .feed-info p{color:var(--muted);font-size:.9rem}
          .feed-info code{background:#334155;padding:.15rem .45rem;border-radius:4px;font-size:.85rem;color:var(--accent)}
          .items{display:flex;flex-direction:column;gap:1rem}
          .item{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem 1.5rem;transition:border-color .2s,transform .15s}
          .item:hover{border-color:var(--accent);transform:translateY(-2px)}
          .item h2{font-size:1.1rem;font-weight:600;margin-bottom:.5rem}
          .item .desc{color:var(--muted);font-size:.9rem;margin-bottom:.75rem}
          .item .date{font-size:.8rem;color:var(--muted)}
          .copy-btn{background:var(--accent);color:var(--bg);border:none;padding:.5rem 1rem;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;transition:background .2s}
          .copy-btn:hover{background:var(--accent-hover)}
          .copy-btn:active{transform:scale(.97)}
          footer{text-align:center;padding:2rem 0;color:var(--muted);font-size:.8rem;border-top:1px solid var(--border);margin-top:3rem}
          @media(max-width:640px){.container{padding:1.25rem 1rem}h1{font-size:1.5rem}header{padding:2rem 0}}
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <span class="badge">RSS FEED</span>
            <h1><xsl:value-of select="rss/channel/title"/></h1>
            <p class="description"><xsl:value-of select="rss/channel/description"/></p>
            <div class="meta">
              <span><xsl:value-of select="count(rss/channel/item)"/> articles</span>
              <span>Updated <xsl:value-of select="rss/channel/item[1]/pubDate"/></span>
            </div>
          </div>
        </header>
        <main class="container">
          <div class="feed-info">
            <p>
              This is an RSS feed. Subscribe by copying this URL into your feed reader:
              <code><xsl:value-of select="rss/channel/link"/>rss.xml</code>
              <button class="copy-btn" style="margin-left:.75rem" onclick="var t=this,orig=t.textContent,url=t.getAttribute('data-url'),done=function(){t.textContent='Copied!';setTimeout(function(){t.textContent=orig},2000)};if(navigator.clipboard){navigator.clipboard.writeText(url).then(done)}else{var ta=document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);done()}" data-url="https://blog.oriz.in/rss.xml">Copy URL</button>
            </p>
          </div>
          <div class="items">
            <xsl:for-each select="rss/channel/item">
              <article class="item">
                <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
                <p class="desc"><xsl:value-of select="description"/></p>
                <span class="date"><xsl:value-of select="pubDate"/></span>
              </article>
            </xsl:for-each>
          </div>
        </main>
        <footer>
          <p>Generated by <xsl:value-of select="rss/channel/title"/> — <a href="{rss/channel/link}"><xsl:value-of select="rss/channel/link"/></a></p>
        </footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
