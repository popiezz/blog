var pzArticles = [
  { date: 'MAR 14', title: 'On Writing Things Down Before They Disappear', excerpt: 'Most of what I know I forgot twice before it stuck. A short case for keeping a messy running log instead of waiting for a finished thought.', hasImage: true, tags: [{ label: 'Essay', cls: 'pz-tag-a' }, { label: 'Craft', cls: 'pz-tag-b' }] },
  { date: 'FEB 02', title: 'What Freelance Taught Me About Silence', excerpt: 'No inbox pings for a week changes how an idea forms. Some notes from a stretch without meetings.', hasImage: false, tags: [{ label: 'Career', cls: 'pz-tag-b' }] },
  { date: 'JAN 18', title: 'A Short Note on Typewriters and Attention', excerpt: "A machine that can't undo forces a different kind of sentence. Why I still keep one on the desk.", hasImage: true, tags: [{ label: 'Essay', cls: 'pz-tag-a' }] },
  { date: 'DEC 05', title: 'Why I Stopped Optimizing My Mornings', excerpt: 'Routines are supposed to disappear into the day. Mine kept demanding attention instead.', hasImage: false, tags: [{ label: 'Life', cls: 'pz-tag-b' }] },
  { date: 'NOV 22', title: 'Notes From a Slow Year', excerpt: 'A short retrospective on doing less, on purpose, and what it made room for.', hasImage: true, tags: [{ label: 'Essay', cls: 'pz-tag-a' }, { label: 'Life', cls: 'pz-tag-b' }] }
];

function pzRenderJournal(mountId, articles) {
  var mount = document.getElementById(mountId);
  var html = articles.map(function (art) {
    var tags = art.tags.map(function (tag) {
      return '<span class="pz-tag ' + tag.cls + '">' + tag.label + '</span>';
    }).join('');
    var photo = art.hasImage
      ? '<div class="pz-photo"><span class="pz-photo-label">photo</span></div>'
      : '';
    return (
      '<div class="pz-row">' +
        '<div class="pz-row-date-col">' +
          '<span class="pz-date">' + art.date + '</span>' +
          '<div class="pz-dot-line"><div class="pz-dot"></div><div class="pz-line"></div></div>' +
        '</div>' +
        '<div class="pz-row-body">' +
          '<h3 class="pz-title">' + art.title + '</h3>' +
          '<p class="pz-excerpt">' + art.excerpt + '</p>' +
          '<div class="pz-tags">' + tags + '</div>' +
        '</div>' +
        photo +
      '</div>'
    );
  }).join('');
  mount.innerHTML = html;
}
