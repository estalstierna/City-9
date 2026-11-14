/* QUALITY OF LIFE — things that help the player keep track, without changing the story.
   - "Current orders" at the top of the dossier: where each open chapter stands, the next
     promotion and what blocks it, board retries, strikes, transfer refusals.
   - A one-line summary of the day's visible changes in the evening.
   - The morning baseline that the summary and the contact arrows (▲▼) compare against. */
(function () {
  const CH_MAX = 12;
  const sign = (n) => (n > 0 ? '+' + n : '−' + Math.abs(n));

  /* the day's baseline: taken from the first scene shown on a new day */
  G.afterRender.push(() => {
    const s = G.state();
    if (!s || s.phase !== 'union') return;
    s.mem = s.mem || {};
    if (s.mem.baseDay === s.day) return;
    s.mem.baseDay = s.day;
    s.mem.dayBase = { merit: s.merit, lp: s.lp, tokens: s.tokens, hp: s.hp, rel: Object.assign({}, s.rel) };
  });

  G.extend('u_evening', {
    text: (lines, s) => {
      const b = s.mem && s.mem.dayBase;
      if (!b || s.mem.baseDay !== s.day) return lines;
      const parts = [
        ['Merit', s.merit - b.merit],
        ['Loyalty', s.lp - b.lp],
        ['Tokens', s.tokens - b.tokens],
        ['Health', s.hp - b.hp],
      ]
        .filter(([, d]) => d)
        .map(([k, d]) => `${k} ${sign(d)}`);
      const rel = Object.keys(s.rel)
        .filter((k) => b.rel[k] !== undefined && Math.abs(s.rel[k] - b.rel[k]) >= 5 && G.PEOPLE[k])
        .map((k) => `${G.PEOPLE[k].name.replace(/"/g, '')} ${s.rel[k] > b.rel[k] ? '▲' : '▼'}`);
      if (!parts.length && !rel.length) return lines;
      return lines.concat([`@sys DAY ${s.day}: ${parts.concat(rel).join(' · ')}`]);
    },
  });

  /* ------------------------------------------------------------ orders */
  const chapterLine = (s) => {
    for (let n = 2; n <= CH_MAX; n++) {
      const c = s['c' + n];
      if (c && !c.done && c.stage !== undefined && n > 2) {
        const when = c.next > s.day ? `next on day ${c.next}` : 'continues today';
        return `<div class="kv"><span>Chapter ${G.chapterWord ? G.chapterWord(n) : n}</span><b>${when}</b></div>`;
      }
      const prev = s['c' + (n - 1)];
      if (!c && n > 3 && prev && prev.done && G.scenes['c' + n + '_start']) {
        const day = (prev.endDay !== undefined ? prev.endDay : s.day) + 2;
        return `<div class="kv"><span>Chapter ${G.chapterWord ? G.chapterWord(n) : n}</span><b>${day > s.day ? 'begins day ' + day : 'begins soon'}</b></div>`;
      }
    }
    return '';
  };

  const promoLine = (s) => {
    const p = G.PROMO[s.rank];
    if (!p) return '';
    if (p.if && !p.if(s)) return `<div class="kv"><span>Next grade: ${p.next}</span><b>locked</b></div><div class="sub">${p.gate || 'Requirements not met yet.'}</div>`;
    const lines = [];
    if (s.pb && s.pb.retry > s.day) lines.push(`Board retry from day ${s.pb.retry}`);
    if (s.disc && s.disc.probation > s.day) lines.push(`Probation until day ${s.disc.probation}`);
    const left = p.merit - s.merit;
    return `<div class="kv"><span>Next grade: ${p.next}</span><b>${left > 0 ? left + ' merit to go' : 'ready'}</b></div>${lines.length ? `<div class="sub">${lines.join(' · ')}</div>` : ''}`;
  };

  const discLine = (s) => {
    const d = s.disc;
    if (!d || (!d.w && !d.final)) return '';
    const exp = d.w ? ` · next strike expires day ${d.last + 6}` : '';
    return `<div class="kv"><span>Record</span><b class="warn">${d.final ? 'Final warning' : d.w + ' strike' + (d.w > 1 ? 's' : '')}</b></div><div class="sub">Clean days remove strikes${exp}.</div>`;
  };

  const xferLine = (s) => {
    const blocked = Object.keys(s.flags || {})
      .filter((k) => k.startsWith('xfer_block_') && s.flags[k] > s.day)
      .map((k) => `${k.slice(11)} (day ${s.flags[k]})`);
    return blocked.length ? `<div class="kv"><span>Transfer refused</span><b>${blocked.length}</b></div><div class="sub">May reapply: ${blocked.join(', ')}</div>` : '';
  };

  G.sideTop = G.sideTop || [];
  G.sideTop.push((s) => {
    if (s.phase !== 'union') return '';
    const body = chapterLine(s) + promoLine(s) + discLine(s) + xferLine(s);
    return body ? `<section class="orders"><h3>Current orders</h3>${body}</section>` : '';
  });
})();
