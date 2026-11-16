/* CHAPTER ELEVEN — "The Siege". All divisions. Two acts.
   ACT I (five days): City 17 has fallen. A driverless freight train comes south full of empty
   Overwatch armour; the Spire's core flickers; FREEMAN is chalked on the Stacks. Vigil readies the
   Nexus. You prepare it (each preparation is a resource in act II), and old acquaintances come to
   you one by one: Mira, Brask and Warden Ostrova, the deserter from the coast road, Morow on the
   Sector radio, Ledger.
   ACT II (one night, twelve hours): THE SIEGE OF THE NEXUS. Four positions — the main gate, the
   forecourt, the canal tunnel, the roof — each with integrity. Every hour you post four teams and
   choose one action (hold, resupply, treat the wounded, counter-attack, radio the Sector, and, if
   you allowed it, the gas). The hour resolves; between hours the people from act I come back.
   The forecourt falling, or any two positions, and the Nexus is lost.
   EPILOGUE: dawn, the reckoning, and your SERVICE RECORD — your whole career on one sheet.
   You remain Civil Protection throughout. Freeman is named on walls and by the resistance only. */
(function () {
  const { adv, set } = G.chapter({ n: 11, stages: [[1, 'evening', 'c11_1'], [2, 'morning', 'c11_2'], [3, 'evening', 'c11_3'], [4, 'morning', 'c11_4'], [5, 'evening', 'c11_5']] });
  const pick = G.pick;
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const C = (s) => s.c11;
  const has = (s, k) => s.rel[k] !== undefined;
  const team = (s) => (s.squad && s.squad.formed && G.squadActive ? G.squadActive(s) : []);
  const VIGIL = '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil';
  const prep = (k, v) => (s) => ((C(s).prep[k] = (C(s).prep[k] || 0) + v), null);
  const deserter = (s) => (s.c10 && s.c10.deserter && s.c10.desFate === 'freed' ? s.c10.deserter : null);
  const contact = (s) => (s.c7 && s.c7.who ? s.c7.who : { key: 'katya', name: 'Katya', img: 'katya' });

  G.extend('u_board', {
    text: (lines, s) => {
      if (s.c11 && !s.c11.done && s.c11.stage >= 1 && !s.c11.siege) lines.splice(1, 0, '@dispatch ALL UNITS: City 17 is not answering. Overwatch garrison C9 withdrawn. The Nexus is to be held.');
      return lines;
    },
  });

  /* ================================================================ THE SIEGE */
  const POS = {
    gate: { name: 'Main gate', base: 19, desc: 'the forcefield and steel doors on the Nexus steps' },
    forecourt: { name: 'Forecourt', base: 22, desc: 'the colonnade and the old courthouse hall behind the gate' },
    tunnel: { name: 'Canal tunnel', base: 15, desc: 'the service tunnel from the D3 canals into the cellars' },
    roof: { name: 'Roof & mast', base: 9, desc: 'the radio mast and the landing pad' },
  };
  const PK = Object.keys(POS);
  const HOURS = 12;
  const clock = (h) => `${String((21 + h - 1) % 24).padStart(2, '0')}:00`;
  const ramp = (h) => [0.6, 0.8, 1, 1.2, 1.35, 1.45, 1.45, 1.35, 1.2, 1, 0.8, 0.6][h - 1] || 0.6;
  const SG = (s) => C(s).siege;
  const breached = (g) => PK.filter((k) => g.pos[k].hp <= 0);

  G.sgStart = (s) => {
    const p = C(s).prep;
    const leads = team(s).map((m) => m.name);
    s.c11.siege = {
      hour: 1,
      pos: {
        gate: { hp: 100 + (p.fort || 0) },
        forecourt: { hp: 100 + Math.round((p.fort || 0) / 2) },
        tunnel: { hp: p.flood ? 100 : 80, mod: p.flood ? 0.5 : 1 },
        roof: { hp: 100 },
      },
      teams: ['BLUE-1', 'BLUE-2', 'BLUE-3', 'VIGIL'].map((id, i) => ({ id, lead: i === 3 ? 'Vigil’s guard' : leads[i] || pick(['"Ash"', '"Pike"', '"Slate"']), pos: PK[i], hurt: false })),
      ammo: 10 + (p.ammo || 0),
      med: 3 + (p.med || 0),
      wounded: 0,
      lost: 0,
      civ: p.shelter ? 40 : 0,
      civHurt: 0,
      helpAt: null,
      gas: !!p.gas,
      gasUsed: false,
      log: [],
    };
  };

  function resolveHour(s, action) {
    const g = SG(s);
    const h = g.hour;
    const lines = [];
    /* the action */
    if (action === 'resupply') {
      g.ammo += 4;
      lines.push('Runners bring up crates from the armoury cage. Four more loads of ammunition.');
    } else if (action === 'treat') {
      const n = Math.min(g.med, g.teams.filter((t) => t.hurt).length);
      g.teams.filter((t) => t.hurt).slice(0, n).forEach((t) => (t.hurt = false));
      g.med -= n;
      lines.push(n ? `HELIX patches up ${n} team${n > 1 ? 's' : ''} in the ward on the second floor.` : 'Nobody in the ward can be sent back out. The medical stores are empty.');
    } else if (action && action.startsWith('push_')) {
      const k = action.slice(5);
      g.pos[k].pushed = 2;
      lines.push(`You lead a sally out from ${POS[k].name.toLowerCase()}. For two hours, they will think twice there.`);
      if (Math.random() < 0.35) {
        const t = g.teams.find((x) => x.pos === k) || g.teams[0];
        t.hurt = true;
        g.wounded++;
        lines.push(`${t.id} comes back with wounded.`);
      }
    } else if (action === 'radio') {
      if (g.pos.roof.hp <= 0) lines.push('The mast is gone. Nobody hears you.');
      else if (g.helpAt) lines.push('The Sector acknowledges again. It is coming, it says. It does not say when.');
      else {
        g.helpAt = Math.min(HOURS, h + 3 + Math.floor(Math.random() * 3));
        lines.push(`The Sector answers. An Overwatch transport is coming from the north. ETA ${clock(g.helpAt)}.`);
      }
    } else if (action === 'gas') {
      g.gasUsed = true;
      g.civHurt += 40;
      PK.forEach((k) => (g.pos[k].pushed = 3));
      lines.push('VECTOR opens the valves on Level 4. The grey comes out of the vents along the steps and the forecourt and lies there, heavy, in the rain. Then the screaming. Then nothing, for a long time.');
    }
    /* the hour */
    PK.forEach((k) => {
      const p = g.pos[k];
      if (p.hp <= 0) return;
      const here = g.teams.filter((t) => t.pos === k);
      let threat = POS[k].base * ramp(h) * (p.mod || 1) * (0.7 + Math.random() * 0.6);
      if (k === 'forecourt' && g.pos.gate.hp <= 0) threat *= 1.6;
      if (k === 'forecourt' && g.pos.tunnel.hp <= 0) threat *= 1.3;
      if (p.pushed) (threat *= 0.4), p.pushed--;
      if (g.helpAt && h >= g.helpAt) threat *= 0.55;
      let def = 0;
      here.forEach((t) => {
        def += (t.hurt ? 6 : 12) * (g.ammo > 0 ? 1 : 0.4);
        if (g.ammo > 0) g.ammo -= 0.5;
      });
      const dmg = Math.max(0, Math.round(threat - def));
      p.hp = Math.max(0, p.hp - dmg * 2);
      if (here.length && threat > 15 && Math.random() < 0.38) {
        const t = pick(here);
        if (t.hurt && Math.random() < 0.5) {
          g.lost++;
          lines.push(`@sys ${t.id}: ${t.lead} is carried in from the ${POS[k].name.toLowerCase()} and does not get up again.`);
          if (s.squad && s.squad.formed && G.squadHit) G.squadHit(s, true, 'the siege of the Nexus');
        } else if (!t.hurt) {
          t.hurt = true;
          g.wounded++;
        }
      }
      lines.push(`${POS[k].name}: ${dmg ? `pressed hard, integrity ${Math.max(0, Math.round(p.hp))}` : 'held'}${here.length ? '' : ' (nobody posted)'}.`);
      if (p.hp <= 0) lines.push(`@sys ${POS[k].name.toUpperCase()} BREACHED.`);
    });
    if (g.helpAt && h === g.helpAt) lines.push('@sys The Overwatch transport comes in low over the river, guns turning. The pressure on every position eases.');
    if (g.civ && (g.pos.forecourt.hp < 40 || g.pos.gate.hp <= 0) && Math.random() < 0.5) {
      const n = 3 + Math.floor(Math.random() * 6);
      g.civHurt += n;
      lines.push(`@sys The lobby: ${n} of the sheltering families hurt when the forecourt shakes.`);
    }
    g.ammo = Math.max(0, Math.round(g.ammo));
    g.log = lines;
    g.hour++;
  }
  G.sgResolve = resolveHour;
  const fallen = (s) => {
    const g = SG(s);
    return g.pos.forecourt.hp <= 0 || breached(g).length >= 2;
  };

  function board(s) {
    const g = SG(s);
    const dr = g.draft;
    const col = (hp) => (hp <= 0 ? '#d9534a' : hp < 40 ? '#e2a83f' : '#6fbf73');
    return `<div class="sg-board">
      <div class="sg-top"><b>${clock(g.hour)}</b> · Hour ${g.hour} of ${HOURS} <span>Ammo ${g.ammo} · Medical ${g.med} · Wounded teams ${g.teams.filter((t) => t.hurt).length} · Lost ${g.lost}${g.helpAt ? ` · Help ETA ${clock(g.helpAt)}` : ''}</span></div>
      <div class="sg-pos">${PK.map((k) => {
        const p = g.pos[k];
        const here = g.teams.filter((t, i) => dr[i] === k);
        return `<div class="sg-p${p.hp <= 0 ? ' down' : ''}"><b>${POS[k].name}</b><small>${POS[k].desc}</small><div class="bar"><span style="width:${Math.min(100, Math.max(0, p.hp))}%;background:${col(p.hp)}"></span></div><i>${p.hp <= 0 ? 'BREACHED' : here.length ? here.map((t) => t.id).join(', ') : 'unmanned'}</i></div>`;
      }).join('')}</div>
      ${g.teams.map((t, i) => `<div class="sg-team" data-i="${i}"><span><b>${t.id}</b> ${t.lead}${t.hurt ? ' <em>wounded</em>' : ''}</span><span class="sg-row">${PK.map((k) => `<button class="cmd-b${dr[i] === k ? ' on' : ''}" data-v="${k}" ${g.pos[k].hp <= 0 ? 'disabled' : ''}>${POS[k].name.split(' ')[0]}</button>`).join('')}</span></div>`).join('')}
      <div class="sub">Post four teams, then choose the hour’s action. Wounded teams hold half as well. Without ammunition every team holds half as well. The forecourt falling, or any two positions, and the Nexus is lost.</div>
    </div>`;
  }
  G.afterRender.push((sc, id, block) => {
    if (id !== 'sg_hour') return;
    const s = G.state();
    const g = SG(s);
    const host = document.createElement('div');
    const draw = () => (host.innerHTML = board(s));
    draw();
    host.onclick = (e) => {
      const b = e.target.closest('[data-v]');
      if (!b || b.disabled) return;
      g.draft[+b.closest('.sg-team').dataset.i] = b.dataset.v;
      draw();
    };
    block.insertBefore(host, block.querySelector('.choices'));
  });
  const act = (a) => (s) => {
    const g = SG(s);
    g.teams.forEach((t, i) => (t.pos = g.draft[i]));
    resolveHour(s, a);
    return null;
  };
  /* story interludes between hours */
  const INTERLUDE = { 3: 'sg_i_gate', 5: 'sg_i_lobby', 7: 'sg_i_admin', 9: 'sg_i_tunnel', 11: 'sg_i_gas' };
  const next = (s) => {
    const g = SG(s);
    if (fallen(s)) return 'sg_fall';
    if (g.hour > HOURS) return 'sg_dawn';
    const i = INTERLUDE[g.hour];
    if (i && !g['i' + g.hour]) {
      g['i' + g.hour] = true;
      if (G.scenes[i].when === undefined || G.scenes[i].when(s)) return i;
    }
    return 'sg_hour';
  };
  G.sgNext = next;

  const sgScenes = {
    sg_hour: {
      title: (s) => `The Nexus — ${clock(SG(s).hour)}`,
      enter: (s) => {
        const g = SG(s);
        g.draft = g.teams.map((t) => (g.pos[t.pos].hp > 0 ? t.pos : PK.find((k) => g.pos[k].hp > 0)));
      },
      text: (s) => [
        SG(s).hour === 1 ? '@img assets/img/env/e04-nexus.webp|The Nexus' : null,
        pick(['Rain on the steps. Somewhere in the Stacks a building is burning; you can see it reflected in the wet stone of the forecourt.', 'The forcefield over the gate flickers every time something hits it. The hum is in your teeth.', 'A voice on a loudhailer from the plaza, reading out names. Units’ names. Yours, once.', 'The lights in the Nexus go out and come back on, and the screens in the hall show the Administrator for half a second and then nothing.']),
      ],
      choices: (s) => {
        const g = SG(s);
        const worst = PK.filter((k) => g.pos[k].hp > 0).sort((a, b) => g.pos[a].hp - g.pos[b].hp)[0];
        return [
          { t: 'Hold. Every team where you posted it.', fx: act('hold'), go: 'sg_res' },
          { t: 'Send runners to the armoury cage: more ammunition.', fx: act('resupply'), go: 'sg_res' },
          { t: 'Pull the wounded teams through the HELIX ward.', lock: () => (g.med <= 0 ? 'No medical stores left' : !g.teams.some((t) => t.hurt) ? 'No wounded teams' : null), fx: act('treat'), go: 'sg_res' },
          { t: `Lead a sally from the ${POS[worst].name.toLowerCase()}.`, tag: 'RISK', tagCls: 'risk', fx: act('push_' + worst), go: 'sg_res' },
          { t: 'Radio the Sector for Overwatch.', tag: 'RADIO', tagCls: 'duty', lock: () => (g.pos.roof.hp <= 0 ? 'The mast is down' : null), fx: act('radio'), go: 'sg_res' },
          g.gas && !g.gasUsed ? { t: 'Order VECTOR to release the gas.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (st) => (act('gas')(st), { cons: -40, lp: 6, res: -30 }), go: 'sg_res' } : null,
        ].filter(Boolean);
      },
    },
    sg_res: {
      title: (s) => `The Nexus — ${clock(SG(s).hour - 1)}, report`,
      text: (s) => ['@sys HOUR REPORT', ...SG(s).log],
      choices: [{ t: 'Next hour.', go: (s) => next(s) }],
    },

    /* interludes */
    sg_i_gate: {
      title: 'The main gate — 23:00',
      text: (s) => {
        const m = has(s, 'mira') && !s.flags.mira_gone;
        return [
          `At the front of the crowd on the steps, close enough to the forcefield to see your lenses, ${m ? 'Mira' : contact(s).name}. ${C(s).warned ? 'You promised to stay away from the Nexus tonight. You lied, and now you both know it.' : 'Holding a bed sheet with a lambda painted on it, and looking straight at you.'}`,
          `@say ${m ? 'Mira' : contact(s).name}|Open it. Let us into the hall. Nobody else has to die on these steps tonight.`,
        ];
      },
      choices: [
        { t: 'Keep the field up. Look away.', fx: { cons: -4 }, go: 'sg_hour' },
        { t: 'Drop the field for a moment, long enough to pull her inside — her alone.', tag: 'RISK', tagCls: 'risk', fx: (s) => ((SG(s).pos.gate.hp -= 15), (C(s).pulled = true), { cons: 6, susp: 6 }), go: 'sg_i_gate2' },
        { t: 'Tell the gate team to fire over their heads.', fx: (s) => ((SG(s).pos.gate.pushed = 1), { cons: -2 }), go: 'sg_hour' },
      ],
    },
    sg_i_gate2: { text: (s) => [`For four seconds the field is down. Something hits the doors hard. Then ${has(s, 'mira') ? 'Mira' : contact(s).name} is inside, on the floor of the hall, soaked, alive, and the field is up again. She does not thank you. She does not let go of your sleeve.`], choices: [{ t: 'Back to the board.', go: 'sg_hour' }] },
    sg_i_lobby: {
      title: 'The lobby — 01:00',
      text: (s) => [
        has(s, 'ostrova') ? '@portrait assets/img/portraits/ostrova.webp|Block Warden Ostrova' : null,
        SG(s).civ ? `Warden Ostrova has brought ${SG(s).civ} people from Stack 9 into the Nexus lobby, as you agreed. Children asleep on the marble. The forecourt shakes every few minutes, and the lobby is right behind it.` : 'Warden Ostrova is at the side door with forty people from Stack 9: families, the old, the Ilić girls. Their block is burning. She asks for the lobby.',
      ],
      choices: (s) =>
        SG(s).civ
          ? [
              { t: 'Move them down to the cellars. The tunnel is closer, but the forecourt is worse.', fx: (st) => ((SG(st).civ = 0), (SG(st).pos.tunnel.mod = (SG(st).pos.tunnel.mod || 1) * 1.15), { cons: 2 }), go: 'sg_hour' },
              { t: 'Leave them where they are.', go: 'sg_hour' },
            ]
          : [
              { t: 'Let them in.', tag: 'MERCY', tagCls: 'mercy', fx: (st) => ((SG(st).civ = 40), (st.rel.ostrova = (st.rel.ostrova || 0) + 20), { cons: 6 }), go: 'sg_hour' },
              { t: 'No. The Nexus is not a shelter.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (st) => ((st.rel.ostrova = (st.rel.ostrova || 0) - 30), { cons: -8, lp: 2 }), go: 'sg_hour' },
            ],
    },
    sg_i_admin: {
      title: 'The Administrator’s residence — 03:00',
      text: ['@portrait assets/img/portraits/administrator.webp|The City Administrator', 'The City Administrator comes down from the top floor in his slate coat with a bag in each hand. He wants the landing pad cleared and a team to take him up to it when the transport comes. He says it to the wall behind you.', '@say The Administrator|I signed the surrender in the fourth hour. I will not sign another one.'],
      choices: [
        { t: 'Give him a team. Take them off the line for two hours.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => { const g = SG(s); const t = g.teams.find((x) => x.pos === 'roof') || g.teams[3]; t.pos = 'roof'; g.pos.roof.pushed = 2; C(s).admin = 'escorted'; return { lp: 4, merit: 3 }; }, go: 'sg_hour' },
        { t: '“There is no transport, Administrator. There is only the night.”', fx: (s) => ((C(s).admin = 'stayed'), { cons: 3 }), go: 'sg_i_admin2' },
      ],
    },
    sg_i_admin2: { text: ['He looks at you for the first time. Then he puts the bags down, takes off his coat, and asks for a rifle. Nobody laughs. Vigil gives him one.'], choices: [{ t: 'Back to the board.', fx: (s) => ((SG(s).pos.forecourt.hp += 10), {}), go: 'sg_hour' }] },
    sg_i_tunnel: {
      title: 'The canal tunnel — 05:00',
      when: (s) => !!deserter(s) || s.res >= 15,
      text: (s) => [
        `In the dark of the tunnel, under a white flag made of a shirt, ${deserter(s) || contact(s).name}. ${deserter(s) ? 'The deserter you let go on the coast road.' : ''}`,
        `@say ${deserter(s) || contact(s).name}|I can take the cellar fighters back down the tunnel. All of them, before dawn. If you leave the tunnel to us and keep the gas in its tanks.`,
      ],
      choices: [
        { t: 'Agree. Pull your team out of the tunnel.', tag: 'RISK', tagCls: 'risk', fx: (s) => { const g = SG(s); g.pos.tunnel.mod = 0.15; g.gas = false; C(s).tunnelDeal = true; g.teams.filter((t) => t.pos === 'tunnel').forEach((t) => (t.pos = 'forecourt')); return { cons: 6, susp: 8 }; }, go: 'sg_hour' },
        { t: 'Refuse. Arrest them if they come closer.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { lp: 2 }, go: 'sg_hour' },
      ],
    },
    sg_i_gas: {
      title: 'Level 4 — 07:00',
      when: (s) => SG(s).gas && !SG(s).gasUsed,
      text: ['@sys SECTOR CHANNEL — MOROW', '@say Morow|You have the gas. If the forecourt goes, use it. If it looks like going, use it. The Sector will not lose the Nexus to a mob. That is an order, officer, and it has my name on it as well as yours.'],
      choices: [
        { t: 'Acknowledge.', fx: { lp: 2 }, go: 'sg_hour' },
        { t: 'Have VECTOR close the valves for good.', tag: 'MERCY', tagCls: 'mercy', fx: (s) => ((SG(s).gas = false), (C(s).gasRefused = true), { cons: 6, susp: 6 }), go: 'sg_hour' },
      ],
    },

    sg_fall: {
      checkpoint: true,
      title: 'The Nexus — fallen',
      enter: (s) => {
        C(s).outcome = 'fallen';
      },
      text: (s) => [
        `At ${clock(SG(s).hour - 1)} the ${SG(s).pos.forecourt.hp <= 0 ? 'forecourt' : 'second position'} goes. You hear it before you see it: a roar in the hall, a door that does not hold, boots on the marble. Vigil gives the order you have never heard her give: fall back.`,
        'You get out through the motor pool with what is left of your teams and the wounded over your shoulders. Behind you, in the rain, someone is painting a lambda on the Nexus doors.',
      ],
      choices: [{ t: 'Dawn.', go: 'sg_dawn' }],
    },
    sg_dawn: {
      checkpoint: true,
      title: 'Dawn over City 9',
      enter: (s) => {
        const c = C(s);
        const g = SG(s);
        c.outcome = c.outcome || 'held';
        c.done = true;
        c.stage = 9;
        s.time = 'Morning';
        s.day++;
        if (c.outcome === 'held') G.fx(s, { merit: 20, lp: 4 });
        else G.fx(s, { merit: 5, hp: -15 });
        if (g.civHurt >= 30) G.fx(s, { cons: -10 });
        G.unlock(s, 'servicerecord');
      },
      text: (s) => {
        const c = C(s);
        const g = SG(s);
        return [
          VIGIL,
          `@doc SIEGE OF THE NEXUS — ${c.outcome === 'held' ? 'HELD' : 'FALLEN'}\nHOURS: ${Math.min(HOURS, g.hour - 1)} / ${HOURS}\nTEAMS LOST: ${g.lost}\nCIVILIANS HURT: ${g.civHurt}\nGAS: ${g.gasUsed ? 'RELEASED' : c.gasRefused ? 'REFUSED' : 'NOT USED'}`,
          c.outcome === 'held' ? '@say Vigil|It held. I did not think it would. Look at the forecourt, and then do not look at it again for a long time.' : '@say Vigil|The Nexus is theirs. The city is not, yet. We go on from the motor pool, and from the precincts, and from wherever we are standing.',
          g.gasUsed ? 'The forecourt is very quiet. VECTOR walks it in sealed suits with lamps, counting. You do not ask for the number. It is in your report anyway.' : null,
          c.pulled ? `${has(s, 'mira') ? 'Mira' : contact(s).name} is sitting on the steps of the ward with a blanket round her shoulders, watching the sun come up over the Stacks. She does not say anything to you. She moves along the step to make room.` : null,
          c.admin === 'stayed' ? 'The City Administrator is asleep in a chair in the hall with a rifle across his knees and a borrowed helmet on the floor beside him.' : c.admin === 'escorted' ? 'The landing pad is empty. No transport came for the Administrator. He sits in his residence with the bags still packed.' : null,
          '@radio …all cities… all cities… this is the Sector. City 17… [static]… Freeman… [static]',
          'It is the first time the Union’s own radio has said the name. Nobody in the hall says anything. Somebody switches the set off.',
        ];
      },
      choices: [{ t: 'Read your service record.', go: 'c11_record' }],
    },
  };

  /* ================================================================ SERVICE RECORD */
  const files = (s) => Object.values(s.files || {});
  G.careerRecord = (s) => {
    const f = files(s);
    const amp = f.filter((x) => x.amputated).length;
    const freed = f.filter((x) => /WARNING|RELEASED|NO FINDINGS|reduced/.test(x.lastVerdict || '')).length;
    const people = Object.keys(s.rel || {})
      .filter((k) => G.PEOPLE[k])
      .sort((a, b) => Math.abs(s.rel[b]) - Math.abs(s.rel[a]))
      .slice(0, 6)
      .map((k) => `${G.PEOPLE[k].name}: ${s.rel[k] >= 45 ? 'trusts you' : s.rel[k] >= 15 ? 'friendly' : s.rel[k] > -15 ? 'neutral' : s.rel[k] > -45 ? 'wary' : 'hostile'}`);
    const L = [];
    const ch = (n, t) => s['c' + n] && s['c' + n].done && L.push(`<tr><td>Ch. ${n}</td><td>${t}</td></tr>`);
    ch(3, s.c3 && s.c3.result === 'held' ? 'The long night: the dam held.' : 'The long night: the dam was opened.');
    ch(6, s.c6 && ({ stopped: 'The coal train was stopped.', ran: 'The coal train ran north.', air: 'You called the Shrike on the coal siding.', tagged: 'VEIL tagged the last wagon.', shielded: 'You stood between the train and the Shrike.' }[s.c6.train] || 'The railway.'));
    ch(7, s.c7 && ({ held: 'D5 rose; you held every stair.', broken: 'D5 rose; your line broke.', aside: 'D5 rose; your teams sat on the steps.', truce: 'D5 rose; you made a truce on a landing.', veil: 'D5 rose; you walked among them for VEIL.', armed: 'D5 rose; you opened the armoury.', split: 'D5 rose; half your team went up without you.' }[s.c7.night] || 'The night the screens went dark.'));
    ch(8, s.c8 && `The inspection: ${s.c8.verdict || '—'}${s.c8.consolDone ? `, and ${G.BLOCKS[s.c8.consolBlock] ? G.BLOCKS[s.c8.consolBlock].name : 'a block'} went north` : ''}.`);
    ch(9, s.c9 && `The drowned basements: ${s.c9.verdict || '—'}${s.c9.source ? ` (the source: ${s.c9.source})` : ''}.`);
    ch(10, s.c10 && `The coast road: ${s.c10.cleared} sectors cleared, ${s.c10.moved} moved on, ${s.c10.harmed} harmed.`);
    ch(11, s.c11 && `The siege of the Nexus: ${s.c11.outcome || '—'}${s.c11.siege && s.c11.siege.gasUsed ? ', and the gas' : ''}.`);
    const verdict = s.cons >= 65 ? 'Kept a conscience inside the uniform. It cost something, every time.' : s.cons <= 30 ? 'Did what the Union asked. Did it well. Did not look back.' : 'Did what had to be done, and sometimes what did not.';
    return `<div class="rec">
      <div class="rec-head"><b>${G.desig(s)}</b><span>${G.RANK_NAMES[s.rank]} · ${s.div || 'UNION'} · ${s.day} days in service</span></div>
      <table><tr><td>Citizens stopped</td><td>${(s.stats && s.stats.stops) || f.length}</td></tr><tr><td>Case files</td><td>${f.length}</td></tr><tr><td>Let go</td><td>${freed}</td></tr><tr><td>Amputated</td><td>${amp}</td></tr><tr><td>Merit</td><td>${s.merit}</td></tr><tr><td>Loyalty rating</td><td>${s.lp > 0 ? '+' : ''}${s.lp}</td></tr><tr><td>JURY file</td><td>${s.jf && s.jf.ev ? s.jf.ev.length + ' pages' : 'thin'}</td></tr></table>
      <h4>Your war</h4><table>${L.join('')}</table>
      <h4>People</h4><p>${people.join(' · ') || '—'}</p>
      <h4>Assessment</h4><p><i>${verdict}</i></p>
    </div>`;
  };
  G.showRecord = () => G.openModal('Service record', G.careerRecord(G.state()), 'record');
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('[data-record]')) G.showRecord();
  });

  /* ================================================================ STORY, ACT I */
  G.addScenes(sgScenes);
  G.addScenes({
    c11_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Eleven',
      enter: (s) => {
        s.chapter = 11;
        s.c11 = { stage: 0, next: s.day, startDay: s.day, prep: {}, done: false };
      },
      text: [
        '@big CHAPTER ELEVEN',
        '@sys ALL DIVISIONS · THE SIEGE',
        '@img assets/img/env/e42-sector-train.webp|D4 — the train from the north',
        'At 05:10 a freight train comes into the D4 yards from the north with no driver. Twelve wagons. In every one, stacked like firewood, the empty armour of Overwatch soldiers: helmets with dead lenses, plates without bodies in them.',
        'At 06:00 the cold cyan light in the Spire’s core flickers for the first time anyone can remember, and the broadcast screens go dark by themselves.',
        'By 07:00 there is chalk on every Stack in District 5. Not a lambda. A word. Seven letters, the same seven letters, on every wall: FREEMAN.',
      ],
      choices: [{ t: 'Report to Vigil.', go: 'c11_0' }],
    },
    c11_0: {
      title: 'The Nexus — operations room',
      text: [
        VIGIL,
        '@say Vigil|City 17 is not answering because there is nothing left in City 17 to answer. The Sector says hold. The Sector is a long way away.',
        '@say Vigil|When it comes, it comes here. The Nexus is the only building in this city that matters to both sides. I am giving you the defence of it. You have a few days. Spend them.',
        '@sys PREPARATION: what you do in the next days becomes what you have on the night.',
      ],
      choices: [
        { t: 'Strip the precinct armouries into the Nexus cage.', fx: adv(0, prep('ammo', 6)), go: 'u_board' },
        { t: 'Fortify the gate: sandbags, welded steel, a second field generator from GRID.', fx: adv(0, prep('fort', 30)), go: 'u_board' },
        { t: 'Stock the HELIX ward on the second floor.', fx: adv(0, prep('med', 3)), go: 'u_board' },
      ],
    },
    c11_1: {
      title: 'The barracks — evening',
      text: (s) => {
        const m = has(s, 'mira') && !s.flags.mira_gone;
        return m
          ? ['@portrait assets/img/portraits/mira.webp|Mira', 'Mira is waiting at the barracks gate, which nobody does. She has grown up while you were not looking.', '@say Mira|It’s in two days, or three. Everybody in the Stacks knows. Don’t be in the Nexus. Please. Say you won’t be in the Nexus.']
          : ['@portrait assets/img/portraits/halloran.webp|Halloran', 'Old Halloran is waiting at the barracks gate with his coat buttoned wrong.', '@say Halloran|They are coming for the Nexus, unit. Two nights, three. I am telling you because I am too old to watch another one of you die on those steps.'];
      },
      choices: [
        { t: '“I won’t be there.” You will be.', fx: adv(2, (st) => ((st.c11.warned = true), { cons: 2 })), go: 'u_night' },
        { t: '“I’ll be where I’m ordered to be.”', fx: adv(2, { lp: 1 }), go: 'u_night' },
        { t: 'Report the warning to Vigil.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, (st) => (prep('fort', 10)(st), (st.rel.mira !== undefined && (st.rel.mira -= 15)), { merit: 3, cons: -4 })), go: 'u_night' },
      ],
    },
    c11_2: {
      checkpoint: true,
      title: 'The Works — the ration plant',
      text: (s) => [
        '@portrait assets/img/portraits/brask.webp|Brask — CWU Supervisor',
        'Brask, the CWU supervisor from the dye floor, has a padlocked shed behind the ration plant with three months of medicine and rations in it. He is selling it. He offers you a share.',
        has(s, 'ostrova') ? 'On the way back, Warden Ostrova stops you on the bridge. If the Stacks burn, she asks, can her families shelter in the Nexus lobby?' : null,
      ],
      choices: (s) => [
        { t: 'Seize the shed for the Nexus. Brask goes to Level 4.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, (st) => (prep('med', 3)(st), { merit: 4, cons: 2 })), go: 'c11_2b' },
        { t: 'Take your share and say nothing.', tag: 'BRIBE', tagCls: 'risk', fx: adv(2, { tokens: 15, susp: 6, cons: -4 }), go: 'c11_2b' },
        { t: 'Seize it and give it to the Stack 9 families.', tag: 'MERCY', tagCls: 'mercy', fx: adv(2, (st) => ((st.rel.ostrova = (st.rel.ostrova || 0) + 15), { cons: 6, susp: 3 })), go: 'c11_2b' },
      ],
    },
    c11_2b: {
      text: (s) => [has(s, 'ostrova') ? '@say Ostrova|And the lobby, officer? If it comes?' : 'The bridge back to the Nexus is lined with people who already know where they will be on the night.'],
      choices: (s) =>
        has(s, 'ostrova')
          ? [
              { t: '“The lobby is yours if it comes.”', tag: 'MERCY', tagCls: 'mercy', fx: (st) => (prep('shelter', 1)(st), { cons: 4 }), go: 'u_board' },
              { t: '“The Nexus is not a shelter.”', fx: { lp: 1 }, go: 'u_board' },
            ]
          : [{ t: 'Back to the board.', go: 'u_board' }],
    },
    c11_3: {
      title: 'The canal culvert — night',
      text: (s) => {
        const d = deserter(s);
        return d
          ? [`${d} is waiting under the culvert by Lock 3, thinner than on the coast road. He has come back into the city.`, `@say ${d}|They are coming through the canal tunnel into the Nexus cellars. A lot of them. If you put your people in that tunnel, they die and so do mine. Flood it. Close it. Anything. I will take mine back if you give me a way.`]
          : [`A note under your door, in a hand you know: ${contact(s).name}’s. *The tunnel from the D3 canals into the Nexus cellars. That is where it will start. Close it, and fewer people die on both sides.*`];
      },
      choices: [
        { t: 'Have GRID flood the canal tunnel.', fx: adv(2, (st) => (prep('flood', 1)(st), { cons: 3 })), go: 'u_night' },
        { t: 'Leave the tunnel open and put a team in it. Let them come.', fx: adv(2, (st) => (prep('ammo', 2)(st), { lp: 2 })), go: 'u_night' },
        { t: 'Report the meeting to Ledger.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, { merit: 3, lp: 2, cons: -5 }), go: 'u_night' },
      ],
    },
    c11_4: {
      checkpoint: true,
      title: 'Level 4 — the Sector channel',
      text: [
        '@portrait assets/img/portraits/morow.webp|Sector Administrator Morow',
        '@say Morow|(on the Sector channel, very far away) VECTOR holds a reserve of suppression agent on Level 4. In the event of the Nexus being breached, it is to be released into the forecourt. I want your acknowledgement on the record, officer.',
        '@portrait assets/img/portraits/ledger.webp|"Ledger"',
        '@say Ledger|(afterwards, in the corridor) She wants your name on it so that it is not only hers. Whatever you say, I will be writing it down.',
      ],
      choices: [
        { t: 'Acknowledge. The gas is available on the night.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(1, (st) => (prep('gas', 1)(st), { lp: 4, merit: 3 })), go: 'u_board' },
        { t: 'Refuse in writing.', tag: 'RISK', tagCls: 'risk', fx: adv(1, { cons: 6, susp: 8, lp: -4 }), go: 'u_board' },
        { t: 'Acknowledge, and quietly ask VECTOR to keep the valves locked.', tag: 'DECEPTION', tagCls: 'risk', check: { skill: 'deception', diff: 10, pass: 'c11_4_ok', fail: 'c11_4_bad' } },
      ],
    },
    c11_4_ok: { text: ['Formalin listens to you with her hands folded, and says only: *“The valves have been stiff for years. It would take hours to open them.”*'], choices: [{ t: 'Back to the board.', fx: adv(1, { cons: 4, lp: 2 }), go: 'u_board' }] },
    c11_4_bad: { text: ['Formalin listens, and then picks up the phone to Level 4 while you are still in the room.'], choices: [{ t: 'Back to the board.', fx: adv(1, (st) => (prep('gas', 1)(st), { susp: 8 })), go: 'u_board' }] },
    c11_5: {
      checkpoint: true,
      title: 'The Nexus — 20:55',
      enter: (s) => {
        G.sgStart(s);
        s.time = 'Night';
      },
      text: (s) => {
        const p = C(s).prep;
        return [
          'At 20:55 every light in District 5 goes out at once. Then the canals. Then the Works. The only lights left in City 9 are the Spire, flickering, and the Nexus.',
          'From the Stacks comes the sound you heard on the night the screens went dark, but more of it, and closer, and this time it does not stop at the bottom of the stairs.',
          `@sys THE SIEGE OF THE NEXUS — twelve hours, 21:00 to 09:00. Ammunition ${SG(s).ammo}, medical ${SG(s).med}${p.fort ? ', the gate fortified' : ''}${p.flood ? ', the tunnel flooded' : ''}${p.shelter ? ', the lobby open to Stack 9' : ''}${p.gas ? ', the gas on Level 4' : ''}.`,
        ];
      },
      choices: [{ t: 'Take the board.', go: 'sg_hour' }],
    },
    c11_record: {
      checkpoint: true,
      title: 'Service record',
      text: (s) => ['@sys The precinct keeps a record of every unit. This is yours.', '@html ' + G.careerRecord(s)],
      choices: [{ t: 'Close the file.', go: 'c11_end' }],
    },
    c11_end: {
      checkpoint: true,
      title: 'End of Chapter Eleven',
      enter: (s) => {
        if (s.c11.endDay === undefined) s.c11.endDay = s.day;
      },
      text: (s) => [
        C(s).outcome === 'held' ? 'The Nexus stands. The city around it is a different city: half of it lit, half of it burning, all of it awake.' : 'The Nexus is gone. Civil Protection holds the precincts, the dam and the bridges. Nobody holds the city.',
        `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
        '@sys CHAPTER ELEVEN COMPLETE. Your service record is in the Roster. City 9’s story goes on.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    servicerecord: {
      title: 'Service records',
      body: '<p>Every unit has a service record: grade, division, days in service, the citizens it stopped, the files it kept, and a line for each night the city will remember. It can be read from the Roster.</p><p><button class="choice" data-record="1">Open your service record</button></p>',
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Service record').ids.push('servicerecord');
})();
