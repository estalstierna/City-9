# City 09 // Visual Style Sheet & Prompt Library

Promptbibliotek för att generera ett enhetligt referensark (och senare karaktärer och scener) till spelet. Själva prompterna är på engelska, eftersom bildmodeller följer engelska bäst. Förklaringarna är på svenska.

---

## Godkända referenser (Rev 1)

De genererade och godkända referensbilderna ligger i `assets/img/` och används i spelet. Bifoga dem som referens när du genererar nya bilder, så håller sig stilen.

| Fil | Innehåll |
|---|---|
| `helmet.jpg` | Hjälmen: vyer, aktiva linser, sprängskiss av filtret, standard och officer |
| `uniform-union.jpg` … `uniform-oa.jpg` | Uniformsark per division |
| `armbands.jpg` | Alla sex armband, platta och på arm |
| `emblems.jpg` + `emblems/*.png` | Divisionsemblem, helt ark och utklippta ikoner (256 px, transparent) |
| `flag-cca.jpg`, `flag-city09.jpg` | Flaggorna |
| `citizen-base.jpg`, `citizen-commended.jpg`, `citizen-watch.jpg` | Medborgarklädsel: bas, lojalist med utmärkelse, under bevakning |
| `portraits/*.jpg` (+ `-thumb.jpg`) | Porträtt: Mira, Halloran, Tomas, Ilse (800 px, plus 128 px miniatyrer till kontaktlistan) |

Avvikelser från prompterna som nu är kanon: HELIX-emblemets båge är **turkos** (inte vit). JURY:s ärmmärke på uniformsarket är sköldformat; själva emblemet är runt. Ilses ögonbrynsärr sitter på hennes högra ögonbryn (porträttet är kanon). Miras ransonsomslag föreställer en kyrka, inte ett tak.

---

## 0. Så använder du detta

1. **Bifoga referensbilderna** (hjälm, uniform, emblemet med dödskallen, propagandaaffischen) tillsammans med prompten om verktyget tillåter det:
   - ChatGPT/GPT-image: bifoga bilderna i samma meddelande som prompten.
   - Midjourney: använd `--sref <bild-url>` för stil och `--cref <bild-url>` för karaktär och uniform.
   - Stable Diffusion/Flux: använd IP-Adapter eller ControlNet med bilderna.
2. **Skriv inte "Half-Life", "Combine" eller "Metrocop" i prompten.** Många modeller blockerar eller förvränger varumärken. Prompterna nedan beskriver utseendet i stället, och det ger dessutom bättre kontroll.
3. **Arbetsordning:** generera först delarna var för sig (prompt 2–7), välj de bästa och kör sedan masterprompten (prompt 1) med dem som referenser. Bildmodeller klarar sällan sex detaljerade objekt perfekt i ett enda försök.
4. **Text i bilder:** be om text inom citattecken, t.ex. `"C9:D5"`. Fungerar det inte, generera utan text och lägg på den i efterhand (Photopea/Figma) med typsnittet nedan.
5. **Klistra in GLOBAL STYLE i varje prompt** så att allt får samma känsla.

---

## 1. Global style block (klistra in i varje prompt)

```
STYLE: gritty semi-realistic dystopian concept art, production design sheet quality,
Eastern-European brutalist occupation aesthetic, cold overcast lighting, desaturated
steel-grey and slate-blue palette with sharp cyan accents (#5FC8DD), worn and used
materials (scuffed ceramic, oiled leather, padded ballistic nylon, chipped enamel),
clean orthographic presentation on a neutral warm-grey paper background, subtle
film grain, crisp linework under painted rendering, labels in a condensed military
stencil typeface, small technical callout lines and measurement ticks, consistent
lighting from upper left, no lens flare, no motion blur.
```

**Negative prompt** (för SD, Flux och Midjourney `--no`):

```
cartoon, anime, chibi, cute, glossy plastic toy, neon cyberpunk city, futuristic sleek
armor, sci-fi helmet visor, skull face paint, blood, gore, watermark, logo of real
brands, extra limbs, distorted hands, misspelled text, blurry, low detail
```

### Typsnitt och grafik i spelet

| Användning | Typsnitt | Färg |
|---|---|---|
| Stenciltext (armband, flaggor) | Stencil / "Allerta Stencil" / "Black Ops One" | Off-white `#E8E6DF` |
| Terminaltext | Share Tech Mono | Cyan `#5FC8DD` |
| Brödtext | IBM Plex Sans | `#C9D4D8` |

---

## 2. Divisionsfärger och ikoner (kanon för spelet)

Divisionsfärgen sitter på **armbandet**, på emblemets **övre ringbåge** och som en tunn kant på axelpansaret. Rang visas som **silverstreck** på armbandet. Detta är nu också kanon i spelets text.

| Division | Färg | Hex | Emblemikon | Känsla |
|---|---|---|---|---|
| **UNION** | Civil Protection blue | `#2F6FB5` | Upright stunstick with two crackling arcs | Patrull, ordning, gatan |
| **HELIX** | Clinical white with teal trim | `#E9EEF0` / `#3FB8A8` | Stylised double helix forming a vertical caduceus-like strand | Sjukvård |
| **JURY** | Judgement crimson | `#A3262A` | Cracked human skull (som i referensbilden) | Militärpolis, förhör |
| **RAZOR** | Hardpoint gold | `#C9A13B` | Kite shield split by a single vertical blade | VIP- och hardpointskydd |
| **SPEAR** | Hazard orange | `#D9641E` | Spearhead piercing a broken hazard triangle | Offensiv, 404-zoner |
| **OA** (Officer Academy) | Command violet | `#6B4FA0` | Three ascending chevrons under a five-point star | Officersutbildning |

**Gemensam emblemram** (samma för alla divisioner, följer referensen):
- Yttre ring i borstat stål med fasade kanter.
- Övre tredjedelen av ringen är en **avskild båge i divisionsfärgen** (röd i JURY-referensen).
- En **spetsig nedåtriktad chevron**, ett skarpt "V" i stål, ligger centralt och bryter igenom ringen upptill.
- Bakom chevronen syns en **svag jordglob i trådnät (latitud/longitud)** i mörkt stål.
- I mitten en **rund medaljong** med divisionsikonen i ben-vit/silver relief.
- Smala vertikala nitade stag på båda sidor om chevronen.

**Rangstreck på armbandet:** RcT = inga streck · 05–01 = 1–5 tunna streck (05 = 1 … 01 = 5) · EpU = ett tjockt streck · OfC och uppåt = tjockt streck plus 1–3 små stjärnor.

---

## 3. PROMPT 1: MASTER REFERENCE SHEET (allt på en sida)

Använd landskap **16:9** eller **3:2**, högsta upplösningen. Bifoga alla referensbilder.

