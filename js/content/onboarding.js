/* ONBOARDING — a short field note the first time each system appears, one per scene at most.
   Seen notes are stored in the save (s.hintsSeen); the Menu has a Tips on/off switch (per device).
   Add a note: { id, when: (s, sceneId, block) => bool, title, text }. */
(function () {
  const has = (block, q) => !!block.querySelector(q);
  G.HINTS = [
    { id: 'checks', when: (s, id, b) => has(b, '.tag.chk'), title: 'Skill checks', text: 'A choice marked with a skill and a percentage is rolled against that chance. Using a skill trains it. Your skills are in the Dossier.' },
    { id: 'tags', when: (s, id, b) => has(b, '.tag.loyal') && has(b, '.tag.mercy'), title: 'Tagged choices', text: 'BY THE BOOK pleases the Union. MERCY pleases people. RISK can cost you everything. None of them is the right answer.' },
    { id: 'board', when: (s, id) => id === 'u_board' && s.phase === 'union', title: 'The duty board', text: 'Each morning you choose one duty. Duties earn merit, which unlocks promotion. NEW duties have a full first scene; ROUTINE ones change every time. Evenings are yours.' },
    { id: 'dossier', when: (s, id) => id === 'u_board' && s.day >= 2, title: 'Your Dossier', text: 'The Dossier (bottom bar on a phone) holds your status, skills, contacts, kit, case files and the district map. Tap a heading to fold it away.' },
    { id: 'observed', when: (s, id, b) => has(b, '.note.observed'), title: 'Observed', text: 'Something just went into your JURY file. You will never see the number. You will notice, now and then, that people treat you differently.' },
    { id: 'codex', when: (s, id, b) => has(b, '.note.codex') && s.codex.length >= 3, title: 'The Codex', text: 'New records appear in the Codex as you learn about the city. Unread ones are marked NEW. You can search it.' },
    { id: 'ss', when: (s, id) => id === 'ss_start', title: 'Stop & search', text: 'Check the card, search, question — in any order — then pass a verdict by the crime table. Points stay on the citizen’s file. At twenty, the verdict is death.' },
    { id: 'mini', when: (s, id, b) => has(b, '.mini-skip'), title: 'Minigames', text: 'Play it, or tap “Let instinct decide” to roll your skill instead.' },
    { id: 'raid', when: (s, id) => id === 'raid_search', title: 'Raids', text: 'Each search costs a minute on site. Questioning the occupant can give you a hunch. Tossing the flat finds everything, and the block remembers it.' },
    { id: 'report', when: (s, id) => id === 'rep_draft', title: 'Reports', text: 'Untick a line to leave it out; tick an addition to put it in. Some reports are audited days later, against the footage and the witnesses. You are never told which.' },
    { id: 'asset', when: (s) => s.inf && s.inf.list.length === 1 && s.inf.list[0].since === s.day, title: 'Informants', text: 'Meet your assets in the evening. Their tips appear on the duty board. Some of them are not yours.' },
    { id: 'disc', when: (s, id) => id === 'disc_hearing', title: 'Discipline', text: 'One strike is a warning, two a reprimand, three a demotion and a final warning. Strikes expire after six clean days. Your record is in the Dossier.' },
    { id: 'pb', when: (s, id) => id === 'pb_start', title: 'Promotion boards', text: 'Five written questions — the Codex has every answer — and three about your own file. Your merit and record count too.' },
    { id: 'district', when: (s) => s.codex.includes('district5') && s.phase === 'union', title: 'District 5', text: 'The map in your Dossier shows how each block feels about you: green, amber, red. Hard choices bring order and resentment. Mercy brings neither.' },
    { id: 'squad', when: (s, id) => id === 'sq_formed', title: 'Your protection team', text: 'Each member has a trait that helps one kind of check and an opinion about how you work. The most loyal is your partner and your witness. They can be hurt, transferred, or lost.' },
    { id: 'crowd', when: (s, id, b) => has(b, '.mini.crowd'), title: 'Crowd control', text: 'Post units to slow a sector. Speak while it is still listening. Pull out an agitator. The baton works at once, and is remembered.' },
    { id: 'roster', when: (s, id) => id === 'promo_card', title: 'The Roster', text: 'The Roster tab shows every unit in your division, where you stand, and what the next rank needs and gives.' },
    { id: 'socio', when: (s, id) => id === 'c3_0', title: 'Sociostatus', text: 'Overwatch is in command until it says otherwise. Curfew sweeps appear on the board. Choices that would be routine on another day are watched today.' },
  ];

  G.afterRender.push((sc, id, block) => {
    const s = G.state();
    if (!s || s.phase === 'creation' || s.phase === 'ended' || sc.nosave) return;
    if (G.prefs().tips === false) return;
    s.hintsSeen = s.hintsSeen || [];
    const h = G.HINTS.find((x) => !s.hintsSeen.includes(x.id) && x.when(s, id, block));
    if (!h) return;
    s.hintsSeen.push(h.id);
    const card = document.createElement('div');
    card.className = 'hint';
    card.innerHTML = `<div class="hint-h">FIELD NOTE · ${h.title}</div><div class="hint-t">${h.text}</div><div class="hint-b"><button data-h="ok">Got it</button><button data-h="off">Turn tips off</button></div>`;
    card.onclick = (e) => {
      const a = e.target.dataset && e.target.dataset.h;
      if (!a) return;
      if (a === 'off') {
        const p = G.prefs();
        p.tips = false;
        G.savePrefs(p);
        G.toast('Tips off. Turn them on again in the Menu.');
      }
      card.remove();
    };
    const choices = block.querySelector('.choices, .mini, .input-row');
    if (choices) block.insertBefore(card, choices);
    else block.append(card);
  });
})();
