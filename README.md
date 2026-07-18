# Popiezz Blog

A small static journal. Home page lists entries with a category sidebar; About is a short bio page. No build step — the site reads posts straight from this repo at request time.

## Writing a new post

Add a markdown file to `posts/`, named after the post's slug, e.g.:

```
posts/on-writing-things-down.md
```

Start it with frontmatter, then the post body in markdown:

```markdown
---
title: On Writing Things Down Before They Disappear
date: 2026-03-14
tags: [Essay, Craft]
image: true
---

Most of what I know I forgot twice before it stuck...
```

Frontmatter fields:

- `title` — required.
- `date` — required, `YYYY-MM-DD`. Shown automatically under the title on the post page, and next to the entry on the home page.
- `tags` — comma-separated or `[Bracketed, List]`. Each tag becomes (or joins) a category in the sidebar automatically. Remove a tag from every post and its category disappears on its own — nothing else to update.
- `image` — optional, set to `true` to show the photo placeholder on the home page row.
- `excerpt` — optional. If left out, one is generated automatically from the first bit of the post body.

Commit and push the `.md` file to `main` — the site picks it up on the next page load, no build or deploy step required.

To remove a post, delete its markdown file and push.
