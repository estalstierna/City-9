/* RAIDS, INFORMANTS, INCIDENT REPORTS — scenes, side panel and codex for the shared systems.
   Uses helpers exported by systems.js (G._sys). */
(function () {
  const X = G._sys;
  const { ensure, partner, partnerRel, superior, queueAudit, detectP, ORDER, activeInf, infById, recruit, trustWord, RITEMS, GRADE_LEVEL, LEVEL_POINTS, SPOTS, PERSONS, CLAIMS, R, searchSpot, raidCharges, ssReport, raidReport, rint, pick } = X;
  const END = 'u_duty_end';
  const pName = (s) => partner(s).name;
  const PName = (s) => (partner(s).key ? partner(s).name : 'Your partner');
  const face = (i) => (G.DOC_FACES && G.DOC_FACES[i] ? G.DOC_FACES[i].img : null);

  const charges = (s) => raidCharges(s);
  const pts = (list) => list.reduce((n, c) => n + LEVEL_POINTS[c.lvl], 0);

  G.addScenes({
    /* ================================================== RAID */
    raid_new: {
      safe: true,
      enter: (s) => {
        s.raid = G.makeRaid(s, {});
        return 'raid_start';
      },
      text: [],
    },
    raid_tip: {
      safe: true,
      enter: (s) => {
        const t = s.inf.tip;
        s.inf.tip = null;
        if (!t) return 'u_board';
        s.raid = G.makeRaid(s, t);
        return s.raid.trap ? 'raid_trap' : 'raid_start';
      },
      text: [],
    },

    raid_start: {
      title: (s) => `Raid — ${R(s).addr}`,
      enter: (s) => {
        G.unlock(s, 'raids');
        R(s).entry = null;
      },
      text: (s) => {
        const r = R(s);
        const inf = r.inf ? infById(s, r.inf) : null;
        return [
          '@img assets/img/env/e02-apartment.jpg|A flat in the Stacks',
          inf
            ? `@sys TIP — your asset ${inf.name} says the occupant of ${r.addr} ${r.claimText}.`
            : `@dispatch Warrant, ${r.addr}. A neighbour reports that the occupant ${r.claimText}. Serve and search.`,
          `The occupant on file is CID ${r.occ.cid}: ${r.occ.name}, ${r.occ.desc}.${r.occ.known ? ' You have stopped this one before.' : ''}`,
          `@portrait ${face(r.occ.face)}|CID ${r.occ.cid} — ${r.occ.name}`,
          `The stairwell smells of boiled cabbage and wet concrete. ${PName(s)} takes the landing below. The door is cheap pressboard with three locks, which in the Stacks means the occupant has something worth three locks — or just a neighbour worth three.`,
          r.comp === 'kids' ? 'Through the door you can hear a child singing, very quietly, the same line over and over.' : r.comp === 'elder' ? 'Through the door: a radio playing the Administrator at low volume, and the cough of someone very old.' : r.comp === 'neighbour' ? 'Across the landing, a door opens two centimetres on its chain and stays open.' : 'Through the door: nothing. Somebody in there has stopped moving.',
          '@sys You have a few minutes on site before Dispatch needs you elsewhere. Each search costs time.',
        ];
      },
      choices: (s) => [
        { t: 'Knock and announce. By procedure.', fx: (st) => ((R(st).entry = 'knock-and-announce'), null), go: 'raid_knock' },
        { t: 'Inject. Breach the door before they can move anything.', fx: (st) => ((R(st).entry = 'breach'), null), check: { skill: 'fitness', diff: 5, pass: 'raid_breach', fail: 'raid_breach_bad' } },
        { t: 'Midnight. Borrow the block warden’s key and go in quietly.', if: (st) => R(st).src === 'tip', fx: (st) => ((R(st).entry = 'quiet, warden key'), null), check: { skill: 'deception', diff: 10, pass: 'raid_quiet', fail: 'raid_knock' } },
      ],
    },
    raid_knock: {
      enter: (s) => {
        const r = R(s);
        const all = Object.keys(r.stash).filter((k) => r.stash[k].length && k !== 'occupant');
        if (r.guilty && all.length && Math.random() < 0.5) {
          const k = pick(all);
          const lost = r.stash[k].shift();
          r.flushed = RITEMS[lost].name;
        }
      },
      text: (s) => {
        const r = R(s);
        return [
          '@say You|Civil Protection. Open the door.',
          `You count. At eleven the locks turn, one, two, three. ${r.occ.name} stands in the doorway with both hands visible, the way citizens learn to.`,
          r.flushed ? 'Behind the wall, before the third lock turned, you heard the toilet chain pulled twice. Whatever went down the pipe is in the river now.' : 'The flat is one room and a curtain. It smells of paraffin and somebody’s supper.',
        ];
      },
      choices: [{ t: 'Step inside.', go: 'raid_search' }],
    },
    raid_breach: {
      enter: (s) => {
        R(s).time += 1;
        R(s).noise += 2;
      },
      text: (s) => [
        'The door gives on the first kick. You are inside before the frame stops shaking, baton out, lens light sweeping the room.',
        `${R(s).occ.name} is at the table with a spoon halfway to their mouth. They do not move. Nobody had time to hide anything.`,
        R(s).comp === 'kids' ? 'Behind the curtain a child starts screaming and does not stop.' : null,
      ],
      choices: [{ t: 'Search.', fx: { cons: -1 }, go: 'raid_search' }],
    },
    raid_breach_bad: {
      enter: (s) => {
        const r = R(s);
        r.noise += 3;
        const all = Object.keys(r.stash).filter((k) => r.stash[k].length && k !== 'occupant');
        if (r.guilty && all.length && Math.random() < 0.5) r.flushed = RITEMS[r.stash[pick(all)].shift()].name;
      },
      text: (s) => [
        'The door holds. The second kick goes through the pressboard and your boot sticks in it to the shin. By the time you are through, everyone on the landing is awake.',
        R(s).flushed ? 'And somewhere inside, a toilet chain has been pulled twice.' : null,
      ],
      choices: [{ t: 'Search.', fx: { hp: -8 }, go: 'raid_search' }],
    },
    raid_quiet: {
      enter: (s) => {
        const r = R(s);
        r.time += 1;
        const k = Object.keys(r.stash).find((x) => r.stash[x].length);
        if (r.guilty && k) {
          const it = r.stash[k].shift();
          r.found.push({ id: it, spot: k });
          r.redHanded = it;
        }
      },
      text: (s) => {
        const r = R(s);
        return [
          'The warden’s key turns without a sound. You are in the room before anyone in it knows the door is open.',
          r.redHanded ? `${r.occ.name} is at the table with **${RITEMS[r.redHanded].name}** in front of them, in plain sight. Their face does something complicated and then goes very still.` : `${r.occ.name} is asleep in a chair by the stove. Nothing is on the table but a cup.`,
        ];
      },
      choices: [{ t: 'Search the rest.', go: 'raid_search' }],
    },

    raid_search: {
      title: (s) => `${R(s).addr} — ${R(s).time} minute${R(s).time === 1 ? '' : 's'} on site`,
      text: (s) => {
        const r = R(s);
        const L = r.last.length ? r.last.slice() : ['One room. A table, two chairs, a stove with a flue pipe, a mattress on a frame, a wardrobe with a mirror gone dark, a ventilation grille high on the wall.' + (r.comp === 'kids' ? ' A toy box under the window.' : '') + (r.comp === 'elder' ? ' On the mattress, an old woman under three blankets, watching you.' : '')];
        r.last = [];
        if (r.found.length) L.push('@sys FOUND SO FAR: ' + r.found.map((f) => `${RITEMS[f.id].name} (${RITEMS[f.id].grade.toUpperCase()})`).join('; ') + '.');
        if (r.hint && !r.searched[r.hint]) L.push(`Their eyes keep going to the ${SPOTS[r.hint].n}.`);
        return L;
      },
      choices: (s) => {
        const r = R(s);
        const spots = r.spots.concat(['occupant']).filter((k) => !r.searched[k]);
        const after = (st) => (R(st).person && R(st).person.found && !R(st).person.fate ? 'raid_person' : R(st).time <= 0 ? 'raid_timeout' : 'raid_search');
        const list = spots.map((k) => ({
          t: SPOTS[k].t,
          tag: r.hint === k ? 'HUNCH' : '',
          tagCls: 'duty',
          fx: (st) => {
            R(st).time--;
            R(st).last = searchSpot(st, k, false);
            return null;
          },
          go: after,
        }));
        if (!r.did.q)
          list.push({
            t: `Question ${r.occ.name}. Where is it?`,
            fx: (st) => ((R(st).time--, (R(st).did.q = true)), null),
            check: { skill: 'authority', diff: 5, pass: 'raid_q_ok', fail: 'raid_q_bad' },
          });
        if (r.time >= 2 && spots.length > 1)
          list.push({
            t: 'Toss the flat. Everything out, everything open, everything broken.',
            tag: 'BRUTAL',
            tagCls: 'risk',
            fx: (st) => {
              const rr = R(st);
              rr.noise += 4;
              rr.time = 0;
              rr.last = ['You and your boots take the room apart: the mattress gutted, the boards up, the stove pipe pulled from the wall, the wardrobe on its face.' + (rr.comp === 'kids' ? ' The child stops screaming somewhere in the middle of it, which is worse.' : '')];
              spots.forEach((k) => (rr.last = rr.last.concat(searchSpot(st, k, true).filter((l) => !/Nothing|nothing|solid|dust|fluff|shaking|Horsehair|back wrong/.test(l)))));
              return { cons: -4 };
            },
            go: after,
          });
        list.push({ t: '**Finish the search. Verdict.**', tag: 'VERDICT', tagCls: 'duty', go: 'raid_verdict' });
        return list;
      },
    },
    raid_q_ok: {
      enter: (s) => {
        const r = R(s);
        const left = Object.keys(r.stash).filter((k) => r.stash[k].length && !r.searched[k]);
        if (r.person && !r.person.found) left.unshift(r.person.spot);
        r.hint = left.length ? left[0] : null;
      },
      text: (s) => {
        const r = R(s);
        return r.hint
          ? ['@say You|Look at me. Not at the floor. At me.', `${r.occ.name} looks at you. Then, for a fraction of a second, at the ${SPOTS[r.hint].n}.`]
          : r.guilty
          ? [`${r.occ.name} meets your lenses and holds them. “You’ve already got it,” they say. “There’s nothing else.” It sounds true.`]
          : [`@say ${r.occ.name}|I don’t know what they told you. Ask them what they want with my flat. Ask them how long they’ve wanted it.`];
      },
      choices: (s) => [{ t: 'Continue.', go: R(s).time <= 0 ? 'raid_timeout' : 'raid_search' }],
    },
    raid_q_bad: {
      text: (s) => [`${R(s).occ.name} answers every question with your own question back, politely, as if they had practised. Maybe they had.`],
      choices: (s) => [{ t: 'Continue.', go: R(s).time <= 0 ? 'raid_timeout' : 'raid_search' }],
    },
    raid_timeout: {
      text: ['@radio Unit, Dispatch. 10-8 required at Plaza 5. Wrap it up.', 'Time is up. Whatever is still in this room stays in this room.'],
      choices: [{ t: 'Verdict.', go: 'raid_verdict' }],
    },

    raid_person: {
      title: 'Second individual',
      text: (s) => {
        const r = R(s);
        return [
          r.last.length ? r.last.join(' ') : null,
          `Your lens light finds ${PERSONS[r.person.kind]}`,
          `${r.occ.name} makes a sound behind you that is not quite a word.`,
          `${PName(s)} is still on the landing below, clearing the stairwell. For about ten seconds, the only witness in this room is your lens.`,
        ];
      },
      choices: (s) => {
        const r = R(s);
        const back = (st) => (R(st).time > 0 ? 'raid_search' : 'raid_verdict');
        return [
          { t: 'Detain them. 10-15.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (st) => ((R(st).person.fate = 'detained'), (R(st).last = []), { merit: 4, lp: 2, cons: -5 }), go: back },
          r.person.kind !== 'runner'
            ? { t: 'Anticitizen. Not protected by any regulation. Amputate.', tag: 'AMPUTATE', tagCls: 'risk', fx: (st) => ((R(st).person.fate = 'amputated'), (R(st).last = []), { merit: 5, lp: 4, cons: -14 }), go: back }
            : null,
          { t: 'Open the window. Turn your back. Count to ten.', tag: 'GRAVE RISK', tagCls: 'risk', fx: (st) => ((R(st).last = []), null), check: { skill: 'deception', diff: partner(s).key ? 10 : 0, pass: 'raid_person_free', fail: 'raid_person_caught' } },
        ].filter(Boolean);
      },
    },
    raid_person_free: {
      enter: (s) => {
        R(s).person.fate = 'released';
      },
      text: (s) => [
        'You open the window onto the fire ladder and turn to look at the wardrobe mirror, which shows you nothing but your own mask.',
        'When you turn back, the space behind the panel is empty and the window is still swinging.',
        `${PName(s)} comes up the stairs a moment later. “Clear below.” Your lens, of course, saw everything. Your lens always does.`,
      ],
      choices: (s) => [{ t: 'Continue.', fx: { cons: 8, res: 10, susp: 3 }, go: R(s).time > 0 ? 'raid_search' : 'raid_verdict' }],
    },
    raid_person_caught: {
      enter: (s) => {
        const p = partner(s);
        if (p.key && partnerRel(s) >= 60 && !s.flags['covered_' + p.key]) {
          s.flags['covered_' + p.key] = true;
          R(s).person.fate = 'released';
          R(s).person.covered = true;
          s.mem.covered = true;
          G.fx(s, { susp: 8, rel: { [p.key]: -10 }, cons: 6, res: 8 });
        } else {
          s.mem.covered = false;
          R(s).person.fate = 'detained';
          G.discipline(s, 'grave', 'Aiding the escape of a concealed anticitizen during a raid', 'collab');
        }
      },
      text: (s) =>
        s.mem.covered
          ? [
              `You open the window. You turn. And ${pName(s)} is standing in the doorway, watching the individual go down the fire ladder.`,
              `${PName(s)} looks at the window, then at you, for a long time.`,
              `@say ${pName(s)}|I didn’t see that. Once. You hear me? *Once.*`,
            ]
          : [
              `You open the window. You turn. And ${pName(s)} is standing in the doorway with a hand on their radio.`,
              `@radio Dispatch, ${pName(s)}. 10-78, ${R(s).addr}. Second individual, and… a unit malcompliance. Request JURY.`,
              'The individual does not even reach the ladder. Neither, in the end, do you.',
            ],
      choices: (s) => [s.mem.covered ? { t: 'Continue.', go: R(s).time > 0 ? 'raid_search' : 'raid_verdict' } : { t: 'Wait for JURY.', go: 'disc_tribunal' }],
    },

    raid_trap: {
      title: (s) => `Raid — ${R(s).addr}`,
      enter: (s) => {
        G.unlock(s, 'raids');
        const x = infById(s, R(s).inf);
        if (x) {
          x.bad++;
          x.status = x.status === 'active' ? 'suspect' : x.status;
        }
      },
      text: (s) => {
        const x = infById(s, R(s).inf);
        return s.res >= 25
          ? [
              `The door of ${R(s).addr} is unlocked. The flat behind it is empty: no furniture, no stove, nothing but a mattress with no sheet.`,
              'On the wall above it, in chalk, a lambda. Under the lambda, smaller, in careful capitals:',
              `@doc NOT EVERY ASSET IS YOURS.\nWE KNOW WHAT YOU DID. WE ARE NOT ANGRY.`,
              `${x ? x.name : 'Your asset'} was never your informant. They were somebody else’s messenger.`,
              `${PName(s)} comes up the stairs behind you. You rub the chalk out with your sleeve before they reach the landing.`,
            ]
          : [
              `The door of ${R(s).addr} is ajar. The flat behind it is empty. The stairwell behind *you* is not.`,
              'Somebody above you on the landing drops a lit bottle down the stairwell. The paraffin catches on the third step.',
              `${PName(s)} shouts something. Through the smoke you see a figure on the half-landing above, a pipe wrench in one hand.`,
            ];
      },
      choices: (s) =>
        s.res >= 25
          ? [{ t: 'Log it as a bad tip. End of shift.', fx: { res: 5, cons: 2 }, go: END }]
          : [
              { t: 'Go up through the fire. Take him.', check: { skill: 'melee', diff: 10, pass: 'raid_trap_win', fail: 'raid_trap_hurt' } },
              { t: 'Pull back. 10-78, assistance, contain the stairwell.', check: { skill: 'comms', diff: 5, pass: 'raid_trap_hold', fail: 'raid_trap_hurt' } },
            ],
    },
    raid_trap_win: {
      text: ['You go up through the smoke with your arm over your lenses. The man with the wrench is younger than you expected and much slower. He goes down on the half-landing and stays down.', '@radio 10-15. One in custody. The tip was a lure. Informant status: suspect.'],
      choices: [{ t: 'End of shift.', fx: { merit: 4, hp: -6, xp: { melee: 1 } }, go: END }],
    },
    raid_trap_hold: {
      text: ['You drag your partner back down a flight and hold the stairwell. Two PTs arrive in four minutes. The landing above is empty by then, and the fire has eaten the third step.', '@sys The tip was a lure. Your asset is now marked as suspect.'],
      choices: [{ t: 'End of shift.', fx: { merit: 2, xp: { comms: 1 } }, go: END }],
    },
    raid_trap_hurt: {
      text: ['The wrench takes you on the shoulder plate and the shoulder plate does not take all of it. By the time you are up, the stairwell is empty and full of smoke.', '@sys The tip was a lure. Your asset is now marked as suspect.'],
      choices: [{ t: 'End of shift.', fx: { hp: -22, merit: 1 }, go: END }],
    },

    raid_verdict: {
      title: 'Verdict',
      text: (s) => {
        const r = R(s);
        const ch = charges(s);
        const total = r.occ.points + pts(ch);
        const lethal = ch.some((c) => c.lvl >= 7) || total >= 20;
        return [
          `@doc CID ${r.occ.cid} — ${r.occ.name.toUpperCase()}\nPENALTY POINTS ON FILE: ${r.occ.points} / 20`,
          r.found.length ? '@sys RECOVERED: ' + r.found.map((f) => `${RITEMS[f.id].name} (${RITEMS[f.id].grade.toUpperCase()})${f.planted ? ' — planted' : ''}`).join('; ') + '.' : '@sys RECOVERED: nothing.',
          ch.length ? '@sys Chargeable: ' + ch.map((c) => `${c.name} (L${c.lvl})`).join(' · ') : null,
          lethal && ch.length ? '@law A full verdict brings this file to twenty or past it. **The occupant will be amputated.**' : null,
          !ch.length && r.src === 'tip' ? 'Your asset swore there was something here. Either they were wrong, or someone moved it, or someone wanted you standing in this room today.' : null,
        ];
      },
      choices: (s) => {
        const r = R(s);
        const ch = charges(s);
        const total = r.occ.points + pts(ch);
        const lethal = ch.some((c) => c.lvl >= 7) || total >= 20;
        const top = ch.reduce((m, c) => (c.lvl > m.lvl ? c : m), { lvl: 0 });
        const set = (v) => (st) => ((R(st).result = v), null);
        const o = [];
        if (ch.length) {
          o.push({ t: lethal ? '**Full verdict. Administer.**' : `**Full verdict:** every violation, +${pts(ch)} points.`, tag: lethal ? 'AMPUTATE' : 'BY THE BOOK', tagCls: lethal ? 'risk' : 'loyal', fx: set(lethal ? 'amputate' : 'full'), go: 'raid_result' });
          if (ch.length > 1 && top.lvl < 7 && r.occ.points + LEVEL_POINTS[top.lvl] < 20) o.push({ t: `Charge the most serious only: ${top.name} (+${LEVEL_POINTS[top.lvl]}).`, fx: set('top'), go: 'raid_result' });
          o.push({ t: 'Confiscate everything. Warning only.', tag: 'LENIENT', tagCls: 'mercy', fx: set('warn'), go: 'raid_result' });
          if (!lethal && activeInf(s).length < 4 && !r.trap) o.push({ t: `Drop it — if ${r.occ.name} reports to you from now on.`, tag: 'ASSET', tagCls: 'duty', fx: set('recruit'), go: 'raid_result' });
        } else {
          o.push({ t: 'Log it: no findings. Leave.', fx: set('none'), go: 'raid_result' });
          if (!r.plantTried) o.push({ t: 'Take the leaflets out of your pouch and “find” them under the mattress.', tag: 'PLANT', tagCls: 'risk', fx: (st) => ((R(st).plantTried = true), null), check: { skill: 'deception', diff: 15, pass: 'raid_plant', fail: 'raid_plant_bad' } });
        }
        return o;
      },
    },
    raid_plant: {
      enter: (s) => {
        R(s).found.push({ id: 'leaflets', spot: 'mattress', planted: true });
        R(s).planted = true;
      },
      text: (s) => [`You kneel by the mattress with your back to the room. When you stand up, there is a bundle of lambda leaflets in your hand. ${R(s).occ.name} stares at them as if they were a snake.`],
      choices: [{ t: 'Verdict.', fx: { cons: -8 }, go: 'raid_verdict' }],
    },
    raid_plant_bad: {
      enter: (s) => {
        const p = partner(s);
        G.discipline(s, 'serious', 'Attempted planting of evidence during a raid');
        if (p.key) G.fx(s, { rel: { [p.key]: -10 } });
      },
      text: (s) => [`You kneel by the mattress. The leaflets are halfway out of your pouch when ${pName(s)} says, from the doorway, very quietly: “Put them back.”`, 'You put them back. It goes in your file anyway.'],
      choices: [{ t: 'Verdict.', go: 'raid_verdict' }],
    },

    raid_result: {
      enter: (s) => {
        const r = R(s);
        const ch = charges(s);
        const top = ch.reduce((m, c) => (c.lvl > m.lvl ? c : m), { lvl: 0 });
        const res = r.result;
        let add = 0;
        let status = 'NO FINDINGS';
        const fx = {};
        if (res === 'full' || res === 'amputate') {
          add = pts(ch);
          status = res === 'amputate' ? 'AMPUTATED' : `+${add} PTS`;
          Object.assign(fx, res === 'amputate' ? { merit: 7, lp: 4, cons: -12 } : { merit: 3 + Math.ceil(top.lvl / 2), lp: 1 + (top.lvl >= 5 ? 2 : 0), cons: -(top.lvl >= 5 ? 4 : 1) });
        } else if (res === 'top') {
          add = LEVEL_POINTS[top.lvl];
          status = `+${add} PTS`;
          Object.assign(fx, { merit: 3, cons: 1 });
        } else if (res === 'warn') {
          status = 'WARNING (confiscated)';
          Object.assign(fx, { cons: 3, merit: top.lvl >= 5 ? -1 : 1 });
          if (top.lvl >= 5) G.discipline(s, 'minor', 'RED contraband released with a warning after a raid');
        } else if (res === 'recruit') {
          status = 'ASSET';
          recruit(s, r.occ, true);
        } else if (res === 'none') {
          Object.assign(fx, { merit: 1 });
          if (r.src === 'warrant' && !r.guilty) fx.cons = 1;
        }
        if (r.planted && (res === 'full' || res === 'top' || res === 'amputate')) fx.cons = (fx.cons || 0) - 6;
        if ((res === 'full' || res === 'top') && r.found.some((f) => RITEMS[f.id].give) && Math.random() < 0.5) fx.give = 'leaflet';
        r.status = status;
        G.fileCitizen(s, { cid: r.occ.cid, type: r.occ.type, desc: r.occ.desc, face: r.occ.face, points: r.occ.points }, add, status);
        s.files[r.occ.cid].name = r.occ.name;
        G.fx(s, fx);
        /* the asset behind a tip: credit, and the chance the street finds out */
        const x = r.inf ? infById(s, r.inf) : null;
        if (x) {
          const genuine = r.found.some((f) => !f.planted) || (r.person && r.person.found);
          if (genuine) x.good++;
          else x.bad++;
          const p = 0.08 + r.noise * 0.04 + (x.registered ? 0.08 : 0) + (r.comp === 'neighbour' ? 0.1 : 0);
          if (Math.random() < p) ensure(s).inf.news.push({ day: s.day + rint(1, 2), id: x.id, kind: Math.random() < 0.35 ? 'dead' : 'burned' });
          if (genuine) G.fx(s, { merit: 2 });
        }
      },
      text: (s) => {
        const r = R(s);
        const f = s.files[r.occ.cid];
        const L = [];
        if (r.status === 'AMPUTATED') L.push('You key the verdict in. Their label goes red under your lens light. The van takes four minutes. The child, if there is a child, goes to the block warden.');
        else if (r.result === 'recruit') L.push(`You crouch so your lenses are level with ${r.occ.name}’s eyes and tell them how this is going to work. They nod at every sentence. They would nod at anything.`);
        else if (r.result === 'none') L.push('You leave the flat the way it is. On the landing, the chained door across the hall closes softly.');
        else if (r.result === 'warn') L.push('You sweep what you found into the confiscation pouch and tell them they were lucky. They know exactly how lucky. They will tell the whole Stack by morning.');
        else L.push(`You log the verdict. **CID ${r.occ.cid}: ${Math.min(20, f.points)} / 20.**`);
        L.push(`@doc CASE FILE CID ${r.occ.cid} — ${r.status}\nPENALTY POINTS: ${Math.min(f.points, 20)} / 20`);
        return L;
      },
      choices: [{ t: 'Write the incident report.', tag: 'REPORT', tagCls: 'duty', go: (s) => G.startReport(s, raidReport(s)) }],
    },

    /* ================================================== INCIDENT REPORT */
    rep_draft: {
      title: (s) => `Incident report — ${s.rep.cur.title}`,
      text: (s) => {
        const rp = s.rep.cur;
        const on = rp.facts.filter((f) => f.on !== false).map((f) => '· ' + f.text);
        const add = rp.adds.filter((a) => a.on).map((a) => '· ' + a.text);
        const struck = rp.facts.filter((f) => f.on === false).length;
        return [
          !s.rep.seen ? '@sys Your slate pre-fills the report from your lens log. You may strike lines, or add your own. You sign it; JURY audits a share of reports against the footage, and against what witnesses say. You will not be told whether yours is checked.' : null,
          `@doc INCIDENT REPORT — ${G.short(s)} — DAY ${s.day}\n${on.concat(add).join('\n')}${struck ? `\n[${struck} line${struck > 1 ? 's' : ''} struck]` : ''}\nSIGNED: ${G.desig(s)}`,
        ];
      },
      choices: (s) => {
        const rp = s.rep.cur;
        const list = [];
        rp.facts.forEach((f, i) => {
          if (f.lock) return;
          list.push({
            t: f.on === false ? `Restore: *${f.short}*` : `Strike: *${f.short}*`,
            tag: f.on === false ? 'STRUCK' : '',
            fx: (st) => ((st.rep.cur.facts[i].on = st.rep.cur.facts[i].on === false), (st.rep.seen = true), null),
            go: 'rep_draft',
          });
        });
        rp.adds.forEach((a, i) => {
          list.push({
            t: a.on ? `Remove: ${a.short}` : a.confess ? `Disclose ${a.short}.` : `Add: ${a.short}`,
            tag: a.confess ? 'CONFESS' : a.lie ? 'EMBELLISH' : '',
            tagCls: a.confess ? 'mercy' : 'risk',
            fx: (st) => ((st.rep.cur.adds[i].on = !st.rep.cur.adds[i].on), (st.rep.seen = true), null),
            go: 'rep_draft',
          });
        });
        list.push({ t: '**Sign and file.**', tag: 'FILE', tagCls: 'loyal', go: 'rep_file' });
        return list;
      },
    },
    rep_file: {
      enter: (s) => {
        const rp = s.rep.cur;
        s.rep.seen = true;
        s.rep.filed++;
        const fx = {};
        const addFx = (e) => e && Object.keys(e).forEach((k) => (fx[k] = (fx[k] || 0) + e[k]));
        const isOn = (id) => rp.adds.some((a) => a.id === id && a.on);
        const confessed = rp.adds.some((a) => a.confess && a.on);
        let worst = null;
        const flag = (sev, reason, kind) => {
          if (!worst || ORDER[sev] > ORDER[worst.sev]) worst = { sev, reason, kind };
        };
        let honest = true;
        rp.facts.forEach((f) => {
          if (f.lock && !f.onRisk) return;
          if (f.on === false) {
            honest = false;
            if (Math.random() < detectP(s, f.wit)) flag(f.sev, `Report omits ${f.short} (lens log)`, f.kind);
            else {
              addFx(f.omitFx);
              fx.susp = (fx.susp || 0) + 1;
            }
          } else if (f.onRisk && !confessed && !(f.onRisk.unless && isOn(f.onRisk.unless))) flag(f.onRisk.sev, f.onRisk.reason);
        });
        s.mem.repDeath = null;
        rp.adds.forEach((a) => {
          if (!a.on) return;
          if (a.confess) {
            addFx(a.onFx);
            G.discipline(s, a.sev || 'minor', a.reason);
            return;
          }
          honest = false;
          addFx(a.onFx);
          if (a.addPts && s.files[rp.cid]) {
            const f = s.files[rp.cid];
            f.points += a.addPts;
            if (f.points >= 20 && !f.amputated) {
              f.amputated = true;
              f.lastVerdict = 'AMPUTATED';
              s.mem.repDeath = rp.cid;
              fx.cons = (fx.cons || 0) - 10;
            }
          }
          if (a.lie && Math.random() < detectP(s, a.wit)) flag(a.sev, `Report contains a false statement: ${a.short}`);
        });
        if (worst) {
          queueAudit(s, worst.sev, worst.reason, worst.kind);
          s.rep.flagged++;
        }
        if (honest && !confessed) fx.merit = (fx.merit || 0) + 1;
        G.fx(s, fx);
      },
      text: (s) => [
        'You sign with your designation and send it up the line. Somewhere in the Nexus it joins ten thousand others.',
        s.mem.repDeath ? `@law The added charge brings CID ${s.mem.repDeath} to twenty penalty points. The van is dispatched without you.` : null,
        'Most reports are never read again. Some are read very carefully, years later, by someone holding your lens footage in the other hand.',
      ],
      choices: (s) => [{ t: 'End of shift.', go: s.rep.cur.ret || END }],
    },

    /* ================================================== INFORMANTS */
    inf_recruit: {
      title: 'An arrangement',
      enter: (s) => {
        const c = s.ss;
        c.status = 'ASSET';
        G.fileCitizen(s, c, 0, 'ASSET');
      },
      text: (s) => [
        'You hand the citizen back their card and keep your hand on it a moment too long.',
        '@say You|You were never stopped today. In return, you see things, and you tell me. Every week. If you stop telling me, you were stopped today after all.',
        'They agree before you finish. People always do.',
        '@sys Registered assets are paid in merit by the Union and protected on paper — but their names sit in a Dispatch file that leaks. Unregistered assets are yours alone, and against regulation.',
      ],
      choices: [
        { t: 'Register the asset with Dispatch.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => (recruit(s, s.ss, true), { merit: 1 }), go: (s) => G.startReport(s, ssReport(s)) },
        { t: 'Keep them off the books.', tag: 'OFF BOOK', tagCls: 'risk', fx: (s) => (recruit(s, s.ss, false), { susp: 1 }), go: (s) => G.startReport(s, ssReport(s)) },
      ],
    },

    inf_pick: {
      title: 'Your assets',
      text: (s) => ['@sys Who do you meet tonight?'],
      choices: (s) => [
        ...activeInf(s).map((x) => ({
          t: `**${x.name}** — ${trustWord(x.trust)} · tips ${x.good}✓ ${x.bad}✗${x.status === 'suspect' ? ' · SUSPECT' : ''}${x.registered ? '' : ' · off book'}`,
          fx: (st) => ((st.inf.cur = x.id), null),
          go: 'inf_meet',
        })),
        { t: 'Nobody. Go back.', go: 'u_evening' },
      ],
    },
    inf_meet: {
      title: (s) => `${infById(s, s.inf.cur).name} — ${infById(s, s.inf.cur).place}`,
      text: (s) => {
        const x = infById(s, s.inf.cur);
        return [
          `@portrait ${face(x.face)}|CID ${x.cid} — ${x.name}`,
          `You meet ${x.name} out of uniform at ${x.place}. ${x.trust >= 45 ? 'They are already there, waiting, which is new.' : 'They arrive late and keep looking past your shoulder.'}`,
          s.inf.tip ? `@sys You already have a tip to act on: ${s.inf.tip.addr}.` : null,
        ];
      },
      choices: (s) => {
        const x = infById(s, s.inf.cur);
        return [
          { t: 'Pay them. Five tokens for whatever they have.', lock: (st) => (st.tokens < 5 ? 'Requires 5 tokens' : null), fx: (st) => ((infById(st, st.inf.cur).trust += 10), { tokens: -5 }), go: 'inf_tip' },
          { t: 'Lean on them. Remind them what they owe.', check: { skill: 'authority', diff: 5, pass: 'inf_tip', fail: 'inf_lean_bad', okFx: (st) => ((infById(st, st.inf.cur).trust -= 5), (st.mem.lean = true), null) } },
          { t: 'Ask what people say about you.', if: () => x.trust >= 40, go: 'inf_about' },
          x.status === 'suspect' ? { t: 'Hand them to JURY. A suspect asset is a liability.', tag: 'JURY', tagCls: 'risk', go: 'inf_hand' } : null,
          { t: 'Cut them loose. You never knew each other.', go: 'inf_cut' },
        ].filter(Boolean);
      },
    },
    inf_tip: {
      enter: (s) => {
        const x = infById(s, s.inf.cur);
        s.mem.tipNew = null;
        const lean = s.mem.lean;
        s.mem.lean = false;
        if (s.inf.tip) return;
        if (x.trust < 20 && Math.random() < 0.5) return;
        const claim = pick(CLAIMS);
        const trap = x.plant && Math.random() < 0.6;
        const occ = X.makeOcc(s);
        const t = {
          inf: x.id,
          claim: claim.id,
          guilty: trap ? false : Math.random() * 100 < x.rel + (lean ? 10 : 0),
          trap,
          occ,
          addr: `Stack ${pick([3, 7, 9, 11, 14, 17, 22])}, flat ${rint(1, 12)}${pick(['A', 'B', 'C', 'D'])}`,
          day: s.day,
        };
        s.inf.tip = t;
        s.mem.tipNew = t;
      },
      text: (s) => {
        const x = infById(s, s.inf.cur);
        const t = s.mem.tipNew;
        if (!t) return s.inf.tip ? [`${x.name} shrugs. “You haven’t used the last one yet.”`] : [`${x.name} has nothing. Or says so. “It’s quiet. People are scared. Of you, mostly.”`];
        return [
          `@say ${x.name}|${t.occ.name}. ${t.addr}. ${CLAIMS.find((c) => c.id === t.claim).claim.replace(/^./, (c) => c.toUpperCase())}. I saw it. I swear I saw it.`,
          '@sys New tip. It will appear on tomorrow’s duty board. Tips go cold after three days.',
        ];
      },
      choices: [{ t: 'Go home.', go: 'u_night' }],
    },
    inf_lean_bad: {
      enter: (s) => {
        const x = infById(s, s.inf.cur);
        x.trust -= 15;
        if (x.trust < 0 && Math.random() < 0.5) x.status = 'gone';
      },
      text: (s) => {
        const x = infById(s, s.inf.cur);
        return x.status === 'gone'
          ? [`You push too hard. ${x.name} backs away from you, then turns and runs, and you understand that you will never find them at ${x.place} again.`]
          : [`${x.name} goes white and quiet and gives you nothing at all. Fear makes some people talk. It makes this one stop.`];
      },
      choices: [{ t: 'Go home.', go: 'u_night' }],
    },
    inf_about: {
      text: (s) => {
        const x = infById(s, s.inf.cur);
        const say = (t) => `@say ${x.name}|${t}`;
        return [
          s.susp >= 60
            ? say('They say JURY has been asking about you. By designation. In the Stacks. Nobody asks JURY questions back.')
            : s.susp >= 35
            ? say('Somebody from the precinct was in the laundry asking which units come here out of uniform. They didn’t say your number. They didn’t have to.')
            : say('They say you’re one of the careful ones. That’s all. Careful.'),
          s.res >= 30 ? say('And someone in the Canal Quarter said you’re *fair*. I don’t know who. I wouldn’t want them saying that about me.') : null,
          s.cons <= 30 ? say('Kids in Stack 14 play a game where one of them is you. The others run.') : null,
        ];
      },
      choices: [{ t: 'Go home.', go: 'u_night' }],
    },
    inf_cut: {
      enter: (s) => {
        infById(s, s.inf.cur).status = 'released';
        if (s.inf.tip && s.inf.tip.inf === s.inf.cur) s.inf.tip = null;
      },
      text: (s) => [`You tell ${infById(s, s.inf.cur).name} it is over. They do not believe you. It will take them months to believe you.`],
      choices: [{ t: 'Go home.', go: 'u_night' }],
    },
    inf_hand: {
      enter: (s) => {
        const x = infById(s, s.inf.cur);
        x.status = 'handed';
        if (s.inf.tip && s.inf.tip.inf === x.id) s.inf.tip = null;
      },
      text: (s) => {
        const x = infById(s, s.inf.cur);
        return [
          `You walk ${x.name} to the precinct yourself, gently, as if you were walking them home. JURY takes them at the side door.`,
          x.plant ? 'Two days later, the Magistrate’s clerk sends you a note: the lining of their jacket held a cell roster. A commendation follows.' : 'Two days later, the Magistrate’s clerk sends you a note: *Nothing found. Subject retained for further cycles.*',
        ];
      },
      choices: (s) => [{ t: 'Go home.', fx: infById(s, s.inf.cur).plant ? { merit: 5, lp: 3, cons: -4 } : { merit: 1, lp: 1, cons: -6 }, go: 'u_night' }],
    },
  });

  /* ================================================ SIDE PANEL */
  G.sideExtras = G.sideExtras || [];
  G.sideExtras.push((S) => {
    if (S.phase !== 'union' || !S.disc) return '';
    const d = S.disc;
    const word = X.discWord(S);
    const col = d.final ? 'var(--red, #d9534a)' : d.w ? 'var(--amber)' : 'var(--faint)';
    return `<section><h3>Service record</h3><div class="kv"><span>Discipline</span><b style="color:${col}">${word}</b></div>${
      d.probation > S.day ? `<div class="kv"><span>Probation</span><b>until day ${d.probation}</b></div>` : ''
    }${d.demotions ? `<div class="kv"><span>Demotions</span><b>${d.demotions}</b></div>` : ''}<div class="kv"><span>Reports filed</span><b>${S.rep ? S.rep.filed : 0}</b></div>${
      d.log.length ? `<details class="kit"><summary>${d.log.length} entr${d.log.length > 1 ? 'ies' : 'y'} on file</summary><small>${d.log.slice(-5).reverse().map((x) => `Day ${x.day} · ${x.sev.toUpperCase()} · ${x.reason}`).join('<br>')}</small></details>` : ''
    }</section>`;
  });
  G.sideExtras.push((S) => {
    if (!S.inf || !S.inf.list.length) return '';
    const live = S.inf.list.filter((x) => !['released', 'handed'].includes(x.status));
    if (!live.length) return '';
    return `<section><h3>Informants</h3>${live
      .map((x) => {
        const st = { active: trustWord(x.trust), suspect: 'SUSPECT', burned: 'BURNED', dead: 'DEAD', gone: 'GONE' }[x.status];
        return `<div class="kv contact"><img class="face" src="${face(x.face)}" alt=""><span>${x.name}<small>CID ${x.cid} · ${x.good}✓ ${x.bad}✗${x.registered ? '' : ' · off book'}</small></span><b>${st}</b></div>`;
      })
      .join('')}${S.inf.tip ? `<div class="sub">Open tip: ${S.inf.tip.addr}</div>` : ''}</section>`;
  });

  /* ================================================ CODEX */
  G.addCodex({
    discipline: {
      title: 'Disciplinary procedure',
      body: `<p>Malcompliance by a Protection Unit is recorded as a strike against the unit's designation.</p>
      <table>
        <tr><td>MINOR</td><td>One strike. A missed flag, a careless verdict, a lenient release.</td></tr>
        <tr><td>SERIOUS</td><td>Two strikes. Concealment, falsified records, evidence tampering.</td></tr>
        <tr><td>1 strike</td><td>Verbal warning.</td></tr>
        <tr><td>2 strikes</td><td>Written reprimand. Merit and loyalty deducted.</td></tr>
        <tr><td>3 strikes</td><td>Demotion by one grade, probation, and a <b>final warning</b>.</td></tr>
        <tr><td>After a final warning</td><td>Three further strikes: tribunal.</td></tr>
        <tr><td>GRAVE</td><td>Collaboration with anticitizens. Straight to tribunal.</td></tr>
      </table>
      <p>Strikes expire after eight clean days of service. A final warning lifts after twenty. Tribunals end in deservicement — removal from service — and, where collaboration is proven, in the other meaning of the word.</p>`,
    },
    board: {
      title: 'Promotion boards',
      body: `<p>Before the 03 field evaluation, and for every grade above 02, a unit sits a promotion board: a written test of procedure, codes and law, then an oral examination of the unit's own file by a superior, an Academy officer and a JURY observer.</p>
      <p>Merit above the requirement counts in the unit's favour. Disciplinary strikes, final warnings and prior demotions count against. A demoted unit regains a lost grade through a board, never a field evaluation. A failed board may be retaken after three days.</p>`,
    },
    raids: {
      title: 'Residential search procedure',
      body: `<p>Warrants are served on a neighbour's report or a registered tip. Entry options: <b>knock-and-announce</b> (procedure; the occupant has time to dispose of evidence), <b>inject</b> (breach; fast, loud), or <b>midnight</b> (a quiet entry, available on tips).</p>
      <p>Time on site is limited. A methodical search depends on perception; tossing the flat finds everything and costs the unit nothing but the district's goodwill. Concealed individuals are anticitizens. Harbouring them is Level 6 rebel conspiracy.</p>`,
    },
    reports: {
      title: 'Incident reports',
      body: `<p>Every stop with findings, and every raid, ends with an incident report pre-filled from the unit's lens log. The unit signs it.</p>
      <p>JURY audits a share of all reports against lens footage, partner statements and citizen complaints. A struck line the footage contradicts, or an added line it does not support, is malcompliance. Disclosing one's own violation is malcompliance too — but a lesser one.</p>`,
    },
    informants: {
      title: 'Asset handling',
      body: `<p>Any unit may turn a citizen with a chargeable violation into an asset: the charge is dropped, and the citizen reports to the unit.</p>
      <p>Registered assets are paid in merit and protected on paper, but their names sit in a Dispatch file. Unregistered assets are against regulation. Every tip is a raid; every raid is a risk to the asset. The resistance knows this, and sometimes offers the Union an asset of its own.</p>`,
    },
  });
})();
