Asked to ChatGPT 5.1 Deep Research(took like 30mins):
Okay, so I'm trying to build a career page site where people recruiters can add and edit pages and candidates can view pages. research about such sites like workable.com/careers/#jobs, jobs.ashbyhq.com/adtucon etc. and tell me about how they are working what are some good industry defaults and what we can change.

Asked to ChatGPT 5.1 Thinking:
So, I will see you guys in a bit. [Pasted Assignment], What are your thoughts on it? The stack will be nextjs, nextauth, S3 and Mongo. 

Asked to ChatGPT 5.1 Thinking:
research about how existing solutions are built, what are flaws in them and how can we improve them to build a better solution. 

-- Trimmed down many things for mvp

IDE: mix of Zed(claude code), Antigravity(gemini 3pro), Cursor (Auto, opus 4.5, codex-5-high), depending on task and complexity

made a simple mvp, added framermotion for animation

copied .cursorrules from a older project

asked opus 4.5 to follow the cursor rules and plan the dashboard

went back and forth with some changes and made a simple MVP. 


seo optimised for
Dynamic title from seoTitle or fallback to "Careers at {company}"
Dynamic description from seoDescription or company description
Job Detail Page (/[companySlug]/jobs/[jobSlug]):
Dynamic description: First 160 chars of job description
Basic Open Graph tags, Favicons setup, Keywords, authors
JSON-LD Structured Data	- Google uses JobPosting schema for rich job results
Open Graph image/url on public pages - Better social sharing
Twitter Card meta tags - Better Twitter sharing
Canonical URLs - Prevents duplicate content
Sitemap generation - Helps crawlers find pages
robots.txt - Basic crawl directives