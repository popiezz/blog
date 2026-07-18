var PZ_REPO = { owner: 'popiezz', repo: 'blog', branch: 'main' };

function pzSlugFromFilename(name) {
  return name.replace(/\.md$/i, '');
}

function pzParseFrontmatter(raw) {
  var trimmed = raw.replace(/^﻿/, '').replace(/^\s+/, '');
  var match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(trimmed);
  if (!match) return { meta: {}, body: raw };
  var meta = {};
  match[1].split('\n').forEach(function (line) {
    var m = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!m) return;
    var key = m[1];
    var val = m[2].trim();
    if (/^\[.*\]$/.test(val)) {
      val = val.slice(1, -1).split(',').map(function (s) {
        return s.trim().replace(/^["']|["']$/g, '');
      }).filter(Boolean);
    } else if (/^["'].*["']$/.test(val)) {
      val = val.slice(1, -1);
    } else if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }
    meta[key] = val;
  });
  return { meta: meta, body: match[2].trim() };
}

function pzTags(meta) {
  var raw = meta.tags != null ? meta.tags : meta.tag;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') return raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  return [];
}

function pzTagClass(tag) {
  var h = 0;
  for (var i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return h % 2 === 0 ? 'pz-tag-a' : 'pz-tag-b';
}

var PZ_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function pzFormatDate(dateStr, withYear) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return dateStr;
  var m = PZ_MONTHS[d.getUTCMonth()];
  var day = String(d.getUTCDate()).padStart(2, '0');
  return withYear ? (m + ' ' + day + ', ' + d.getUTCFullYear()) : (m + ' ' + day);
}

function pzExcerpt(body, len) {
  len = len || 160;
  var text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[>*_`#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > len ? text.slice(0, len).replace(/\s+\S*$/, '') + '…' : text;
}

function pzEscapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pzInline(text) {
  text = pzEscapeHtml(text);
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return text;
}

function pzMarkdownToHtml(md) {
  var lines = md.replace(/\r\n/g, '\n').split('\n');
  var html = '';
  var inCode = false, codeBuf = [];
  var listType = null, listBuf = [];
  var para = [];

  function flushPara() {
    if (para.length) { html += '<p>' + pzInline(para.join(' ')) + '</p>\n'; para = []; }
  }
  function flushList() {
    if (listType) {
      html += '<' + listType + '>' + listBuf.map(function (li) { return '<li>' + pzInline(li) + '</li>'; }).join('') + '</' + listType + '>\n';
      listType = null; listBuf = [];
    }
  }

  lines.forEach(function (line) {
    if (/^```/.test(line)) {
      if (inCode) {
        html += '<pre><code>' + codeBuf.join('\n') + '</code></pre>\n';
        codeBuf = []; inCode = false;
      } else {
        flushPara(); flushList(); inCode = true;
      }
      return;
    }
    if (inCode) { codeBuf.push(pzEscapeHtml(line)); return; }

    var h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushPara(); flushList();
      html += '<h' + h[1].length + '>' + pzInline(h[2]) + '</h' + h[1].length + '>\n';
      return;
    }

    var bq = /^>\s?(.*)$/.exec(line);
    if (bq) { flushPara(); flushList(); html += '<blockquote>' + pzInline(bq[1]) + '</blockquote>\n'; return; }

    var ul = /^[-*]\s+(.*)$/.exec(line);
    var ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara();
      var type = ul ? 'ul' : 'ol';
      if (listType && listType !== type) flushList();
      listType = type;
      listBuf.push((ul || ol)[1]);
      return;
    }
    flushList();

    if (line.trim() === '') { flushPara(); return; }
    para.push(line.trim());
  });
  flushPara(); flushList();
  if (inCode) html += '<pre><code>' + codeBuf.join('\n') + '</code></pre>\n';
  return html;
}

function pzPostFromRaw(slug, raw) {
  var parsed = pzParseFrontmatter(raw);
  var meta = parsed.meta, body = parsed.body;
  return {
    slug: slug,
    title: meta.title || slug,
    date: meta.date || '',
    tags: pzTags(meta).map(function (label) { return { label: label, cls: pzTagClass(label) }; }),
    hasImage: meta.image === true || meta.image === 'true',
    excerpt: meta.excerpt || pzExcerpt(body),
    body: body
  };
}

async function pzFetchPosts() {
  var listUrl = 'https://api.github.com/repos/' + PZ_REPO.owner + '/' + PZ_REPO.repo + '/contents/posts?ref=' + PZ_REPO.branch;
  var listRes = await fetch(listUrl, { headers: { Accept: 'application/vnd.github.v3+json' } });
  if (listRes.status === 404) return [];
  if (!listRes.ok) throw new Error('Could not list posts (' + listRes.status + ')');
  var entries = await listRes.json();
  var files = entries.filter(function (f) { return f.type === 'file' && /\.md$/i.test(f.name); });

  var posts = await Promise.all(files.map(async function (f) {
    var res = await fetch(f.download_url);
    var raw = await res.text();
    return pzPostFromRaw(pzSlugFromFilename(f.name), raw);
  }));

  posts.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  return posts;
}

async function pzFetchPost(slug) {
  var url = 'https://raw.githubusercontent.com/' + PZ_REPO.owner + '/' + PZ_REPO.repo + '/' + PZ_REPO.branch + '/posts/' + encodeURIComponent(slug) + '.md';
  var res = await fetch(url);
  if (!res.ok) throw new Error('Post not found');
  var raw = await res.text();
  return pzPostFromRaw(slug, raw);
}
