/* ECHOES — "the faces come back". Everyone you stop, search, raid or flag keeps a file with their
   ID photo (s.files). Days later, some of them come back, shaped by what you did to them:
   - let go (warning, released, nothing found): at the canal culvert with the cells, in a crowd
     that turns, at a door with a child's drawing;
   - given points: on the relocation train, back from Level 4, chalking your locker;
   - amputated: a stairwell shrine, someone who asks if you knew them;
   - bribed (NO RECORD): back for more, or picked up by JURY and trading your designation.
   Each echo opens with their photo and a memory line: CID, the day, your verdict.
   At most one echo every three evenings, never on an evening a story beat is due. */
(function () {
  const pick = G.pick;
  const RES = ['s9', 's14', 's22'];
  /* where a citizen lives: a stable block for a CID (also used by the district map) */
  G.homeBlock = (cid) => RES[(parseInt(String(cid).slice(-3), 10) || 0) % 3];
  const blockName = (cid) => (G.BLOCKS ? G.BLOCKS[G.homeBlock(cid)].name : 'the Stacks');

  /* what kind of memory a file is */
  const kindOf = (f) => {
    if (f.amputated) return 'amp';
    const v = f.lastVerdict || '';
    if (v === 'NO RECORD') return 'bribe';
    if (v === 'ASSET') return null;
    if (/WARNING|RELEASED|NO FINDINGS|reduced/.test(v)) return 'mercy';
    if (/PTS|FLAGGED/.test(v)) return 'hard';
    return null;
  };
  const verdictWords = (f) => {
    const v = f.lastVerdict || '';
    if (f.amputated) return 'you amputated them';
    if (v === 'NO RECORD') return 'you took their tokens and wrote NO RECORD';
    if (/FLAGGED/.test(v)) return 'you flagged them from a Lantern feed';
    if (/reduced/.test(v)) return 'you wrote the charge down';
    if (/WARNING/.test(v)) return 'you let them go with a warning';
    if (/RELEASED|NO FINDINGS/.test(v)) return 'you let them go';
    if (/PTS/.test(v)) return `you gave them ${v.replace(/[^0-9]/g, '')} points`;
    return 'you stopped them';
  };
  G.echoKind = kindOf;

  const beatDue = (s, when) => G.beats.some((b) => b.time === when && !s.flags['beat_' + b.id] && b.when(s));
  const candidates = (s) =>
    Object.values(s.files || {}).filter((f) => f.face !== undefined && G.DOC_FACES && G.DOC_FACES[f.face] && kindOf(f) && (f.last || 0) <= s.day - 2 && (f.echoDay || -99) <= s.day - 8 && (f.echoes || 0) < 3);

  const VARIANTS = {
    mercy: ['cells', 'shield', 'drawing'],
    hard: ['train', 'level4', 'turned'],
    amp: ['shrine', 'asks'],
    bribe: ['more', 'traded'],
  };

  G.extend('u_evening', {
    before: (s) => {
      if (s.phase !== 'union' || s.day < 4) return;
      s.mem.echo2 = s.mem.echo2 || { last: -99 };
      if (s.mem.echo2.last > s.day - 3 || s.mem.echo2.tried === s.day) return;
      s.mem.echo2.tried = s.day;
      if (beatDue(s, 'evening')) return;
      const list = candidates(s);
      if (!list.length || Math.random() > 0.4) return;
      const f = pick(list);
      const kind = kindOf(f);
      let v = VARIANTS[kind].filter((x) => x !== f.echoLast);
      if (kind === 'mercy' && s.res < 10) v = v.filter((x) => x !== 'cells');
      const variant = pick(v.length ? v : VARIANTS[kind]);
      f.echoes = (f.echoes || 0) + 1;
      f.echoDay = s.day;
      f.echoLast = variant;
      s.mem.echo2 = { last: s.day, tried: s.day, cid: f.cid, v: variant };
      return 'echo_' + variant;
    },
  });

  /* the file this echo is about */
  const F = (s) => s.files[s.mem.echo2.cid];
  const head = (s) => {
    const f = F(s);
    return [`@portrait ${G.DOC_FACES[f.face].img}|CID ${f.cid}${f.name ? ' — ' + f.name : ''}`, `@sys MEMORY · CID ${f.cid} · Day ${f.last}: ${verdictWords(f)}.`];
  };
  const upd = (s, add, verdict) => {
    const f = F(s);
    f.points = Math.min(99, (f.points || 0) + add);
    f.stops = (f.stops || 0) + 1;
    f.last = s.day;
    f.lastVerdict = verdict;
    if (f.points >= 20) (f.amputated = true), (f.lastVerdict = 'AMPUTATED');
  };
  const home = { t: 'Go home.', go: 'u_night' };
  const sc = (title, text, choices) => ({ title, text: (s) => [...head(s), ...[].concat(text(s, F(s)))], choices: (s) => [].concat(typeof choices === 'function' ? choices(s, F(s)) : choices) });

  G.addScenes({
    /* ---------------------------------------------------------- let go */
    echo_cells: sc(
      'The canal culvert — dusk',
      (s, f) => [
        `You take the long way home along the canal. Under the culvert by Lock 3, three figures are passing a sack hand to hand. The middle one turns into the last of the light, and you know the face before you know why.`,
        'They see you see them. Nobody moves. Somewhere above, very faint, a Lantern’s fans.',
      ],
      [
        { t: 'Keep walking. You saw a culvert, nothing else.', tag: 'MERCY', tagCls: 'mercy', fx: { res: 4, cons: 2, susp: 3 }, go: 'u_night' },
        { t: 'Draw your sidearm. “All three of you. Down.”', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'authority', diff: 10, pass: 'echo_cells_arrest', fail: 'echo_cells_run' } },
        { t: 'Radio it in as an anonymous sighting.', fx: (s) => (G.distFx(s, G.homeBlock(F(s).cid), 4, 4), { merit: 2, cons: -2 }), go: 'u_night' },
      ]
    ),
    echo_cells_arrest: {
      enter: (s) => upd(s, 6, '+6 PTS'),
      text: (s) => ['They go down on the wet stones. In the sack: insulin, a radio battery, three loaves. The one you let go once looks up at you the whole time the van takes to come, and does not say a word, which is worse than anything they could have said.'],
      choices: [{ t: 'Go home.', fx: { merit: 6, lp: 2, cons: -6, res: -6 }, go: 'u_night' }],
    },
    echo_cells_run: {
      text: ['The sack hits the water and all three are gone into the dark of the culvert before your voice has finished. You stand there with your sidearm out, pointing at nothing, feeling the Lantern above you film every second of it.'],
      choices: [{ t: 'Go home.', fx: { merit: -1, susp: 3 }, go: 'u_night' }],
    },

    echo_shield: sc(
      'Plaza 5 — the evening queue',
      (s, f) => [
        'The last ration hatch jams at 18:40 with sixty people still waiting, and the queue turns the way a queue turns: all at once, towards the nearest armband. Yours.',
        'A voice from the middle of it, not loud: *“Leave this one. This one is fair.”* You know the voice now. You know the face. The front rows hesitate, and the hesitation spreads backwards until it is only a crowd again.',
      ],
      [
        { t: 'Nod to them. Once.', tag: 'MERCY', tagCls: 'mercy', fx: (s) => (G.distFx(s, 'plaza', 2, -6), { cons: 3, res: 2 }), go: 'u_night' },
        { t: 'Look straight through them. You owe nobody here anything.', fx: (s) => (G.distFx(s, 'plaza', 2, 0), { cons: -1 }), go: 'u_night' },
      ]
    ),

    echo_drawing: sc(
      'Your barracks door — night',
      (s, f) => [
        `A folded sheet of ration paper has been pushed under your door. Inside, in a child’s pencil: a tall figure in a round-eyed mask, standing outside a door in ${blockName(f.cid)}, one hand lowered. Beside it, smaller, a person with the same face as the photo in your file. Both are smiling. Masks cannot smile. The child drew one anyway.`,
      ],
      [
        { t: 'Keep it in your locker.', tag: 'RISK', tagCls: 'risk', fx: { cons: 4, susp: 3 }, go: 'u_night' },
        { t: 'Burn it in the stove.', fx: { cons: -1 }, go: 'u_night' },
      ]
    ),

    /* ----------------------------------------------------- given points */
    echo_train: sc(
      'D4 — the Thursday relocation train',
      (s, f) => [
        'You are on the platform detail when the Thursday train pulls out. The wagons have one barred window each, and in the fourth one a face presses to the glass.',
        `They hold their CID label flat against the window so you can read it. ${f.cid}. ${f.points >= 15 ? `${Math.min(20, f.points)} points. You know who put most of them there.` : 'They are not angry. They want you to know which one they were.'}`,
      ],
      [
        { t: 'Look away before the train does.', fx: { cons: -2 }, go: 'u_night' },
        { t: 'Hold their eyes until the wagon is gone.', fx: { cons: 2 }, go: 'u_night' },
        { t: 'Walk alongside and ask the wagon guard where it goes.', tag: 'RISK', tagCls: 'risk', fx: { cons: 3, susp: 3 }, go: 'echo_train_ask' },
      ]
    ),
    echo_train_ask: {
      text: ['@say Overwatch guard|North.', 'That is all it says. It does not ask why you want to know. It records your designation instead, which is the same thing.'],
      choices: [home],
    },

    echo_level4: sc(
      'Plaza 5 — the ration queue',
      (s, f) => [
        'Somebody in the queue has come back from Level 4. You can always tell: the way they hold their hands, the way they stand a little behind everyone else.',
        'Then they turn, and it is the face from your file, older by more than the days it has been. When they see your armband their whole body flinches, and a woman beside them steps between you without looking at you at all.',
      ],
      [
        { t: 'Move on down the line.', fx: { cons: -1 }, go: 'u_night' },
        { t: 'Push your own ration bar into their pocket on the way past.', tag: 'MERCY', tagCls: 'mercy', fx: { tokens: -2, cons: 4, susp: 1 }, go: 'u_night' },
      ]
    ),

    echo_turned: sc(
      'The precinct locker room',
      (s, f) => [
        'Your locker door has been chalked. A lambda, neat and large, and under it a five-digit number you know because you typed it yourself.',
        `${f.cid}. Whoever did this got into the precinct to do it, or knows someone who can. The units at the next lockers are very carefully not looking.`,
      ],
      [
        { t: 'Report it. Photograph it. Let JURY have it.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => (G.distFx(s, G.homeBlock(F(s).cid), 5, 6), { merit: 3, lp: 1 }), go: 'u_night' },
        { t: 'Wipe it off with your sleeve before anyone else sees.', fx: (s) => (G.distFx(s, G.homeBlock(F(s).cid), 0, 4), { cons: 1, susp: 2 }), go: 'u_night' },
      ]
    ),

    /* -------------------------------------------------------- amputated */
    echo_shrine: sc(
      (s) => `${blockName(F(s).cid)} — the fourth-floor landing`,
      (s, f) => [
        'On the landing where the stair light still works, someone has made a shrine. Candle stubs in ration tins, chalk lambdas, a dried flower. In the middle, pinned to the wall, an ID photograph cut out of a citizen card.',
        'It is the photograph in your file. The same crease across the corner. You put that crease there when you took the card.',
      ],
      [
        { t: 'Tear it down and kick the candles out.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => (G.distFx(s, G.homeBlock(F(s).cid), 4, 8), { merit: 2, lp: 1, cons: -4 }), go: 'u_night' },
        { t: 'Leave it. Walk up the stairs as if it isn’t there.', fx: { cons: 1 }, go: 'u_night' },
        { t: 'Relight the candle that has gone out.', tag: 'RISK', tagCls: 'risk', fx: (s) => (G.distFx(s, G.homeBlock(F(s).cid), -2, -6), { cons: 5, res: 3, susp: 4 }), go: 'u_night' },
      ]
    ),

    echo_asks: sc(
      'The precinct gate — after shift',
      (s, f) => [
        `A girl of about ten is waiting at the precinct gate, which nobody does. She has the same eyes as the photo in your file. She holds up a ration card with that CID on it and asks every unit who comes out the same thing.`,
        '@say The girl|Did you know them? Did you know where they went?',
      ],
      [
        { t: '“No.” Keep walking.', fx: { cons: -3 }, go: 'u_night' },
        { t: 'Crouch down. “Yes. I was there.”', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 4, susp: 3 }, go: 'echo_asks_yes' },
      ]
    ),
    echo_asks_yes: {
      text: ['She does not cry. She looks at your lenses for a long time, as if she is memorising them, and then she says *thank you* very politely and walks away into the Stacks.', 'You understand that you have been remembered.'],
      choices: [home],
    },

    /* --------------------------------------------------------- bribed */
    echo_more: sc(
      'Bazaar Row — closing time',
      (s, f) => [
        'They find you at the end of your shift, between two shuttered stalls. Thinner, more frightened, with a cloth bundle held tight.',
        '@say CID ' + f.cid + '|It worked last time. My brother has the same problem. Twelve tokens. Please. You know how it works.',
      ],
      [
        { t: 'Take the tokens. It did work last time.', tag: 'BRIBE', tagCls: 'risk', fx: { tokens: 12, susp: 6, cons: -3 }, go: 'u_night' },
        { t: '“There was no last time.” Walk away.', fx: { cons: 1 }, go: 'u_night' },
        { t: 'Arrest them for attempted bribery.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => (upd(s, 6, '+6 PTS'), { merit: 4, susp: -2, cons: -4 }), go: 'echo_more_talk' },
      ]
    ),
    echo_more_talk: {
      text: (s) => [`At the van they turn and say, loud enough for the driver: *“Ask your unit about Day ${F(s).echoFirst || F(s).last}.”* The driver writes something on his slate.`],
      enter: (s) => {
        const f = F(s);
        f.echoFirst = f.echoFirst || f.last;
      },
      choices: [{ t: 'Go home.', fx: { susp: 4 }, go: 'u_night' }],
    },

    echo_traded: sc(
      'The precinct — end-of-shift briefing',
      (s, f) => [
        'At the end-of-shift briefing the duty sergeant reads a JURY notice without looking up: a citizen detained in the night on a curfew charge has made a statement *concerning the conduct of a unit of this precinct*. He reads out the CID.',
        `It is the one you took tokens from. ${f.name ? f.name : 'They'} bought one night’s sleep with your designation. You would have done the same.`,
      ],
      [
        { t: 'Stand very still.', fx: { susp: 8 }, go: 'u_night' },
        { t: 'Go to JURY first and give a version of your own.', check: { skill: 'deception', diff: 15, pass: 'echo_traded_ok', fail: 'echo_traded_bad' } },
      ]
    ),
    echo_traded_ok: { text: ['You tell JURY the citizen offered and you refused, and that you did not report it because they were frightened. It is nearly true. JURY writes it down. Both versions go in the file, side by side.'], choices: [{ t: 'Go home.', fx: { susp: 3 }, go: 'u_night' }] },
    echo_traded_bad: { text: ['Your version has the day wrong. JURY notices. JURY always notices the day.'], choices: [{ t: 'Go home.', fx: { susp: 10 }, go: 'u_night' }] },
  });

  G.addCodex({
    echoes: {
      title: 'Faces in the file',
      body: `<p>Every citizen you stop, search, raid or flag keeps a file in your lens: their ID photo, their CID, your verdict and the day. The file stays open after they walk away.</p>
      <p>District 5 is forty thousand people in five blocks. Sooner or later you see the same faces again — on a train, in a queue, under a culvert, on a shrine. What they do when they see you depends on what you did to them.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Procedure').ids.push('echoes');
  G.afterRender.push((sc, id) => {
    if (/^echo_/.test(id)) G.unlock(G.state(), 'echoes');
  });
})();