```
A single large production design reference sheet for a fictional dystopian police force
called "CIVIL PROTECTION — CITY 09", laid out like a professional video game art bible
page, everything neatly arranged in a grid with thin ruled borders, small numbered
section headers in condensed stencil type, and short technical annotations.

TOP BANNER: across the full width, the title "CIVIL PROTECTION // CITY 09 — VISUAL
REFERENCE" in off-white stencil letters on a charcoal strip, with a thin cyan rule
beneath it.

SECTION 1 — HELMET (top left, large): a full-head gas-mask helmet shown in four
orthographic views — front, three-quarter, profile, back. Off-white to pale bone-grey
ceramic shell with a smooth rounded skull dome and a subtle raised seam running from
forehead to crown; two large round eye openings with thick rubber rims and dark smoked
lenses (one additional small inset showing the lenses glowing pale cyan); a short
protruding cylindrical respirator canister at the mouth with concentric ridged rings
and a perforated centre disc; a compact black radio headset clamped over the left ear
with a short stub antenna and a coiled wire running to the collar; dark grey fabric
balaclava visible at the neck seam; light scuffs and hairline scratches. Callouts:
"CERAMIC SHELL", "OPTIC LENS (ACTIVE = CYAN)", "FILTER CANISTER", "RADIO HEADSET".

SECTION 2 — UNIFORM (centre, large): full-body front view and back view of a standing
officer wearing the helmet, neutral A-pose. Dark charcoal/navy padded tactical jacket
with a tall stand-up collar and centre zip; over it a quilted ballistic vest with thick
horizontal padded ribs across the abdomen; a white vertical rectangular double-bar
patch on the left chest; light grey reinforced shoulder panels; right sleeve with a
long zippered utility pocket; LEFT upper arm with a coloured division armband (see
section 3); two stacked black nylon duty belts with flat rectangular silver buckles; a
belt-mounted radio and a pouch each with a tiny cyan indicator light; black tactical
gloves with pale grey wrist straps; dark grey-green trousers with a light grey side
stripe, slightly bloused; tall black leather boots with a side zip. Equipment shown
beside the figure: a black stun baton with a copper-coil tip glowing faintly orange,
and a holstered compact 9mm sidearm. Callouts on vest, belts, armband, baton.

SECTION 3 — ARMBANDS (right column, stacked vertically): six cloth armbands laid flat
like fabric swatches, each a wide stitched band with velcro ends. Each shows the text
"C9:D5" in bold off-white stencil letters, a small circular division glyph on the left,
and thin silver rank bars on the right. Colours top to bottom with labels:
"UNION" civil protection blue (#2F6FB5), "HELIX" clinical white with teal trim,
"JURY" deep crimson (#A3262A), "RAZOR" muted gold (#C9A13B), "SPEAR" hazard orange
(#D9641E), "OA" command violet (#6B4FA0). Worn fabric texture, slight fraying.

SECTION 4 — DIVISION EMBLEMS (bottom row, six circular badges in a line, equal size):
all share one design frame: a bevelled brushed-steel outer ring whose upper third is a
separate arc in the division colour; a sharp downward-pointing steel V-chevron
breaking through the top of the ring; a faint wireframe globe of latitude and
longitude lines behind it; a round central medallion with a bone-white embossed icon.
Icons: UNION — upright stun baton with two small electric arcs (blue arc);
HELIX — stylised double helix strand (white arc with teal edge);
JURY — cracked human skull (crimson arc);
RAZOR — kite shield split by a vertical blade (gold arc);
SPEAR — spearhead piercing a broken hazard triangle (orange arc);
OA — three ascending chevrons under a five-point star (violet arc).
Each labelled underneath in stencil type.

SECTION 5 — FLAGS (bottom left and bottom right, two hanging banners with slight cloth
folds, each 2:3 proportion):
"CCA FLAG": black field; a burst of alternating muted gold and off-white rays radiating
from a point at the lower centre; in the centre a large gold downward V-chevron with a
solid circle inside it; a thin gold border; the letters "C.C.A." small in stencil at
the bottom edge.
"CITY 09 FLAG": deep slate-blue field (#26394A); a single white horizontal wave line
across the lower third representing the river; above it a black stylised dam of five
arches; rising from the dam's centre a thin black needle-like spire that reaches the
top edge; the numerals "09" large in off-white stencil in the upper hoist corner; a
narrow cyan stripe along the bottom edge.

FOOTER: a colour palette strip with labelled swatches (#2F6FB5, #E9EEF0, #A3262A,
#C9A13B, #D9641E, #6B4FA0, #26394A, #5FC8DD, charcoal #1B2226), and small text
"CCA ART BIBLE — REV 1".

[GLOBAL STYLE BLOCK HERE]
```

Midjourney-tillägg: `--ar 3:2 --style raw --stylize 150 --sref <url> --cref <hjälm/uniform-url>`

---

## 4. PROMPT 2: HJÄLM (detaljark)

```
Character prop turnaround sheet of a single full-head gas-mask helmet for a dystopian
civil police force, displayed on a neutral grey background, five views in a row:
front, three-quarter left, left profile, back, and top-down.
Off-white to pale bone-grey ceramic composite shell, smooth and rounded like a stylised
skull without features, with a subtle raised ridge from brow to crown; two large
perfectly round eye openings set slightly wide, each rimmed in thick black rubber with
four tiny screws, fitted with dark smoked-glass lenses that have a faint cyan sheen;
beneath, a short cylindrical respirator canister protruding forward from where the
mouth would be, made of dull gunmetal with three concentric ridged rings and a
perforated circular centre plate; small exhale valves on each cheek; a compact black
radio headset clamped over the left ear with a stub antenna and a coiled cable running
down to the collar; the shell ends at the jaw where a dark grey knit balaclava and a
rubber neck seal show; a stencilled unit number "C9" small on the back of the skull.
Wear: hairline scratches, chipped edges at the brow, grime in the seams.
Extra insets: (a) close-up of the lens glowing pale cyan in darkness;
(b) exploded view of filter canister; (c) side-by-side "standard issue" vs "officer"
variant where the officer helmet has a thin division-coloured stripe from brow to crown.
Technical callout labels in stencil type.
[GLOBAL STYLE BLOCK HERE]
```

---

## 5. PROMPT 3: UNIFORM (detaljark)

```
Costume design turnaround sheet of a dystopian civil police officer, full body, front /
side / back views in neutral A-pose, plus detail insets, on a neutral grey background.
The officer wears the off-white ceramic gas-mask helmet with round dark lenses and a
cylindrical respirator.
Upper body: dark charcoal-navy padded tactical jacket, tall stand-up collar zipped to
the chin, long sleeves with subtle quilting; over it a fitted quilted ballistic vest in
the same charcoal with three thick horizontal padded ribs across the stomach and a
vertical centre zip; a white rectangular double-bar patch on the left chest; light
grey reinforced shoulder panels with a thin division-colour edge stripe; right sleeve
with a long vertical zippered pocket; left upper arm carrying a blue cloth armband
printed "C9:D5" with one thin silver rank bar.
Waist: two stacked black nylon duty belts, each with a flat rectangular brushed-silver
buckle; on the left hip a slim radio unit, on the right a pouch, both with a tiny cyan
status LED; jacket skirt falls to mid-thigh with two flap pockets.
Hands: black tactical gloves with pale grey wrist straps.
Legs: dark grey-green work trousers with a thin light grey side stripe, bloused into
tall black leather boots with a side zip and thick soles.
Equipment row beside the figure: black stun baton with ribbed grip and copper-coil tip
glowing faint orange; compact 9mm pistol in a black thigh holster; handcuffs; a
handheld biosignal scanner.
Insets: chest patch close-up, belt buckle close-up, armband close-up, boot sole.
Callouts in stencil type: "BALLISTIC VEST", "DIVISION ARMBAND", "DUTY BELT x2",
"STUN BATON", "SIDEARM".
[GLOBAL STYLE BLOCK HERE]
```

