/* THE CITY MAP — a "Map" button (top bar and mobile nav) opens City 09 from above. Every district
   and landmark is a tappable zone with a live status colour and a status panel drawn from the game:
   D1 your standing and your JURY file · D2 the Works and the ration cut · D3 the canal cells ·
   D4 the railway and the trains · D5 the five blocks (with the District 5 block map and the faces
   from your files) · 404 the quarantine · the dam and GRID's power · the Spire.
   The base map is an image when there is one (G.CITY_MAP_IMG); until then a schematic is drawn.
   Zones live in a 1600 × 900 coordinate space, so they can be laid over the painted map and nudged. */
(function () {
  const W = 1600, H = 900;
  G.CITY_MAP_IMG = null; /* set to the painted map's path once it exists */
  const COL = { green: '#6fbf73', amber: '#e2a83f', red: '#d9534a', grey: '#7a8b92' };
  const WORD = { green: 'Calm', amber: 'Tense', red: 'Trouble', grey: 'No access' };
  const st = () => G.state();
  const worst = (cols) => (cols.includes('red') ? 'red' : cols.includes('amber') ? 'amber' : 'green');
  const fileStrength = (s) => (s.susp >= 80 ? 'Critical' : s.susp >= 60 ? 'Strong' : s.susp >= 30 ? 'Building' : 'Thin');
  const files = (s) => Object.values(s.files || {});

  /* zones: rect [x, y, w, h] in map space, label anchor, and a status function */
  const ZONES = [
    {
      id: 'd4', code: 'D4', name: 'Rail Yards', rect: [0, 500, 320, 400],
      status: (s) => {
        const ran = s.c6 && s.c6.train;
        const lvl = s.c6 && !s.c6.done ? 'amber' : ran === 'stopped' || ran === 'air' ? 'red' : 'green';
        return [lvl, [
          'Freight, scrap, and the Thursday relocation trains north. Unlit after curfew.',
          s.c6 && !s.c6.done ? 'A railway runs on the coal line on Thursday nights. Somebody is hunting it. Somebody is you.' : null,
          ran === 'ran' || ran === 'shielded' ? 'The coal train went north with forty people in the wagons. The sidings are quiet, and listening.' : ran === 'stopped' ? 'The coal siding is floodlit now. Every wagon is opened at the junction.' : ran === 'air' ? 'There is a burnt patch on the coal siding where the Shrike fired. Nobody sweeps it.' : ran === 'tagged' ? 'The last wagon left with a black disc in its frame. VEIL followed it north.' : null,
        ]];
      },
    },
    {
      id: 'd3', code: 'D3', name: 'Canal Quarter', rect: [320, 500, 288, 400],
      status: (s) => {
        const lvl = s.res >= 40 ? 'red' : s.res >= 20 ? 'amber' : 'green';
        const inf = s.inf && s.inf.list ? s.inf.list.filter((x) => x.status === 'active').length : 0;
        return [lvl, [
          'Locks, pump houses and drowned basements. Smugglers’ country.',
          s.res >= 40 ? 'The canal cells move freely here. Chalk under every bridge.' : s.res >= 20 ? 'The cells are active. Couriers on the towpaths after dark.' : 'Quiet, as far as the precinct can tell. That is never very far.',
          inf ? `You have ${inf} informant${inf > 1 ? 's' : ''} on the books.` : null,
        ]];
      },
    },
    {
      id: 'd2', code: 'D2', name: 'The Works', rect: [608, 500, 224, 400],
      status: (s) => {
        const cut = s.c4 && !s.c4.done;
        return [cut ? 'amber' : 'green', [
          'Textile mills and the ration-packing plant. Shift sirens at 05:40 and 17:40.',
          cut ? 'The ration is cut by sixty grams. The packing plant is guarded at night.' : null,
          s.c4 && s.c4.done ? 'The packing-plant warehouse was emptied once. The new locks are GRID’s.' : null,
        ]];
      },
    },
    {
      id: 'd1', code: 'D1', name: 'The Nexus', rect: [832, 500, 192, 400],
      status: (s) => {
        const jf = s.jf && s.jf.met;
        const lvl = s.susp >= 60 ? 'red' : s.susp >= 30 ? 'amber' : 'green';
        return [lvl, [
          'Administration, Civil Protection headquarters, the Academy and the detention levels. The Administrator lives on the top floor.',
          s.phase === 'union' ? `Your designation: ${G.desig(s)}.` : null,
          jf ? `JURY internal file: <b>${fileStrength(s)}</b>.` : 'Level 4 has not asked for you. As far as you know.',
        ]];
      },
    },
    {
      id: 'd5', code: 'D5', name: 'The Stacks', rect: [1024, 500, 304, 400],
      status: (s) => {
        const cols = G.BLOCKS ? Object.keys(G.BLOCKS).map((k) => (G.distColour ? G.distColour(s, k) : 'green')) : ['green'];
        const mine = files(s).length;
        return [worst(cols), [
          'Stacks 9, 14 and 22, Bazaar Row, Plaza 5. Forty thousand citizens. Where you grew up.',
          G.districtSvg && s.dist ? `<div class="cm-sub">${G.districtSvg(s)}</div><div class="sub">Tap a block for its state and the faces from your files.</div>` : null,
          mine ? `${mine} case file${mine > 1 ? 's' : ''} open in the district.` : null,
        ]];
      },
    },
    {
      id: 'q404', code: '404', name: 'Old Town', rect: [1360, 470, 240, 430],
      status: (s) => [
        'red',
        [
          'Beyond the eastern canal. Quarantined. A wall, a number painted on it, and the dead town behind.',
          s.div === 'SPEAR' ? 'SPEAR goes over the wall. You know the doors on the other side.' : s.div === 'VECTOR' ? 'VECTOR follows SPEAR in and comes out with jars.' : 'Only SPEAR and VECTOR cross. The voices on the wall are logged, never answered.',
        ],
      ],
    },
    {
      id: 'dam', code: 'DAM', name: 'The Dam', rect: [40, 300, 160, 190],
      status: (s) => {
        const dark = s.mem && s.mem.dark && s.mem.dark.day >= s.day - 1 ? s.mem.dark.block : null;
        return [dark ? 'amber' : 'green', [
          'Five arches across the river. It has not stopped humming since the war. Its output goes to the Spire first.',
          dark ? `Tonight GRID cut the power to ${G.BLOCKS[dark].name}.` : 'Every light in the Stacks is on, for now.',
          s.c3 && s.c3.done ? `The long night at the spillway: ${s.c3.result === 'held' ? 'the dam held' : 'you remember it'}.` : null,
        ]];
      },
    },
    {
      id: 'spire', code: '', name: 'The Spire', rect: [820, 40, 200, 300],
      status: () => ['grey', ['Twenty-four hundred metres of dark alloy through the old cathedral square. No citizen has been inside. Very few units.']],
    },
  ];
  G.CITY_ZONES = ZONES;

  /* the schematic base map, drawn until a painted map exists */
  function schematic() {
    let g = `<rect width="${W}" height="${H}" fill="#0f171c"/>`;
    g += `<path d="M0 360 C 300 330, 520 470, 800 430 S 1300 330, 1600 380 L1600 500 C 1300 450, 1050 560, 800 540 S 300 450, 0 470 Z" fill="#132833"/>`;
    g += `<rect x="1328" y="470" width="20" height="430" fill="#132833"/>`;
    for (let i = 0; i < 5; i++) g += `<rect x="${70 + i * 24}" y="330" width="16" height="140" fill="#2a3a42"/>`;
    [380, 930, 1200].forEach((x) => (g += `<rect x="${x}" y="400" width="18" height="120" fill="#24323a"/>`));
    g += `<path d="M170 340 C 400 280, 700 300, 900 300" stroke="#5fc8dd" stroke-width="5" fill="none" opacity=".5"/>`;
    g += `<path d="M150 900 L150 560 L120 0" stroke="#3a4a52" stroke-width="6" fill="none" stroke-dasharray="14 8"/>`;
    g += `<path d="M905 60 L935 60 L960 330 L880 330 Z" fill="#06090b" stroke="#5fc8dd" stroke-width="2" opacity=".9"/>`;
    for (let y = 520; y < 900; y += 34) for (let x = 10; x < 1340; x += 38) if ((x * 7 + y * 3) % 5) g += `<rect x="${x}" y="${y}" width="26" height="22" fill="#1a252b"/>`;
    for (let y = 500; y < 900; y += 40) for (let x = 1365; x < 1600; x += 44) g += `<rect x="${x}" y="${y}" width="30" height="26" fill="#161c1f"/>`;
    for (let y = 40; y < 300; y += 36) for (let x = 260; x < 1600; x += 42) if (Math.abs(x - 920) > 120 && (x + y) % 3) g += `<rect x="${x}" y="${y}" width="28" height="24" fill="#161f24"/>`;
    return g;
  }

  function mapSvg(s, sel) {
    let g = `<svg viewBox="0 0 ${W} ${H}" class="cm-svg" role="img" aria-label="Map of City 09">`;
    g += G.CITY_MAP_IMG ? `<image href="${G.CITY_MAP_IMG}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>` : schematic();
    ZONES.forEach((z) => {
      const [lvl] = z.status(s);
      const [x, y, w, h] = z.rect;
      const c = COL[lvl];
      g += `<g class="cm-zone${sel === z.id ? ' sel' : ''}" data-zone="${z.id}" tabindex="0" role="button" aria-label="${z.name}">`;
      g += `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="6" fill="${c}" fill-opacity="${sel === z.id ? 0.28 : 0.12}" stroke="${c}" stroke-width="${sel === z.id ? 5 : 3}"/>`;
      g += `<text x="${x + w / 2}" y="${y + h / 2 - 6}" class="cm-code" fill="${c}">${z.code || '◆'}</text>`;
      g += `<text x="${x + w / 2}" y="${y + h / 2 + 26}" class="cm-name">${z.name.toUpperCase()}</text>`;
      if (lvl === 'red' && z.id !== 'q404') g += `<circle cx="${x + w - 26}" cy="${y + 26}" r="10" fill="${c}" class="cm-alert"/>`;
      g += '</g>';
    });
    return g + '</svg>';
  }

  function panel(s, id) {
    const z = ZONES.find((x) => x.id === id);
    if (!z) return '<p class="sub">Tap a district for its status.</p>';
    const [lvl, lines] = z.status(s);
    return `<div class="cm-panel"><div class="cm-head"><b>${z.code ? z.code + ' — ' : ''}${z.name}</b><span style="color:${COL[lvl]}">${WORD[lvl]}</span></div>${lines.filter(Boolean).map((l) => (l.startsWith('<div') ? l : `<p>${l}</p>`)).join('')}</div>`;
  }

  let selected = 'd5';
  G.showMap = (id) => {
    const s = st();
    if (!s || s.phase !== 'union') return G.openModal('City 09', '<p class="sub">The map is issued to units on duty.</p>', 'map');
    if (id) selected = id;
    G.openModal('City 09 — District status', `<div class="citymap">${mapSvg(s, selected)}<div class="cm-legend"><span style="color:${COL.green}">■ Calm</span><span style="color:${COL.amber}">■ Tense</span><span style="color:${COL.red}">■ Trouble</span><span style="color:${COL.grey}">■ No access</span></div>${panel(s, selected)}</div>`, 'map');
  };
  document.addEventListener('click', (e) => {
    const z = e.target.closest && e.target.closest('#modal-body [data-zone]');
    if (z) G.showMap(z.dataset.zone);
  });

  G.ICONS.map = '<svg viewBox="0 0 24 24"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>';
  G.NAV.splice(2, 0, { id: 'map', label: 'Map', icon: G.ICONS.map, act: () => G.showMap(), if: (s) => s.phase === 'union' });
  const bind = () => {
    const b = document.getElementById('btn-map');
    if (b) b.onclick = () => G.showMap();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
