/* AIRWATCH — the airborne branch of Overwatch, threaded through existing scenes.
   Lore lives in the codex entry "airwatch" (codex.js); chapter 3 mentions it in its own text.
   Everything here is an extension: no original scene is rewritten. */
(function () {
  /* insert a paragraph after the first paragraph that matches `re` (or at the end) */
  const after = (lines, re, add) => {
    const i = lines.findIndex((l) => typeof l === 'string' && re.test(l));
    lines.splice(i >= 0 ? i + 1 : lines.length, 0, add);
    return lines;
  };
  const unlock = (s) => G.unlock(s, 'airwatch');

  /* chapter 1 — the first sociostatus: the first time the player sees a gunship */
  G.extend('b_socio', {
    after: unlock,
    text: (lines) =>
      after(
        lines,
        /^@dispatch/,
        'Above the Works, low enough that the windows of the Stacks hum with it, an Airwatch gunship hangs over the smoke from the packing plant: a hard dark shape with a cyan line across its nose and a searchlight that moves like it is reading. Granite does not look up. You learn, that morning, not to look up.'
      ),
  });

  /* the rail-yard night sweep — a searchlight far overhead */
  G.extend('d_rail_1', {
    text: (lines) => after(lines, /forest of dead freight cars/, 'Far above the yard, a pale searchlight walks slowly along the river and back. Airwatch. It never comes closer. It never has to.'),
  });

  /* chapter 2, UNION — relocation day at the D4 yards */
  G.extend('c2_u4', {
    after: unlock,
    text: (lines) => {
      lines.push('Over the yard, a Shrike gunship holds station with its searchlight on the train, the rotor wash flattening the families’ coats against them. Nobody runs. Nobody has ever outrun the knock.');
      return lines;
    },
  });

  /* chapter 3 hub: Airwatch flies the curfew; first meeting unlocks the record */
  ['c3_start', 'c3_0', 'c3_4'].forEach((id) => G.extend(id, { after: unlock }));
})();