**Snabbvariant per division** (lägg till i slutet). Fullständiga prompter per division finns i 5b nedan:
- UNION: `armband and shoulder stripe civil protection blue #2F6FB5`
- HELIX: `white armband with teal trim, white medical satchel with biogel canisters on the hip, teal shoulder stripe`
- JURY: `crimson armband, crimson shoulder stripe, black leather gloves to the elbow, a slate tablet on the belt`
- RAZOR: `gold armband, gold shoulder stripe, heavier ballistic plates on chest and thighs, compact SMG on a sling`
- SPEAR: `orange armband, orange shoulder stripe, grime and ash, extra ammo pouches, sealed respirator with twin filters`
- OA: `violet armband, violet shoulder stripe, long dark greatcoat over the vest, peaked officer collar insignia`

---

## 5b. FULLSTÄNDIGA DIVISIONSUNIFORMER (en prompt per division)

Fristående prompter. Alla delar samma grund (hjälm, jacka, väst, bälten, byxor, stövlar). Skillnaden ligger i färg, utrustning, slitage och hållning. Armbandens rangstreck följer armbandsarket: UNION 1, HELIX 2, JURY 3, RAZOR 4, SPEAR 5, OA ett tjockt streck med stjärna.

**Format:** 16:9 liggande. Bifoga uniforms- och hjälmreferenserna.

**Tips för en enhetlig serie:** kör UNION först. Bifoga sedan den bästa UNION-bilden som referens till de andra fem. I Midjourney: samma `--seed` och `--cref <UNION-bild>`.

### UNION, patrull

```
Costume design turnaround sheet of a dystopian civil police patrol officer of the "UNION" division, full body, front view, side view and back view in a neutral A-pose, plus detail insets and an equipment row, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CIVIL PROTECTION — UNION DIVISION — PATROL UNIFORM".

HEAD: an off-white to pale bone-grey ceramic full-head gas-mask helmet, smooth rounded skull dome with a subtle raised seam from brow to crown, two large round eye openings rimmed in thick black rubber with dark smoked lenses that have a faint cyan sheen, a short cylindrical gunmetal respirator canister with concentric ridged rings at the mouth, a compact black radio headset with a stub antenna over the left ear, dark grey knit balaclava at the neck seal. No stripe on the helmet.

UPPER BODY: a dark charcoal-navy padded tactical jacket with a tall stand-up collar zipped to the chin and lightly quilted sleeves. Over it a fitted quilted ballistic vest in the same charcoal with three thick horizontal padded ribs across the stomach and a vertical centre zip. A white vertical rectangular double-bar patch on the left chest. Light grey reinforced shoulder panels, each with a thin civil protection blue (#2F6FB5) edge stripe. Right sleeve: a long vertical zippered pocket and a small round embroidered patch of the UNION emblem (a steel ring with a blue upper arc, a downward steel V-chevron, and a bone-white stun baton icon in the centre). Left upper arm: a wide civil protection blue (#2F6FB5) cloth armband with "C9:D5" in bold off-white stencil letters, a small stun baton glyph on the left and one thin silver rank bar on the right.

WAIST: two stacked black nylon duty belts with flat rectangular brushed-silver buckles; a slim radio unit on the left hip and a utility pouch on the right, both with a tiny glowing cyan status light; a baton loop on the right side. The jacket skirt falls to mid-thigh with two flap pockets.

HANDS AND LEGS: black tactical gloves with pale grey wrist straps; dark grey-green work trousers with a thin light grey side stripe, bloused into tall black leather boots with side zips and thick treaded soles.

EQUIPMENT ROW: a black stun baton with a ribbed grip and a copper-coil tip glowing faint orange with small blue electric arcs; a compact 9mm pistol in a black hip holster; steel handcuffs; a handheld biosignal scanner with a small cyan screen; a folded ration-line checklist on a clipboard.

DETAIL INSETS: the blue armband close-up, the UNION sleeve patch, the chest double-bar patch, belt buckle, boot sole tread.

CALLOUTS in small stencil type: "STANDARD BALLISTIC VEST", "UNION ARMBAND — 05 GRADE", "DUTY BELT x2", "STUN BATON", "SIDEARM 9MM", "BIOSIGNAL SCANNER".

CHARACTER AND WEAR: the uniform of someone who walks the streets twelve hours a day — scuffed boot toes, rain-darkened shoulders, a little mud on the trouser hems, worn edges on the vest ribs. Posture upright and watchful, weight balanced, baton hand relaxed.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey and slate-blue palette with sharp cyan and blue accents, worn materials (padded ballistic nylon, oiled leather, scuffed ceramic), crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

### HELIX, sjukvård

```
Costume design turnaround sheet of a dystopian civil police field medic of the "HELIX" division, full body, front view, side view and back view in a neutral A-pose, plus detail insets and an equipment row, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CIVIL PROTECTION — HELIX DIVISION — FIELD MEDIC UNIFORM".

