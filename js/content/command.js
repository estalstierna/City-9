/* COMMAND — the command map (chapter 8 onward). Each morning while you hold a command, you give
   three teams an order on the city map before you go to the duty board:
   - PATROL: order up, resentment up a little;
   - RAID: order up a lot, resentment up a lot, arrests, and the team tires;
   - PROTECT: order up a little, resentment down — standing in a stairwell so nobody gets hurt;
   - REST: the team recovers.
   In the evening the orders play out. Districts nobody covered drift: order slips, resentment
   rises, and where it boils over there is an incident. Teams tire; a spent team must rest, and a
   tired team on a raid can come back short.
   D5 uses the five blocks of District 5 (s.dist). The other districts keep their own order and
   resentment in s.cmd.d. The city map colours each zone from it and names the team posted there.
   s.cmd.on switches it on; the chapter decides when. G.cmdScore(s) gives the day's verdict. */
(function () {
  const pick = G.pick;
  const DISTS = [
    { k: 'd1', code: 'D1', name: 'The Nexus' },
    { k: 'd2', code: 'D2', name: 'The Works' },
    { k: 'd3', code: 'D3', name: 'Canal Quarter' },
    { k: 'd4', code: 'D4', name: 'Rail Yards' },
    { k: 'd5', code: 'D5', name: 'The Stacks' },
    { k: 'd7', code: 'D7', name: 'Upper Town' },
  ];
  const ORDERS = {
    patrol: { name: 'Patrol', o: 6, r: 2, fat: 1 },
    raid: { name: 'Raid', o: 10, r: 8, fat: 2 },
    protect: { name: 'Protect', o: 3, r: -6, fat: 1 },
    rest: { name: 'Rest', o: 0, r: 0, fat: -3 },
    contain: { name: 'Contain', o: 2, r: 4, fat: 2, inf: true },
  };
  G.CMD_DISTS = DISTS;
  G.CMD_ORDERS = ORDERS;
  /* OUTBREAK MODE (chapter 9): s.cmd.inf holds infection 0–100 per district. Orders push it down
     (contain most, at a cost); uncovered districts grow; districts at 40+ seed their neighbours;
     at 60+ there are blooms. The verdict counts infection as well as order. */
  const NEXT = { d4: ['d3'], d3: ['d4', 'd2', 'd5'], d2: ['d3', 'd1'], d1: ['d2', 'd5'], d5: ['d1', 'd3', 'd7'], d7: ['d5'] };
  const CUT = { patrol: 3, raid: 5, protect: 2, contain: 11 };
  const orderList = (s) => Object.keys(ORDERS).filter((o) => !ORDERS[o].inf || (s.cmd && s.cmd.inf));
  G.cmdInf = (s, k) => (s.cmd && s.cmd.inf ? Math.round(s.cmd.inf[k] || 0) : 0);
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const nameOf = (k) => (DISTS.find((d) => d.k === k) || {}).name || k;
  const colour = (b) => (b.o < 35 || b.r >= 75 ? 'red' : b.o < 50 || b.r >= 55 ? 'amber' : 'green');

  /* District 5 is the average of its five blocks */
  const d5 = (s) => {
    const ks = Object.keys(s.dist || {});
    if (!ks.length) return { o: 55, r: 30 };
    return { o: Math.round(ks.reduce((a, k) => a + s.dist[k].o, 0) / ks.length), r: Math.round(ks.reduce((a, k) => a + s.dist[k].r, 0) / ks.length) };
  };
  const D = (s, k) => (k === 'd5' ? d5(s) : s.cmd.d[k]);
  const bump = (s, k, o, r) => {
    if (k === 'd5') return Object.keys(s.dist || {}).forEach((b) => G.distFx(s, b, Math.round(o / 2), Math.round(r / 2)));
    const x = s.cmd.d[k];
    x.o = clamp(x.o + o);
    x.r = clamp(x.r + r);
  };

  G.cmdStart = (s, opts) => {
    G.worldEnsure && G.worldEnsure(s);
    const sq = s.squad && s.squad.formed && G.squadActive ? G.squadActive(s) : [];
    const lead = (i) => (sq[i] ? sq[i].name : pick(['"Ash"', '"Pike"', '"Mortar"', '"Slate"', '"Tallow"', '"Rivet"']));
    const unrest = s.c7 && ['aside', 'broken', 'armed', 'split'].includes(s.c7.night) ? 12 : 0;
    s.cmd = {
      on: true,
      teams: [0, 1, 2].map((i) => ({ id: `BLUE-${i + 1}`, lead: lead(i), fat: 0, d: ['d5', 'd3', 'd7'][i], o: ['patrol', 'patrol', 'protect'][i] })),
      d: {
        d1: { o: 70, r: 25 },
        d2: { o: 52, r: 42 + unrest / 2 },
        d3: { o: 40 - unrest / 2, r: 48 + unrest + (s.res >= 25 ? 8 : 0) },
        d4: { o: 50, r: 40 },
        d7: { o: 72, r: 22 + unrest },
      },
      orderDay: -1,
      resolved: -1,
      report: [],
      reportDay: -1,
      incidents: 0,
      ...(opts || {}),
    };
    return s.cmd;
  };
  const active = (s) => s.cmd && s.cmd.on && s.phase === 'union';
  G.cmdActive = active;

  /* every morning: orders first */
  G.extend('u_board', {
    before: (s) => {
      if (!active(s) || s.cmd.orderDay === s.day) return;
      return 'cmd_assign';
    },
  });

  /* every evening: the orders play out */
  function resolve(s) {
    const c = s.cmd;
    if (c.resolved === s.day || c.orderDay !== s.day) return;
    c.resolved = s.day;
    const lines = [];
    const covered = {};
    let incidents = 0;
    c.teams.forEach((t) => {
      const o = ORDERS[t.o];
      t.fat = Math.max(0, Math.min(6, t.fat + o.fat));
      if (t.o === 'rest') return lines.push(`${t.id} (${t.lead}) rested. Fatigue ${t.fat}/6.`);
      covered[t.d] = t.o;
      bump(s, t.d, o.o, o.r);
      let line = `${t.id} (${t.lead}) — ${nameOf(t.d)}, ${o.name.toLowerCase()}: `;
      if (t.o === 'raid') {
        const n = 1 + Math.floor(Math.random() * 4);
        c.arrests = (c.arrests || 0) + n;
        line += `${n} arrest${n > 1 ? 's' : ''}. ${pick(['A door on every landing. The stairwell remembers.', 'A cellar full of batteries and one frightened boy.', 'Leaflets, a radio, and nobody who admits to either.'])}`;
        if (t.fat >= 4 && Math.random() < 0.5) {
          line += ' The team was tired and it showed: one unit came back hurt.';
          if (s.squad && s.squad.formed && G.squadHit) G.squadHit(s, true, nameOf(t.d));
        }
        if (t.d === 'd3' || t.d === 'd5') G.fx(s, { res: -2 });
      } else if (t.o === 'protect') line += pick(['They stood in the stairwells all day. Nobody was hurt. Nobody thanked them.', 'A queue that did not turn. A fight that did not start.', 'Quiet. The kind of quiet you have to stand in to keep.']);
      else line += pick(['Routine. Two stops, one warning.', 'The streets saw armbands every hour.', 'Nothing to report, which is something.']);
      lines.push(line);
    });
    /* the districts nobody covered */
    DISTS.forEach(({ k, name }) => {
      if (covered[k]) return;
      bump(s, k, -2, 2);
      const x = D(s, k);
      if ((x.o < 35 || x.r > 70) && Math.random() < 0.5) {
        incidents++;
        bump(s, k, -4, 4);
        lines.push(`@sys INCIDENT — ${name}: ${pick({ d1: ['a broadcast screen smashed on the Nexus steps', 'chalk on the Administrator’s door'], d2: ['a ration crate tipped into the canal', 'a fire in a mill storeroom'], d3: ['a lock gate jammed open overnight', 'a unit’s radio found in the canal'], d4: ['a signal box burned', 'a freight wagon emptied on a siding'], d5: ['a stairwell barricaded in the Stacks', 'stones from a roof onto a patrol'], d7: ['a window broken in the Upper Town', 'a commended citizen beaten on his own doorstep'] }[k])}.`);
      }
    });
    c.report = lines;
    c.reportDay = s.day;
    /* the outbreak */
    if (c.inf) {
      c.teams.forEach((t) => t.o !== 'rest' && (c.inf[t.d] = clamp(c.inf[t.d] - CUT[t.o])));
      DISTS.forEach(({ k }) => !covered[k] && c.inf[k] > 0 && (c.inf[k] = clamp(c.inf[k] + 4)));
      const seed = {};
      DISTS.forEach(({ k }) => c.inf[k] >= 40 && NEXT[k].forEach((n) => (seed[n] = (seed[n] || 0) + 4)));
      Object.keys(seed).forEach((n) => (c.inf[n] = clamp(c.inf[n] + seed[n])));
      DISTS.forEach(({ k, name }) => {
        if (c.inf[k] >= 60 && Math.random() < 0.55) {
          incidents++;
          bump(s, k, -5, 6);
          lines.push(`@sys BLOOM — ${name}: ${pick(['a stairwell sealed with someone still knocking on the other side', 'grey threads in a cellar, and a family missing from upstairs', 'a voice repeating a ration call in an empty flat', 'a dog that came home wrong'])}.`);
        }
      });
      lines.push(`@sys INFECTION: ${DISTS.map((d) => `${d.code} ${Math.round(c.inf[d.k])}`).join(' · ')}`);
    }
    c.incidents += incidents;
    c.lastIncidents = incidents;
    c.teams.forEach((t) => (t.spent = t.fat >= 6));
    const chap = c.chap || 'c8';
    if (s[chap] && s[chap].score !== undefined) s[chap].score = clamp(s[chap].score + G.cmdScore(s));
    G.note(`COMMAND: ${incidents ? incidents + ' incident' + (incidents > 1 ? 's' : '') : 'no incidents'}`, incidents ? 'observed' : 'codex');
  }
  G.cmdResolve = resolve;
  /* the day's verdict: how the city holds, weighted to the Upper Town, minus incidents */
  G.cmdScore = (s) => {
    const W = { d1: 1, d2: 1, d3: 1, d4: 1, d5: 1.5, d7: 2 };
    const sum = Object.keys(W).reduce((a, k) => a + W[k] * (D(s, k).o - D(s, k).r), 0) / Object.values(W).reduce((a, b) => a + b, 0);
    const base = Math.max(-5, Math.min(4, Math.round((sum - 22) / 6))) - 3 * (s.cmd.lastIncidents || 0);
    if (!s.cmd.inf) return base;
    const avg = DISTS.reduce((a, d) => a + (s.cmd.inf[d.k] || 0), 0) / DISTS.length;
    return base + Math.max(-3, Math.min(3, Math.round((20 - avg) / 6)));
  };
  G.extend('u_duty_end', { before: (s) => (active(s) ? void resolve(s) : undefined) });
  G.extend('u_evening', {
    text: (lines, s) => (active(s) && s.cmd.reportDay === s.day ? lines.concat(['@sys COMMAND REPORT', ...s.cmd.report, s[s.cmd.chap || 'c8'] && s[s.cmd.chap || 'c8'].score !== undefined ? `@sys ${s.cmd.chap === 'c9' ? 'CONTAINMENT' : 'INSPECTION'} ASSESSMENT: ${s[s.cmd.chap || 'c8'].score} / 100` : null]) : lines),
  });

  /* the city map shows your teams and colours the districts from the command state */
  const wrapZones = () => {
    (G.CITY_ZONES || []).forEach((z) => {
      if (z._cmd) return;
      z._cmd = true;
      const old = z.status;
      const key = { d1: 'd1', d2: 'd2', d3: 'd3', d4: 'd4', d5: 'd5', d7: 'd7' }[z.id];
      z.status = (s) => {
        const [lvl, lines] = old(s);
        if (!active(s) || !key) return [lvl, lines];
        const here = s.cmd.teams.filter((t) => t.d === key && t.o !== 'rest');
        const x = D(s, key);
        return [key === 'd5' ? lvl : colour(x), lines.concat([s.cmd.inf ? `<b>Infection:</b> ${G.cmdInf(s, key)} / 100.` : null, here.length ? `<b>Your teams here:</b> ${here.map((t) => `${t.id} (${ORDERS[t.o].name.toLowerCase()})`).join(', ')}.` : 'None of your teams is posted here.'])];
      };
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrapZones);
  else setTimeout(wrapZones, 0);

  /* ------------------------------------------------------------ the order sheet */
  const draft = (s) => {
    if (!s.cmd.draft || s.cmd.draftDay !== s.day) {
      s.cmd.draft = s.cmd.teams.map((t) => ({ d: t.d, o: t.spent ? 'rest' : t.o }));
      s.cmd.draftDay = s.day;
    }
    return s.cmd.draft;
  };
  function sheet(s) {
    const dr = draft(s);
    const rows = s.cmd.teams
      .map((t, i) => {
        const x = dr[i];
        return `<div class="cmd-team" data-i="${i}">
          <div class="cmd-tname"><b>${t.id}</b> ${t.lead}<span class="cmd-fat" title="Fatigue">${'■'.repeat(t.fat)}${'□'.repeat(6 - t.fat)}</span>${t.spent ? '<em>SPENT — must rest</em>' : ''}</div>
          <div class="cmd-row">${DISTS.map((d) => `<button class="cmd-b${x.d === d.k ? ' on' : ''}" data-set="d" data-v="${d.k}" ${x.o === 'rest' ? 'disabled' : ''} style="--dc:${({ green: '#6fbf73', amber: '#e2a83f', red: '#d9534a' })[colour(D(s, d.k))]}">${d.code}</button>`).join('')}</div>
          <div class="cmd-row">${orderList(s).map((o) => `<button class="cmd-b ord${x.o === o ? ' on' : ''}" data-set="o" data-v="${o}" ${t.spent && o !== 'rest' ? 'disabled' : ''}>${ORDERS[o].name}</button>`).join('')}</div>
        </div>`;
      })
      .join('');
    return `<div class="cmd-sheet">
      ${G.cityMapSvg ? `<div class="cmd-map">${G.cityMapSvg(s, null)}</div>` : ''}
      <div class="cmd-key">${DISTS.map((d) => { const x = D(s, d.k); return `<span style="color:${({ green: '#6fbf73', amber: '#e2a83f', red: '#d9534a' })[colour(x)]}">${d.code} ${d.name}${s.cmd.inf ? ` <i class="cmd-inf">☣${G.cmdInf(s, d.k)}</i>` : ''}</span>`; }).join(' · ')}</div>
      ${rows}
      ${s.cmd.inf ? '<div class="sub"><b>Contain</b> (VECTOR procedure): infection down sharply, resentment up, tiring. Infection grows where nobody stands, and spreads from any district at 40 or more.</div>' : ''}<div class="sub">Patrol: order up. Raid: order up a lot, resentment up a lot, arrests, tiring. Protect: resentment down. Rest: recover. Districts nobody covers drift, and where they boil over there are incidents. The Upper Town counts double for the inspection.</div>
    </div>`;
  }
  G.afterRender.push((sc, id, block) => {
    if (id !== 'cmd_assign') return;
    const s = G.state();
    const host = document.createElement('div');
    host.className = 'cmd-host';
    const draw = () => (host.innerHTML = sheet(s));
    draw();
    host.onclick = (e) => {
      const b = e.target.closest('[data-set]');
      if (!b || b.disabled) return;
      const i = +b.closest('.cmd-team').dataset.i;
      draft(s)[i][b.dataset.set] = b.dataset.v;
      draw();
    };
    const ch = block.querySelector('.choices');
    block.insertBefore(host, ch);
  });

  const issue = (s) => {
    const dr = draft(s);
    s.cmd.teams.forEach((t, i) => {
      t.d = dr[i].d;
      t.o = t.spent ? 'rest' : dr[i].o;
    });
    s.cmd.orderDay = s.day;
    return null;
  };
  G.addScenes({
    cmd_assign: {
      nosave: false,
      title: (s) => `Command — Day ${s.day}`,
      text: (s) => [
        s.cmd.reportDay === s.day - 1 && s.cmd.report.length ? `@sys YESTERDAY: ${s.cmd.lastIncidents ? s.cmd.lastIncidents + ' incident(s).' : 'no incidents.'}` : null,
        'The district board in the Nexus operations room: a map of City 9 under glass, three magnetic team markers, a grease pencil on a string. Your teams wait for orders.',
      ],
      choices: [
        { t: '**Issue the orders.**', tag: 'COMMAND', tagCls: 'duty', fx: issue, go: 'u_board' },
      ],
    },
  });

  G.addCodex({
    command: {
      title: 'District command',
      body: `<p>An acting commander holds the district board in the Nexus operations room: a map of City 9 under glass and a magnetic marker for each team. Every morning each team gets a district and an order.</p>
      <table><tr><td>Patrol</td><td>Armbands on the streets every hour. Order rises; so does resentment, a little.</td></tr>
      <tr><td>Raid</td><td>Doors, cellars, arrests. Order rises sharply; so does resentment. Tiring.</td></tr>
      <tr><td>Protect</td><td>Units in the stairwells and the queues so that nobody gets hurt. Resentment falls.</td></tr>
      <tr><td>Rest</td><td>The team recovers. A team at the end of its strength must rest.</td></tr></table>
      <p>Districts nobody covers drift. Where order breaks or resentment boils, there are incidents, and incidents are what inspectors read first.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Procedure').ids.push('command');
  G.afterRender.push((sc, id) => {
    if (id === 'cmd_assign') G.unlock(G.state(), 'command');
  });
})();
