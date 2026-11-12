# City 9 // Civil Protection

A text roleplaying game set in the Half-Life universe, shortly before the events of Half-Life 2. You play an ordinary citizen of **City 09** who enlists in the **Combine Civil Authority (CCA)**, survives Basic Training and climbs the ranks, deciding along the way what kind of officer, and what kind of person, you become.

## Play

Open `index.html` in a browser. It needs no build step or server and works from `file://`.

- Click a choice or press **1–9**.
- **Dossier** shows your identity, rank, merit, skills, contacts and items. On mobile it's a drawer.
- **Codex** holds lore you've unlocked: the hierarchy, divisions, Overwatch, radio codes and more.
- **Menu** has the manual save slot, last checkpoint, export/import save codes and new game. The game autosaves after every scene.

## Systems

| System | How it works |
|---|---|
| Skills | Firearms, Melee & Restraint, Field Medicine, Conditioning, Perception, Radio & Protocol, Authority, Deception. Levels 0–6. Training sets them, and using them in checks raises them. |
| Skill checks | Some choices show `SKILL NN%`. The game rolls d100 against that chance: `40 + 12×level − difficulty`, with −10 when badly hurt. |
| Merit | Earned on duty. It unlocks field evaluations (05 → 04 at 25, 04 → 03 at 60). A failed evaluation costs merit. |
| Loyalty rating | How the Union sees you. Some divisions require it. |
| Hidden: Suspicion | Your file at JURY. At 100 you are *amputated*. Choices that raise it show `[ OBSERVED ]`. |
| Hidden: Conscience / Resistance | Track the kind of person you're becoming and how much the City 9 resistance trusts you. |
| Contacts | Mira (your sister), Tomas, Ilse, Rook, Granite, Halloran, the Tinker. Relationships change their scenes. |

## Structure (Chapter 1)

1. **Prologue**: character creation (background and motive), the last morning at home, the street, the recruitment interview and the implant.
2. **Basic Training**: pick 4 of 6 courses (range, melee, HELIX medicine, radio, canal run, JURY interrogation), a barracks night, and a final live raid on your own block.
3. **UNION service**: a daily duty board with 7 duties, each with a full first event and a routine version. Evenings are for Mira, Tomas, training or Bazaar Row. Story beats include Granite's warning, a JURY audit, sociostatus with Overwatch in command, Ilse's request, Tomas's theft, Rook's story and the resistance's offer.
4. **Promotions**: the 04 evaluation (ration truck ambush) and the 03 evaluation (antenna hardpoint), then **division selection** (UNION / HELIX / JURY / RAZOR / SPEAR, each with requirements).

Endings in this chapter: *Amputated*, *The River Remembers* (defect to the resistance), or reaching 03 and choosing a division, after which you can keep serving.

## Art

Reference art (helmet, division uniforms, armbands, emblems, flags) lives in `assets/img/`. It appears in scenes, in the Codex and as your division emblem in the Dossier. The prompts that produced it are in `docs/style-sheet.md`. In scene text, add an image with `'@img assets/img/file.jpg|Caption'`.

## Code

```
index.html            layout
css/style.css         terminal styling, responsive
js/engine.js          state, rendering, checks, effects, saves, sidebar
js/content/codex.js   lore entries
js/content/prologue.js
js/content/training.js
js/content/union.js   duty loop, evenings, Mira, infirmary, endings
js/content/duties.js  the seven duties
js/content/beats.js   story beats, evaluations, division select
```

Scenes are plain objects:

```js
G.addScenes({
  my_scene: {
    title: 'Somewhere',
    enter: (s) => { /* runs once on arrival; may return another scene id to redirect */ },
    text: (s) => ['Paragraph', '@say Name|Dialogue', '@dispatch Broadcast', '@radio Chatter', '@sys Note', '@doc Printout'],
    choices: [
      { t: 'Do a thing', fx: { merit: 2, cons: -3, rel: { mira: 5 } }, go: 'next_scene' },
      { t: 'Risky thing', check: { skill: 'deception', diff: 10, pass: 'ok_scene', fail: 'bad_scene' } },
      { t: 'Only if…', if: (s) => s.flags.something, lock: (s) => (s.tokens < 5 ? 'Not enough tokens' : null), go: 'x' },
    ],
  },
});
```

*Half-Life is a trademark of Valve Corporation. This is a non-commercial fan work with original writing and characters; it contains no assets from the games.*