HEAD: an off-white to pale bone-grey ceramic full-head gas-mask helmet, smooth rounded skull dome with a subtle raised seam from brow to crown, two large round eye openings rimmed in thick black rubber fitted with pale green-tinted lenses, a short cylindrical gunmetal respirator canister with concentric ridged rings at the mouth, a compact black radio headset over the left ear, dark grey balaclava at the neck seal. A thin teal (#3FB8A8) stripe painted from brow to crown.

UPPER BODY: a dark charcoal-navy padded tactical jacket with a tall stand-up collar zipped to the chin and lightly quilted sleeves. Over it a fitted quilted ballistic vest in the same charcoal with three thick horizontal padded ribs and a vertical centre zip. A white vertical rectangular double-bar patch on the left chest. Light grey reinforced shoulder panels, each with a thin teal (#3FB8A8) edge stripe. A clean white band wrapped around the left forearm. Right sleeve: a long vertical zippered pocket and a small round embroidered patch of the HELIX emblem (a steel ring with a white-and-teal upper arc, a downward steel V-chevron, and a bone-white double helix icon in the centre). Left upper arm: a wide clinical white (#E9EEF0) cloth armband with teal piping, "C9:D5" in bold charcoal stencil letters, a small double helix glyph on the left and two thin silver rank bars on the right.

WAIST: two stacked black nylon duty belts with flat rectangular brushed-silver buckles; a white hard-shell medical satchel on the right hip with a teal stripe; a row of small glass canisters of glowing pale-blue biogel in elastic loops across the front belt; a slim radio unit on the left hip with a cyan status light; a compact holster with a 9mm pistol at the left thigh.

HANDS AND LEGS: thin pale grey nitrile-style gloves worn over black tactical gloves, pale grey wrist straps; dark grey-green work trousers with a thin light grey side stripe, bloused into tall black leather boots with side zips.

EQUIPMENT ROW: the white medical satchel opened to show sutures, bandage rolls and a coagulant auto-injector; a tube of blue biogel; a handheld biosignal scanner with a cyan heartbeat line on its screen; a folded stretcher strap; the 9mm pistol.

DETAIL INSETS: the white-and-teal armband, the HELIX sleeve patch, the biogel canister belt, the coagulant injector, the green-tinted lens.

CALLOUTS in small stencil type: "HELIX ARMBAND — 04 GRADE", "TEAL CREST STRIPE", "MEDICAL SATCHEL", "BIOGEL x6", "COAGULANT INJECTOR", "SIDEARM 9MM".

CHARACTER AND WEAR: clinically clean compared to street units, but with faint old bloodstains scrubbed pale on the cuffs and vest, and a few fresh drops on the gloves. Posture composed and tired, hands held slightly forward as if ready to work.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey palette with clinical white and teal accents, worn materials, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

### JURY, militärpolis och förhör

```
Costume design turnaround sheet of a dystopian civil police interrogator of the "JURY" military police division, full body, front view, side view and back view in a neutral A-pose, plus detail insets and an equipment row, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CIVIL PROTECTION — JURY DIVISION — DETENTION & INTERROGATION UNIFORM".

HEAD: an off-white to pale bone-grey ceramic full-head gas-mask helmet, smooth rounded skull dome with a subtle raised seam from brow to crown, two large round eye openings rimmed in thick black rubber with very dark, almost black, lenses that show only a faint red glint, a short cylindrical gunmetal respirator canister with concentric ridged rings at the mouth, a compact black radio headset over the left ear, black balaclava at the neck seal. A thin deep crimson (#A3262A) stripe painted from brow to crown.

UPPER BODY: a near-black charcoal padded tactical jacket with a tall stand-up collar zipped to the chin. Over it a fitted quilted ballistic vest in the same near-black with three thick horizontal padded ribs and a vertical centre zip. A white vertical rectangular double-bar patch on the left chest. Dark grey reinforced shoulder panels, each with a thin deep crimson (#A3262A) edge stripe. Right sleeve: a long vertical zippered pocket and a small round embroidered patch of the JURY emblem (a steel ring with a crimson upper arc, a downward steel V-chevron, and a bone-white cracked skull icon in the centre). Left upper arm: a wide deep crimson (#A3262A) cloth armband with "C9:D5" in bold off-white stencil letters, a small cracked skull glyph on the left and three thin silver rank bars on the right.

WAIST: two stacked black leather duty belts with flat rectangular dark gunmetal buckles; a slate-grey data tablet clipped to the left hip with a red status light; a set of heavy restraint cuffs and a ring of keys on the right; a short stun baton with a crimson grip band.

HANDS AND LEGS: black polished leather gauntlets reaching almost to the elbow; dark charcoal trousers with a thin crimson side stripe, bloused into tall polished black leather boots with side zips.

EQUIPMENT ROW: the slate data tablet showing a citizen file with an amber flag; heavy steel restraint cuffs with a chain; a short crimson-gripped stun baton; a biosignal stress monitor — a small device with a probe that attaches to the base of the skull; a 9mm pistol in a black holster; a rubber-stamped detention form.

DETAIL INSETS: the crimson armband, the JURY sleeve patch, the leather gauntlet cuff, the biosignal stress probe, the dark lens with its red glint.

CALLOUTS in small stencil type: "JURY ARMBAND — 03 GRADE", "CRIMSON CREST STRIPE", "LEATHER GAUNTLETS", "DATA SLATE", "RESTRAINTS", "STRESS MONITOR".

CHARACTER AND WEAR: immaculate and severe, almost ceremonial — polished leather, crisp folds, no mud. Posture very still, hands folded behind the back, head slightly tilted as if listening. The overall impression is cold authority rather than street toughness.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold low-key lighting from upper left, desaturated near-black and steel-grey palette with deep crimson accents, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

### RAZOR, VIP- och hardpointskydd

```
Costume design turnaround sheet of a dystopian civil police protection officer of the "RAZOR" division, guarding VIPs and hardpoints, full body, front view, side view and back view in a neutral A-pose, plus detail insets and an equipment row, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CIVIL PROTECTION — RAZOR DIVISION — HARDPOINT & VIP PROTECTION UNIFORM".

HEAD: an off-white to pale bone-grey ceramic full-head gas-mask helmet, smooth rounded skull dome with a subtle raised seam from brow to crown, two large round eye openings rimmed in thick black rubber with each lens ringed by a thin muted gold (#C9A13B) bezel, dark smoked lenses with a faint cyan sheen, a short cylindrical gunmetal respirator canister with concentric ridged rings at the mouth, a black radio headset with a longer antenna over the left ear, dark grey balaclava at the neck seal. A thin muted gold stripe painted from brow to crown.

UPPER BODY: a dark charcoal-navy padded tactical jacket with a tall stand-up collar zipped to the chin. Over it a heavier ballistic vest: the standard quilted ribs plus a rigid dark steel-grey chest plate and side plates strapped over it. A white vertical rectangular double-bar patch on the left chest plate. Thick light grey reinforced shoulder pauldrons, each with a muted gold (#C9A13B) edge stripe. Right sleeve: a long vertical zippered pocket and a small round embroidered patch of the RAZOR emblem (a steel ring with a gold upper arc, a downward steel V-chevron, and a bone-white icon of a kite shield split by a vertical blade). Left upper arm: a wide muted gold (#C9A13B) cloth armband with "C9:D5" in bold charcoal stencil letters, a small shield-and-blade glyph on the left and four thin silver rank bars on the right.

WAIST: two stacked black nylon duty belts with flat rectangular brushed-silver buckles; magazine pouches across the front; a radio unit on the left hip with a cyan status light; a holstered 9mm pistol on the right thigh.

HANDS AND LEGS: black tactical gloves with pale grey wrist straps and hard knuckle guards; dark grey-green trousers with a thin gold side stripe and rigid dark steel-grey thigh plates; tall black leather boots with side zips and armoured shin guards.

EQUIPMENT ROW: a compact submachine gun on a single-point sling; spare magazines; the 9mm pistol; a portable riot shield with a narrow viewing slot and the RAZOR emblem stencilled in gold; a small earpiece with a coiled wire; a laminated hardpoint access card.

DETAIL INSETS: the gold armband, the RAZOR sleeve patch, the gold lens bezel, the strapped chest plate, the riot shield emblem.

CALLOUTS in small stencil type: "RAZOR ARMBAND — 02 GRADE", "GOLD LENS BEZEL", "HEAVY BALLISTIC PLATES", "SUBMACHINE GUN", "RIOT SHIELD", "HARDPOINT ACCESS".

CHARACTER AND WEAR: heavier and more formal than patrol units — well maintained, polished plates, gold details kept bright for appearances beside dignitaries. Posture wide-stanced and immovable, hands resting on the slung weapon, like a statue at a doorway.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey palette with muted gold accents, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

### SPEAR, offensiv och 404-zoner

```
Costume design turnaround sheet of a dystopian civil police assault officer of the "SPEAR" offensive division, cleared to enter quarantined "404" zones, full body, front view, side view and back view in a neutral A-pose, plus detail insets and an equipment row, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CIVIL PROTECTION — SPEAR DIVISION — 404 ZONE ASSAULT UNIFORM".

HEAD: an off-white to pale bone-grey ceramic full-head gas-mask helmet, smooth rounded skull dome with a subtle raised seam from brow to crown, heavily scratched and stained with soot. Two large round eye openings rimmed in thick black rubber with dark smoked lenses that have a faint cyan sheen, plus a hinged flip-down protective visor bar above them. Instead of one respirator canister, two larger cylindrical gunmetal filter canisters, one on each side of the jaw, with concentric ridged rings. A black radio headset over the left ear. Black sealed hood and rubber neck seal. A thin hazard orange (#D9641E) stripe painted from brow to crown, partly worn away.

UPPER BODY: a dark charcoal-navy padded tactical jacket with a tall stand-up collar sealed with a rubber gasket. Over it a quilted ballistic vest with three thick horizontal ribs, covered in additional chest rig webbing with ammunition pouches and a grenade pouch. A white vertical rectangular double-bar patch on the left chest, smudged with ash. Light grey reinforced shoulder panels, each with a hazard orange (#D9641E) edge stripe and a small black-and-orange hazard triangle stencil. Right sleeve: a long vertical zippered pocket and a small round embroidered patch of the SPEAR emblem (a steel ring with an orange upper arc, a downward steel V-chevron, and a bone-white icon of a spearhead piercing a broken triangle). Left upper arm: a wide hazard orange (#D9641E) cloth armband with "C9:D5" in bold charcoal stencil letters, a small spearhead glyph on the left and five thin silver rank bars on the right.

WAIST: two stacked black nylon duty belts with flat rectangular buckles; a dosimeter-style hazard meter clipped to the front with a small orange display; a radio unit on the left hip with a cyan status light; a holstered 9mm pistol on the right thigh; a heavy flashlight.

HANDS AND LEGS: thick black reinforced gloves with rubber-sealed cuffs; dark grey-green trousers with a thin orange side stripe and padded knee guards; tall black boots taped at the top to the trousers with grey hazard tape.

EQUIPMENT ROW: a pump-action shotgun with a worn sling; shotgun shells in a bandolier; the 9mm pistol; a portable hazard meter; spare twin filter canisters; a breaching tool (crowbar-like pry bar); a flare.

DETAIL INSETS: the orange armband, the SPEAR sleeve patch, the twin filter canisters, the hazard meter, the taped boot seal.

CALLOUTS in small stencil type: "SPEAR ARMBAND — 01 GRADE", "TWIN FILTER RESPIRATOR", "CHEST RIG", "HAZARD METER", "SHOTGUN", "SEALED CUFFS".

CHARACTER AND WEAR: battle-worn and dirty — ash and soot streaks, scorch marks, chipped ceramic, torn and patched fabric, dried grey mud to the knees. Posture low and forward-leaning, ready to move, weapon held across the body.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, harsh overcast lighting from upper left, desaturated ash-grey palette with hazard orange accents, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

### OA, Officer Academy

```
Costume design turnaround sheet of a dystopian civil police officer cadet of the "OA" Officer Academy, full body, front view, side view and back view in a neutral A-pose, plus detail insets and an equipment row, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CIVIL PROTECTION — OFFICER ACADEMY — COMMAND UNIFORM".

HEAD: an off-white to pale bone-grey ceramic full-head gas-mask helmet, smooth rounded skull dome with a subtle raised seam from brow to crown, polished to a soft sheen. Two large round eye openings rimmed in thick black rubber with dark smoked lenses that have a faint cyan sheen, a short cylindrical gunmetal respirator canister with concentric ridged rings at the mouth, a black radio headset with a slim boom microphone over the left ear, dark grey balaclava at the neck seal. A thin command violet (#6B4FA0) stripe painted from brow to crown, flanked by two finer silver pinstripes.

UPPER BODY: a dark charcoal-navy padded tactical jacket with a tall stiff peaked collar bearing small silver officer pins. Over it the fitted quilted ballistic vest with three horizontal ribs. Over everything, a long dark charcoal military greatcoat reaching below the knee, double-breasted with dark metal buttons, worn open to show the vest. A white vertical rectangular double-bar patch on the left chest of the vest. Light grey shoulder panels on the greatcoat, each with a command violet (#6B4FA0) edge stripe and a small silver star. Right sleeve: a small round embroidered patch of the OA emblem (a steel ring with a violet upper arc, a downward steel V-chevron, and a bone-white icon of three ascending chevrons beneath a five-point star). Left upper arm: a wide command violet (#6B4FA0) cloth armband with "C9:D5" in bold off-white stencil letters, a small chevrons-and-star glyph on the left and one thick silver bar with a small silver star on the right.

WAIST: a single wide black leather officer's belt with a polished silver rectangular buckle and a diagonal cross strap over the chest; a holstered 9mm pistol on the right hip; a slim radio on the left with a cyan status light; a leather map case.

HANDS AND LEGS: black leather dress gloves; dark grey-green trousers with a violet side stripe, sharply pressed, bloused into tall polished black leather riding boots.

EQUIPMENT ROW: a slim black officer's baton with silver end caps; the 9mm pistol; a leather-bound field command slate; a district map of City 09 in a leather case; a whistle on a chain; a pair of compact binoculars.

DETAIL INSETS: the violet armband, the OA sleeve patch, the collar officer pins, the greatcoat button, the belt buckle and cross strap.

CALLOUTS in small stencil type: "OA ARMBAND — OFFICER CADET", "VIOLET CREST STRIPE", "GREATCOAT", "OFFICER BELT", "COMMAND SLATE", "OFFICER BATON".

CHARACTER AND WEAR: crisp, tailored, deliberately impressive — pressed fabric, polished leather, silver details bright. Posture upright and composed, one gloved hand resting on the belt, chin slightly raised, the look of someone being trained to give orders.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey and charcoal palette with command violet and silver accents, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

---

## 5c. BASE CITIZEN (standardmedborgare)

Grunduniformen som alla vanliga medborgare i City 09 bär. Medborgare med högre privilegier eller jobb hos olika instanser får egna varianter senare. Det här är basen.

**Citizen ID (CID)** sitter på en vit tygetikett på **bärarens högra bröst** (vänster sida i bild). Kanoniskt format: `CID` följt av fem siffror, under det en liten streckkod. Exempel: `CID 48271`. Spelarens CID är samma som det femsiffriga numret i spelet.

### PROMPT A: Base citizen, turnaround-ark

**Format:** 3:2 liggande. Bifoga medborgarbilderna som referens.

```
Costume design reference sheet of the standard-issue civilian uniform worn by every ordinary citizen of an occupied dystopian Eastern-European city, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CITY 09 — BASE CITIZEN UNIFORM".

MAIN ROW: three different citizens standing side by side in a relaxed neutral A-pose, full body, front view, all wearing the identical uniform:
1. a man in his forties with a shaved head, gaunt cheeks, tired heavy-lidded eyes and stubble;
2. an older man in his late fifties with short greying black hair combed back, deep lines around the mouth, a weary downturned expression;
3. a woman in her thirties with short dark brown hair pulled back, pale skin, a flat guarded expression.
Ordinary, believable faces: undernourished, unsmiling, not glamorous, no makeup, looking straight ahead.

THE UNIFORM (identical on all three):
- JACKET: a hip-length work jacket of heavy faded blue-teal denim-like canvas (#3E5F6E with lighter worn areas), straight boxy cut, long sleeves ending at the wrist, a short upright mandarin stand collar with no lapels, single-breasted with a vertical row of seven small dark grey buttons down the centre front, no breast pockets. The fabric is washed out and uneven in colour, darker at the seams, with dirt smudges, small faded stains and pilling at the elbows and cuffs.
- ID PATCH: on the wearer's right chest (left side of the image), a small rectangular off-white cloth tape label about 8 cm wide, stitched on at the edges, printed in small black stencil letters "CID 48271" with a tiny barcode beneath. Each citizen has a different five-digit number: "CID 48271", "CID 30917", "CID 62054".
- UNDERSHIRT: a plain crew-neck undershirt in dirty off-white/beige, visible at the collar opening and hanging a few centimetres below the jacket hem.
- TROUSERS: straight-leg work trousers of dark indigo denim, faded at the thighs and knees, slightly too long and bunching above the shoes, no belt visible.
- SHOES: scuffed dark brown leather work shoes with thick worn soles.

SECOND ROW: the man from figure 1 shown in side view and back view (the back of the jacket is plain, with a faint stencilled district marking "D5" between the shoulder blades), plus detail insets: close-up of the CID chest label with barcode, the button row, the frayed cuff, the worn trouser knee, the shoe.

CALLOUTS in small stencil type: "CIVILIAN WORK JACKET", "CITIZEN ID LABEL", "UNDERSHIRT", "WORK TROUSERS", "DISTRICT MARK".

MOOD: everyone wears the same clothes, so nobody stands out. Clothes are issued, not chosen: badly fitted, mended, lived in for months. No jewellery, no personal items, no colour beyond the faded blue.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey and faded blue-teal palette, worn and used materials, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

### PROMPT B: Citizen-porträtt (grund för alla NPC-porträtt)

**Format:** 4:5 eller 1:1. Byt ut [hakparenteserna].

```
Head-and-shoulders portrait of an ordinary citizen of an occupied dystopian Eastern-European city, facing the camera straight on, centred, against a plain near-black background, like an identity registration photograph.

PERSON: [age, gender, face, hair, expression — e.g. "a man in his thirties with short dark hair, a thin face with prominent cheekbones, dark stubble, tired brown eyes, a guarded neutral expression"].

CLOTHING: the standard-issue citizen uniform — a faded blue-teal denim-like work jacket with a short upright mandarin stand collar and a row of small dark buttons, a dirty off-white crew-neck undershirt visible at the collar. On the wearer's right chest (left side of the image), a small off-white cloth ID label printed in black stencil "CID [five digits]" with a tiny barcode.

LIGHTING: flat, cold, slightly overhead registration-booth light, soft shadows under the eyes and cheekbones, a faint cyan cast at the edges as if from a scanner.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, desaturated palette, subtle film grain, believable unglamorous skin texture, no makeup, no smile, all text sharp and correctly spelled.
```

### PROMPT C: Lojalist med utmärkelse

**Format:** 3:2 liggande. Bifoga base citizen-arket som referens.

```
Costume design reference sheet of a "commended loyal citizen" of an occupied dystopian Eastern-European city, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CITY 09 — COMMENDED CITIZEN".

FIGURE: one man in his late forties, shown full body in front view, side view and back view in a relaxed but upright A-pose. Well fed compared to other citizens: fuller cheeks, clean-shaven, short neatly parted dark hair with grey at the temples, a careful, eager-to-please half-smile that does not reach his eyes. Posture straight, chin slightly raised, hands at his sides with fingers together, like someone who knows he is being watched and wants to be seen behaving well.

UNIFORM: the standard citizen uniform, visibly better than everyone else's. A hip-length work jacket of blue-teal denim-like canvas (#3E5F6E), noticeably cleaner, darker and less faded, recently issued, fitted to his size, with crisp seams; a short upright mandarin stand collar fully buttoned to the top; a vertical row of seven small dark grey buttons, all present and matching. A clean pale beige crew-neck undershirt barely visible at the collar and tucked in. Straight-leg dark indigo denim work trousers with a pressed crease, correct length. Polished dark brown leather work shoes.

ID LABEL: on the wearer's right chest (left side of the image), a crisp bright white cloth label, perfectly straight, printed in black stencil "CID 22614" with a small barcode. Directly above the label, a small circular enamel commendation pin about 2.5 cm across: muted gold (#C9A13B) rim, a dark slate-blue centre, a tiny embossed downward V-chevron with a dot inside. Below the barcode, a thin printed gold line.

ACCESSORIES: a laminated grey ration card with a gold corner stripe in a clear plastic sleeve clipped to the jacket's lower button, and a folded copy of an official civic bulletin under one arm.

DETAIL INSETS: close-up of the commendation pin; close-up of the white ID label with gold line; the gold-striped priority ration card reading "PRIORITY ALLOCATION"; the polished shoe; a comparison inset showing the faded, stained standard citizen label next to his clean one, labelled "STANDARD" and "COMMENDED".

CALLOUTS in small stencil type: "COMMENDATION PIN", "CITIZEN ID — COMMENDED", "PRIORITY RATION CARD", "NEW-ISSUE JACKET".

MOOD: privileged but uneasy. He is safer than his neighbours, and they hate him for it. His hands are clean, his eyes are tired.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey and blue-teal palette with small muted gold accents, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

### PROMPT D: Medborgare under bevakning

**Format:** 3:2 liggande. Bifoga base citizen-arket som referens.

```
Costume design reference sheet of a "citizen under surveillance" of an occupied dystopian Eastern-European city, on a neutral warm-grey background. Title at the top in condensed off-white stencil letters on a charcoal strip: "CITY 09 — CITIZEN UNDER WATCH".

FIGURE: one woman in her late thirties, shown full body in front view, side view and back view. Thin and tense, with sharp cheekbones, dark circles under her eyes, dark brown hair cut short and unevenly as if by herself, a healing bruise on one cheekbone. Her shoulders are slightly hunched, arms held close to her body, head turned a few degrees as she glances sideways with nervous, watchful eyes.

UNIFORM: the standard citizen uniform, older and worse than average. A hip-length faded blue-teal denim-like work jacket (#3E5F6E), very washed out, with one sleeve torn at the elbow and roughly darned, and a mismatched grey replacement button; the short mandarin stand collar is turned up. A grimy off-white crew-neck undershirt. Faded dark indigo denim work trousers, worn through at one knee. Cracked dark brown leather work shoes, one lace replaced with string.

ID LABEL: on the wearer's right chest (left side of the image), the off-white cloth label printed in black stencil "CID 39058" with a small barcode, overprinted with a bold red (#A3262A) diagonal stripe from corner to corner, and a small red stencilled "OBS" in the lower right corner.

SURVEILLANCE MARKINGS: on the back of the jacket, between the shoulder blades, a large faded red stencilled circle with a diagonal line through it and the district mark "D5" beneath. A thin grey plastic monitoring band is locked around her left wrist with a small blinking cyan light.

DETAIL INSETS: close-up of the red-striped ID label with "OBS"; the back stencil; the wrist monitoring band with its cyan light; a printed surveillance notice on grey paper reading "CITIZEN UNDER OBSERVATION — REPORT IRREGULARITIES" with a barcode and a blank photo square; the darned sleeve.

CALLOUTS in small stencil type: "OBSERVATION STRIPE", "BACK MARKING", "MONITORING BAND", "CITIZEN ID — FLAGGED".

MOOD: she has been marked so everyone knows. Neighbours keep their distance. She expects to be stopped at every checkpoint.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey and faded blue-teal palette with sharp red and small cyan accents, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

---

## 5d. PORTRÄTT: HUVUDKARAKTÄRER

Alla fyra följer samma uppställning som prompt B: framifrån, ID-fotokänsla, nästan svart bakgrund. Då passar de ihop i spelets kontaktlista. **Format:** 4:5. Bifoga base citizen-arket.

### Mira (lillasyster, 17, D5 Stack 14, fabriken)

```
Head-and-shoulders character portrait of Mira, a seventeen-year-old girl from an occupied dystopian Eastern-European city, facing the camera nearly straight on with her head tilted very slightly down, eyes looking up into the lens, centred against a plain near-black background, lit like a registration photograph.

FACE: a thin, pale, oval face, too sharp at the cheekbones from years of rations; a small pointed chin; straight dark eyebrows; large grey-green eyes that are tired but steady, with a hint of stubbornness and suppressed anger; faint shadows beneath them. A tiny healed scar on her lower lip. Natural unglamorous skin with a few freckles across the nose, no makeup. Expression: guarded and unsmiling, but her eyes are alive, someone who still draws in secret.

HAIR: dark brown, shoulder length, roughly cut, tucked behind one ear, a few loose strands across her forehead. A worn-down pencil stub tucked behind her right ear.

CLOTHING: the standard-issue citizen uniform — a faded blue-teal denim-like work jacket with a short upright mandarin stand collar, slightly too big for her, the collar button undone; a dirty off-white crew-neck undershirt. Over the jacket, the straps of grey canvas mill overalls. On the wearer's right chest (left side of the image), a small off-white cloth ID label printed in black stencil "CID 51420" with a tiny barcode. Faint blue dye stains on the jacket cuff.

DETAILS: one hand raised into frame at the collar, the fingertips smudged grey with pencil graphite. A torn corner of a ration wrapper with a small pencil sketch peeks out of her breast pocket line.

LIGHTING: flat, cold, slightly overhead registration-booth light, soft shadows under the eyes, a faint cyan rim light at the edges as if from a scanner.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, desaturated steel-grey and faded blue-teal palette, subtle film grain, believable skin texture, all text sharp and correctly spelled.
```

### Halloran (granne, 71, Stack 14 14-F)

```
Head-and-shoulders character portrait of Edvard Halloran, a seventy-one-year-old man from an occupied dystopian Eastern-European city, facing the camera straight on, centred against a plain near-black background, lit like a registration photograph.

FACE: a long, weathered, deeply lined face; heavy grey eyebrows; pale blue eyes, kind and amused at the corners but watchful, the eyes of a man who has survived a war and decided to stay decent anyway; a large nose with broken veins; sunken cheeks; three days of white-grey stubble; thin lips set in a patient, faintly ironic line, almost a smile. Age spots on the temples. Natural unglamorous skin.

HAIR: thin white-grey hair, combed back but unruly, thinning on top, longer at the neck.

CLOTHING: over the standard-issue faded blue-teal citizen work jacket with its mandarin collar, he wears a heavy pre-war dark brown herringbone wool overcoat much older than the regime, with wide lapels, frayed edges, a missing button, and elbow patches in mismatched grey cloth. A knitted dark green scarf, unravelling at the ends, loosely around his neck. On the wearer's right chest of the citizen jacket (left side of the image), just visible between the coat lapels, a small off-white cloth ID label printed in black stencil "CID 10388" with a tiny barcode.

DETAILS: a pair of round wire reading glasses with one taped arm folded into the coat's breast pocket. One gnarled hand visible at the edge of the frame, with old scars across the knuckles and a length of clear fishing line wound around the index finger.

LIGHTING: flat, cold, slightly overhead registration-booth light with a faint warm candle-like tint on one side of his face, a faint cyan rim light at the edges.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, desaturated palette of browns, greys and faded blue-teal, subtle film grain, believable aged skin texture, all text sharp and correctly spelled.
```

### Tomas Vey (rekrytkamrat, ca 22, D2 färgeriet)

```
Head-and-shoulders character portrait of Tomas Vey, a young man of about twenty-two from an occupied dystopian Eastern-European city, facing the camera straight on, centred against a plain near-black background, lit like a registration photograph.

FACE: a broad, open, square-jawed face; a crooked nose that has clearly been broken at least once, bent slightly to the left; heavy brows; warm brown eyes with laugh lines already forming; a wide mouth caught in a lopsided, slightly embarrassed grin that is out of place in an identity photo; a small scar through his upper lip; a light shadow of stubble; ruddy cheeks. Unlike other citizens he looks stubbornly cheerful, though there is worry behind his eyes.

HAIR: light brown, cropped very short at the sides and a little longer and messy on top.

BUILD: enormous shoulders and a thick neck from years of hauling bales and dye barrels; the jacket strains across his chest and shoulders.

CLOTHING: the standard-issue citizen uniform — a faded blue-teal denim-like work jacket with a short upright mandarin stand collar, clearly too small for him, the top two buttons undone because they will not close; a dirty off-white crew-neck undershirt. On the wearer's right chest (left side of the image), a small off-white cloth ID label printed in black stencil "CID 27716" with a tiny barcode. Deep indigo-blue dye stains soaked into both cuffs and spattered across one shoulder.

DETAILS: one huge hand raised into the frame scratching the back of his neck, the knuckles scarred, the fingers stained blue to the second joint.

LIGHTING: flat, cold, slightly overhead registration-booth light, soft shadows, a faint cyan rim light at the edges as if from a scanner.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, desaturated steel-grey and faded blue-teal palette with deep indigo stains, subtle film grain, believable skin texture, all text sharp and correctly spelled.
```

### Ilse Marek (rekrytkamrat, ca 28, D3 Canal Quarter, pumpmekaniker)

```
Head-and-shoulders character portrait of Ilse Marek, a woman of about twenty-eight from an occupied dystopian Eastern-European city, facing the camera straight on, centred against a plain near-black background, lit like a registration photograph.

FACE: a narrow, angular face with high cheekbones and a long straight nose; thin lips pressed into a flat line; pale skin with a faint weathered tan across the nose from working outdoors; a thin white scar running vertically through her left eyebrow, splitting it in two; cool hazel eyes, very still and very focused, looking straight through the lens as if counting and measuring the person behind it. No expression to read: completely controlled, quietly dangerous. No makeup.

HAIR: black hair pulled back tightly into a low, practical knot, a few short strands escaping at the temples.

CLOTHING: the standard-issue citizen uniform — a faded blue-teal denim-like work jacket with a short upright mandarin stand collar buttoned all the way to the top, worn neatly; a dirty off-white crew-neck undershirt barely visible. On the wearer's right chest (left side of the image), a small off-white cloth ID label printed in black stencil "CID 83305" with a tiny barcode. On close inspection the label is a slightly different shade of white from the stitching around it, as if it has been replaced. Dark machine-oil stains on both cuffs and a smear of grey rust on the collar.

DETAILS: one hand raised into frame at chest height, perfectly steady, the fingernails short and black with grease, a thin oily rag tucked into the jacket's lower button.

LIGHTING: flat, cold, slightly overhead registration-booth light, hard shadows beneath the cheekbones, a faint cyan rim light at the edges as if from a scanner.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, desaturated steel-grey and faded blue-teal palette, subtle film grain, believable skin texture, all text sharp and correctly spelled.
```

**Tips:** kör Mira först. Bifoga sedan hennes porträtt som stilreferens (inte karaktärsreferens) till de andra tre, så får de samma ljus och bakgrund. Tomas är den enda som ler. Det är medvetet, så be modellen hålla fast vid det om den gör honom allvarlig.

### Varianter (byggs på basen senare)

Lägg till i slutet av prompt A eller B:

- **Nedgången / svältande:** `jacket torn at one shoulder and patched with mismatched grey fabric, ID label half peeled off, hollow cheeks, filthy hands`
- **Fabriksarbetare (D2 the Works):** `blue dye stains on both forearms and the jacket front, a grey canvas work apron over the jacket, cotton dust in the hair`
- **Lojalist med utmärkelse** (fullständig prompt: C): `a small yellow circular commendation pin above the ID label, the jacket noticeably cleaner and better fitted`
- **Under bevakning** (fullständig prompt: D): `a red diagonal stripe printed across the ID label, the person glancing sideways nervously`
---

## 6. PROMPT 4: ARMBAND (sex varianter)

```
Product-style flat lay reference sheet of six military cloth armbands for a dystopian
civil police force, arranged in two rows of three on a neutral grey background, each
shown flat from above with a small additional view of it wrapped around an upper arm
in a charcoal padded sleeve.
Each armband: a wide band of heavy woven fabric about 10 cm tall, stitched edges,
black velcro tabs at both ends; on the left a small circular embroidered division
glyph; in the centre the text "C9:D5" in bold off-white stencil letters, perfectly
legible; on the right thin embroidered silver rank bars.
1. "UNION" — civil protection blue #2F6FB5, glyph: stun baton, one rank bar.
2. "HELIX" — clinical white with teal #3FB8A8 border piping, glyph: double helix, two bars.
3. "JURY" — deep crimson #A3262A, glyph: cracked skull, three bars.
4. "RAZOR" — muted gold #C9A13B, glyph: shield with blade, four bars.
5. "SPEAR" — hazard orange #D9641E, glyph: spearhead, five bars.
6. "OA" — command violet #6B4FA0, glyph: chevrons under a star, one thick bar and a small star.
Each labelled underneath in stencil type with the division name.
Realistic fabric weave, slight fraying, faded where the strap rubs.
[GLOBAL STYLE BLOCK HERE]
```

---

## 7. PROMPT 5: DIVISIONSEMBLEM (sex stycken, gemensam struktur)

Bifoga dödskalleemblemet som stilreferens.

```
Insignia design sheet: six circular military division emblems shown in a 3x2 grid on
a neutral dark grey background, each the same size, each rendered as a polished metal
and enamel badge with soft studio lighting and a subtle drop shadow.
ALL SIX SHARE THE SAME FRAME:
- a thick bevelled brushed-steel outer ring;
- the upper third of the ring is a separate curved arc segment in the division colour,
  separated from the steel ring by thin gaps;
- a sharp downward-pointing V-chevron in polished steel, centred, its upper arms
  breaking through the top of the ring;
- behind the chevron, a faint dark-steel wireframe globe with latitude and longitude
  lines;
- slim riveted vertical struts on either side of the chevron;
- a round central medallion, recessed, containing an embossed bone-white icon with
  dark shading.
DIVISIONS AND ICONS:
1. UNION — arc civil protection blue #2F6FB5; icon: an upright stun baton with two small
   electric arcs at the tip.
2. HELIX — arc clinical white with teal #3FB8A8 edge; icon: a stylised double helix
   strand twisting vertically.
3. JURY — arc deep crimson #A3262A; icon: a human skull with a crack across the cranium.
4. RAZOR — arc muted gold #C9A13B; icon: a kite-shaped shield split by a single
   vertical blade.
5. SPEAR — arc hazard orange #D9641E; icon: a spearhead piercing a broken triangle.
6. OA — arc command violet #6B4FA0; icon: three stacked ascending chevrons beneath a
   five-point star.
Below each emblem its name in bold condensed stencil letters.
Style matches a game UI faction icon: crisp, symmetrical, high detail, readable when
small.
[GLOBAL STYLE BLOCK HERE]
```

Tips: generera **ett emblem i taget** med samma prompt (ändra bara punkt 1–6) och spara seed. Då blir ramen identisk mellan divisionerna.

---

## 8. PROMPT 6: CCA-FLAGGAN

```
Flag design presentation: the official flag of a dystopian civil police authority,
shown twice — once flat and frontal as a clean 2:3 vector-like design, and once
hanging from a steel pole in a grey brutalist plaza, fabric rippling slightly.
Design: solid black field; from a point at the bottom centre, a fan of alternating
muted gold (#C9A13B) and dusty off-white rays radiating upward and outward like a
propaganda sunburst, reaching the edges; centred in the upper half, a large solid gold
downward-pointing V-chevron with a gold circle nested inside its notch; a thin gold
inner border around the whole flag; the letters "C.C.A." in small bold stencil type,
off-white, centred at the bottom edge.
Propaganda poster energy, bold and symmetrical, slight print-wear and fading on the
hanging version.
[GLOBAL STYLE BLOCK HERE]
```

Alternativ (ceremoniell variant): `add the phrase "STRENGTH IN ALLEGIANCE" in gold stencil along the top edge`

---

## 9. PROMPT 7: CITY 09-FLAGGAN

```
Flag design presentation: the civic flag of "City 09", an occupied Eastern-European
river city built around a hydroelectric dam, shown flat as a clean 2:3 design and
again as a large vertical banner hanging the full height of a stone courthouse facade.
Design: deep slate-blue field (#26394A); across the lower third a single smooth white
horizontal wave line representing the river; sitting on the wave, a solid black
stylised dam silhouette with five round arches; rising from the centre of the dam a
thin black needle-like spire that tapers to a point at the top edge of the flag; the
numerals "09" large and bold in off-white stencil type in the upper left corner; a
narrow cyan (#5FC8DD) stripe along the very bottom edge.
Banner version: same design stretched vertically, weathered, with rain streaks, small
scanner drone in the foreground for scale.
[GLOBAL STYLE BLOCK HERE]
```

---

## 10. Nästa steg: karaktärer och scener till spelet

Samma stilblock gör att karaktärer och scener passar ihop med referensarket. Mall:

```
Character portrait for a narrative game, chest-up, three-quarter view, looking slightly
off-camera. [VEM: ålder, kropp, ansikte, frisyr, kläder, uttryck]. Setting hint behind:
[PLATS]. Mood: [KÄNSLA].
If in uniform: use the exact helmet and uniform from the attached reference sheet,
[DIVISION] armband "C9:D5" with [N] rank bars.
[GLOBAL STYLE BLOCK HERE]
```

Förslag på första motiv, kopplade till spelets scener:

| Bild | Spelscen | Nyckelord |
|---|---|---|
| Mira på fönsterbrädan | `p_morning` | 17 år, blå fabriksoverall, ritar på ransonsomslag, plastöverklätt fönster |
| Thirty på exercisgolvet | `bt_intro` | UNION OfC, repad vänsterlins, blått armband med officersstreck |
| The Magistrate bakom envägsglaset | `bt_jury` | JURY DvL, crimson armband, händerna på ryggen, källare under flodnivån |
| Halloran vid köksbordet | `bt_raid_2` | 71 år, gammal rock, ett stearinljus, radio bakom elementet |
| Ransoneringskön på Plaza 5 | `d_ration_1` | 300 medborgare, stålvägg med luckor, regn |
| Canal Gate 3 | `d_check_1` | stålbur över stenbro, skanningsbåge, Overwatch-trupp närmar sig |

Bilder som läggs i `assets/img/` kan kopplas till scener med ett `image:`-fält. Det fältet är inte byggt i motorn än, säg till när du vill ha det.
