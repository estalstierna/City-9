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
| `master-a.jpg` | Master A, myndigheten (Rev 2). Emblem inklistrade och hjälmränder borttagna i efterhand |
| `ranks-enlisted.jpg`, `ranks-command.jpg` | Rangarken: RcT till EpU och OfC till EA |
| `portraits/*.jpg` (+ `-thumb.jpg`) | Porträtt: Mira, Halloran, Tomas, Ilse, Rook (med och utan mask), Granite, the Tinker, the Magistrate, Thirty, HELIX 02-77301, Katya (800 px, plus 128 px miniatyrer till kontaktlistan) |

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

**Rangstreck på armbandet:** se avsnitt 2b nedan för hela rangsystemet.

---

## 2b. RANGSYSTEM: insignier (kanon)

Rang visas på **armbandet** (vänster överarm) och syns också på **hjälmen** per nivå.

| Nivå | Rang | Armband | Hjälm |
|---|---|---|---|
| **Rekryt** | RcT | Grått armband, "C9:D5" och "RcT", inga streck | Ingen mask: grå träningsuniform, rakat huvud |
| **Manskap** | 05 | Divisionsfärg, 1 tunt silverstreck | Standardhjälm |
| | 04 | 2 tunna silverstreck | Standardhjälm |
| | 03 | 3 tunna silverstreck | Standardhjälm |
| | 02 | 4 tunna silverstreck | Standardhjälm |
| | 01 | 5 tunna silverstreck | Standardhjälm |
| **Elit** | EpU | 1 tjockt silverstreck | Linsringar i polerat mörkt stål, tunn silverlinje över hjässan |
| **Officerare** | OfC | Tjockt silverstreck + 1 silverstjärna | Kamrand i divisionsfärg med silverkanter |
| | SqL | Tjockt silverstreck + 2 silverstjärnor | Som OfC |
| | DvL | Tjockt silverstreck + 3 silverstjärnor | Som OfC |
| **Ledning** | AdC | Svart armband med guldkant, tjockt guldstreck + 1 guldstjärna | Grafitgrått skal, guldrand, guldringar runt linserna |
| | CmD | Svart/guld, tjockt guldstreck + 2 guldstjärnor | Som AdC |
| | SeC | Svart/guld, tjockt guldstreck + 3 guldstjärnor | Som AdC |
| **Jordadministratör** | EA | Inget armband, ett sigill: guldlagerkrans runt CCA-chevronen | Ingen hjälm: visas bara som sigill |

Ledningen (AdC och uppåt) står över divisionerna och bär därför svart och guld i stället för divisionsfärg.

## PROMPT R1: Rangöversikt, alla rangar på en sida

**Format:** 2:3 stående (eller 3:4). Bifoga armbandsarket och hjälmarket.

```
A single tall reference poster showing the complete rank structure of a fictional dystopian police force, "CIVIL PROTECTION — CITY 09", laid out like a military rank-insignia chart from an art bible. Neutral warm-grey paper background, thin ruled grid lines, everything aligned and evenly spaced.

TITLE at the top in condensed off-white stencil letters on a charcoal strip: "CCA RANK STRUCTURE — CITY 09". A thin cyan rule beneath.

LAYOUT: a vertical ladder read from the bottom (lowest) to the top (highest). Fourteen rows, grouped into six horizontal tier bands, each band with a small tier header on the left edge in stencil type and a slightly different background tint. In every row, from left to right: the rank code in large bold stencil letters, the full rank name in smaller letters beneath it, then a flat cloth armband swatch showing the insignia, then, once per tier band at the far right, a small three-quarter bust of the helmet worn at that tier.

ARMBANDS (all wide woven cloth bands with stitched edges and black velcro ends, text "C9:D5" in bold off-white stencil in the centre, insignia on the right):

TIER "RECRUIT" (bottom, grey band):
- "RcT — Recruit": plain mid-grey armband with "C9:D5" and a small "RcT" stencil, no bars. Bust: a young recruit with a shaved head and no mask, wearing a plain grey training uniform with a high collar.

TIER "PROTECTION UNITS" (blue band):
- "05 — 05 Protection Unit": civil protection blue (#2F6FB5) armband, one thin silver bar.
- "04 — 04 Protection Unit": blue armband, two thin silver bars.
- "03 — 03 Protection Unit": blue armband, three thin silver bars.
- "02 — 02 Protection Unit": blue armband, four thin silver bars.
- "01 — 01 Protection Unit": blue armband, five thin silver bars.
Bust: the standard off-white ceramic full-head gas-mask helmet with two large round dark lenses, a short cylindrical respirator canister and a black radio headset over the left ear.

TIER "ELITE":
- "EpU — Elite Protection Unit": blue armband, one single thick polished silver bar.
Bust: the same helmet with polished dark-steel rings around both lenses and a thin silver line running from brow to crown.

TIER "OFFICERS":
- "OfC — Field Officer": blue armband, one thick silver bar plus one small five-point silver star.
- "SqL — Squadron Leader": thick silver bar plus two small silver stars.
- "DvL — Division Leader": thick silver bar plus three small silver stars.
Bust: the helmet with a broad civil protection blue crest stripe from brow to crown edged by two fine silver pinstripes.

TIER "COMMAND" (darker band):
- "AdC — Adjutant Commander": black armband with gold (#C9A13B) piping, gold "C9:D5", one thick gold bar plus one gold star.
- "CmD — Field Commander": black-and-gold armband, thick gold bar plus two gold stars.
- "SeC — Sectorial Commander": black-and-gold armband, thick gold bar plus three gold stars.
Bust: the helmet with a darker graphite-grey ceramic shell, a gold crest stripe from brow to crown and gold rings around both lenses.

TIER "ADMINISTRATION" (top, black band with gold trim):
- "EA — Earth Administrator": no armband and no figure. Instead a circular gold seal: a gold laurel wreath around a downward-pointing gold V-chevron with a gold circle in its notch, on black enamel, with the words "EARTH ADMINISTRATION" around the rim in small gold capitals.

A thin vertical arrow running up the left margin labelled "AUTHORITY".

FOOTER: a short legend in small stencil type: "THIN BAR = PROTECTION GRADE · THICK BAR = ELITE AND ABOVE · STAR = OFFICER GRADE · GOLD = COMMAND", and the small note "ARMBAND SHOWN IN UNION BLUE — OTHER DIVISIONS USE THEIR OWN COLOUR UP TO DvL".

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey and slate-blue palette with silver, cyan and muted gold accents, worn fabric and scuffed ceramic textures, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

## PROMPT R-MASTER: Alla 14 rangar på ett ark (bygger på R2 + R3)

**Format:** 16:9 liggande (eller 3:2). Bifoga **båda rangarken** (`ranks-enlisted.jpg`, `ranks-command.jpg`) som referens. Layouten är två rader med sju kolumner, alltså samma som de två arken staplade.

```
A single wide master reference sheet showing the complete rank structure of a fictional dystopian police force, "CIVIL PROTECTION — CITY 09". Recreate the two attached rank sheets faithfully — same helmets, same armbands, same typography, same worn grey paper — combined into ONE poster with two stacked rows of seven columns.

TITLE BANNER across the full width at the top, in large condensed off-white stencil letters on a weathered charcoal strip: "CCA RANK STRUCTURE — CITY 09", with a thin cyan rule beneath it. Below the title, a small subtitle in stencil type: "COMBINE CIVIL AUTHORITY · ALL DIVISIONS · ARMBAND SHOWN IN UNION BLUE".

EACH COLUMN, top to bottom: the rank code in large bold stencil letters; the full rank name in smaller stencil letters beneath; a flat woven cloth armband swatch with stitched edges, black velcro ends and "C9:D5" in bold stencil; a three-quarter helmet bust. Columns are separated by thin vertical rules and slightly darker panels, like the references.

TOP ROW — section label on the far left in small vertical stencil text: "ENLISTED". Left to right:
1. "RcT" / "RECRUIT": plain mid-grey armband with "C9:D5 RcT", NO bars. Bust: a young recruit with a shaved head and no mask, in a dark grey high-collared training jacket.
2. "05" / "05 PROTECTION UNIT": civil protection blue (#2F6FB5) armband, EXACTLY ONE thin silver bar.
3. "04" / "04 PROTECTION UNIT": blue armband, EXACTLY TWO thin silver bars.
4. "03" / "03 PROTECTION UNIT": blue armband, EXACTLY THREE thin silver bars.
5. "02" / "02 PROTECTION UNIT": blue armband, EXACTLY FOUR thin silver bars.
6. "01" / "01 PROTECTION UNIT": blue armband, EXACTLY FIVE thin silver bars.
Columns 2–6 share the same bust: the off-white ceramic full-head gas-mask helmet with a raised centre seam, two large round dark lenses in black rubber rims, a cylindrical gunmetal respirator canister with ridged rings, and a black radio headset with stub antenna over the left ear, over a dark padded high collar.
7. "EpU" / "ELITE PROTECTION UNIT": blue armband with ONE single wide polished silver bar (one bar, twice as wide as the thin bars — not two bars). Bust: the same helmet with a single thin silver-blue stripe from brow to crown and polished dark-steel rings around the lenses.

BOTTOM ROW — section label on the far left in small vertical stencil text: "OFFICERS & COMMAND". The last four columns sit on a slightly darker panel. Left to right:
8. "OfC" / "FIELD OFFICER": blue armband, one wide silver bar plus ONE silver five-point star.
9. "SqL" / "SQUADRON LEADER": blue armband, one wide silver bar plus TWO silver stars.
10. "DvL" / "DIVISION LEADER": blue armband, one wide silver bar plus THREE silver stars.
Columns 8–10 share one bust: the off-white helmet with a broad civil protection blue crest stripe from brow to crown.
11. "AdC" / "ADJUTANT COMMANDER": black armband with gold (#C9A13B) piping along both edges, gold "C9:D5", one wide gold bar plus ONE gold star.
12. "CmD" / "FIELD COMMANDER": black-and-gold armband, one wide gold bar plus TWO gold stars.
13. "SeC" / "SECTORIAL COMMANDER": black-and-gold armband, one wide gold bar plus THREE gold stars.
Columns 11–13 share one bust: the helmet with a darker graphite-grey ceramic shell, a gold crest stripe from brow to crown, gold accent lines on the cheeks and gold rings around both lenses.
14. "EA" / "EARTH ADMINISTRATOR": no armband and no figure. In their place, a large circular gold seal on black enamel: a gold laurel wreath around a downward-pointing gold V-chevron with a gold circle in its notch, the words "EARTH ADMINISTRATION" around the upper rim in small gold capitals.

BETWEEN AND BELOW THE ROWS: under the top row a long horizontal arrow labelled "AUTHORITY →"; a second identical arrow under the bottom row.

FOOTER LEGEND across the bottom in small stencil type, with tiny icons: "THIN BAR = PROTECTION GRADE  ·  WIDE BAR = ELITE AND ABOVE  ·  STAR = OFFICER GRADE  ·  GOLD ON BLACK = COMMAND  ·  SEAL = EARTH ADMINISTRATION". In the bottom right corner, very small: "CCA ART BIBLE — RANKS REV 1".

ACCURACY: count the bars and stars exactly as listed for each rank — never add or omit any. Bars on the protection grades go 0, 1, 2, 3, 4, 5. Star counts go 1, 2, 3 for the officers and again 1, 2, 3 for command. Keep every rank code exactly as written, with the same capitalisation (RcT, EpU, OfC, SqL, DvL, AdC, CmD, SeC). All fourteen columns are the same width.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, matching the attached references exactly, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey palette with civil protection blue, silver, cyan and muted gold accents, worn fabric and scuffed ceramic textures, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

**Plan B:** om modellen inte klarar alla fjorton kolumner, ställ de två färdiga arken ovanpå varandra i ett bildprogram (Photopea är gratis i webbläsaren) och lägg titelbanderollen och legenden överst och underst. Det ger ofta det skarpaste resultatet.

## PROMPT R2 + R3: Delad version (om R1 blir rörig)

Fjorton rader med text är mycket för en bildmodell. Bli det fel, kör två ark och sätt ihop dem.

**R2: Rekryt till Elit (RcT, 05–01, EpU)**, 3:2 liggande:

```
Rank insignia reference sheet for the enlisted grades of a fictional dystopian police force, "CIVIL PROTECTION — CITY 09". Title on a charcoal strip in off-white stencil: "CCA RANKS — RECRUIT TO ELITE". Neutral warm-grey background.

Seven columns in a row, left to right, lowest to highest. Each column: at the top the rank code in large bold stencil and the full name beneath; in the middle a flat woven cloth armband swatch with stitched edges, black velcro ends and "C9:D5" in bold off-white stencil; at the bottom a small three-quarter helmet bust.
1. "RcT — RECRUIT": plain mid-grey armband with small "RcT" stencil, no bars; bust: shaved-headed young recruit with no mask, grey high-collared training uniform.
2. "05": civil protection blue (#2F6FB5) armband, one thin silver bar.
3. "04": blue armband, two thin silver bars.
4. "03": blue armband, three thin silver bars.
5. "02": blue armband, four thin silver bars.
6. "01": blue armband, five thin silver bars.
Columns 2–6 share one bust: off-white ceramic full-head gas-mask helmet with large round dark lenses, cylindrical respirator canister, black radio headset.
7. "EpU — ELITE PROTECTION UNIT": blue armband with one thick polished silver bar; bust: the same helmet with polished dark-steel lens rings and a thin silver line from brow to crown.

A thin horizontal arrow beneath all columns labelled "AUTHORITY →".

ACCURACY: count the bars and stars exactly as listed for each rank — never add or omit any. Every column must show a different count, increasing from left to right. Keep the rank codes exactly as written, with the same capitalisation.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, cold overcast lighting from upper left, desaturated steel-grey and slate-blue palette with silver and cyan accents, worn fabric and scuffed ceramic, crisp linework, subtle film grain, all text sharp and correctly spelled.
```

**R3: Officerare och ledning (OfC → EA)**, 3:2 liggande:

```
Rank insignia reference sheet for the officer and command grades of a fictional dystopian police force, "CIVIL PROTECTION — CITY 09". Title on a charcoal strip in off-white stencil: "CCA RANKS — OFFICERS & COMMAND". Neutral warm-grey background, the right third of the sheet tinted darker.

Seven columns in a row, left to right, lowest to highest. Each column: rank code in large bold stencil and full name beneath at the top; a flat woven cloth armband swatch in the middle with "C9:D5" stencilled in the centre; a small three-quarter helmet bust at the bottom.
1. "OfC — FIELD OFFICER": civil protection blue (#2F6FB5) armband, one thick silver bar plus one small five-point silver star.
2. "SqL — SQUADRON LEADER": blue armband, thick silver bar plus two silver stars.
3. "DvL — DIVISION LEADER": blue armband, thick silver bar plus three silver stars.
Columns 1–3 share one bust: off-white ceramic full-head gas-mask helmet with a broad blue crest stripe from brow to crown edged by two fine silver pinstripes, large round dark lenses, cylindrical respirator, black radio headset.
4. "AdC — ADJUTANT COMMANDER": black armband with gold (#C9A13B) piping and gold "C9:D5", one thick gold bar plus one gold star.
5. "CmD — FIELD COMMANDER": black-and-gold armband, thick gold bar plus two gold stars.
6. "SeC — SECTORIAL COMMANDER": black-and-gold armband, thick gold bar plus three gold stars.
Columns 4–6 share one bust: the helmet with a darker graphite-grey ceramic shell, a gold crest stripe and gold rings around both lenses.
7. "EA — EARTH ADMINISTRATOR": no armband and no figure; a circular gold seal on black enamel: a gold laurel wreath around a downward-pointing gold V-chevron with a gold circle in its notch, "EARTH ADMINISTRATION" around the rim in small gold capitals.

A thin horizontal arrow beneath all columns labelled "AUTHORITY →".

ACCURACY: count the bars and stars exactly as listed for each rank — never add or omit any. Every column must show a different count, increasing from left to right. Keep the rank codes exactly as written, with the same capitalisation.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, cold overcast lighting from upper left, desaturated steel-grey palette with silver, blue and muted gold accents, worn fabric and scuffed ceramic, crisp linework, subtle film grain, all text sharp and correctly spelled.
```

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

## 3b. MASTERARK (Rev 2), två ark

Identiteten är delad på två masterark som hör ihop: **A** visar myndigheten (symbol, sigill, flaggor, uniform, hjälm, armband och emblem), **B** visar samhället och rangordningen (medborgare, CID och insignier). Kör dem med samma inställningar och gärna samma seed.

### MASTER A: Myndigheten

**Format:** 16:9 liggande. **Bifoga:** `uniform-union.jpg`, `helmet.jpg`, `armbands.jpg`, `emblems.jpg`, `flag-cca.jpg`, `flag-city09.jpg`, `ranks-command.jpg` (för EA-sigillet).

```
A single wide master "art bible" page for a fictional dystopian police force, "CIVIL PROTECTION — CITY 09", presenting one definitive example of each core element of the authority's visual identity. Recreate each element faithfully from the attached reference images — same designs, colours, wear and typography — arranged in a clean modular grid with thin ruled borders on weathered warm-grey paper. Every panel has a small numbered header in condensed stencil type.

TITLE BANNER across the full width: "CIVIL PROTECTION // CITY 09 — VISUAL IDENTITY" in large off-white stencil letters on a weathered charcoal strip, a thin cyan rule beneath, and a small subtitle: "MASTER SHEET A — THE AUTHORITY · ART BIBLE REV 2".

LAYOUT — three columns:

LEFT COLUMN (narrow, stacked top to bottom):
01 "SYMBOL": the core emblem of the authority drawn large and flat on black: a bold downward-pointing V-chevron with a solid circle nested in its notch, in muted gold (#C9A13B). Beneath it, the same symbol in off-white and in charcoal as one-colour variants.
02 "SEAL OF EARTH ADMINISTRATION": a circular gold seal on black enamel — a gold laurel wreath around the gold V-chevron with its circle, the words "EARTH ADMINISTRATION" around the upper rim in small gold capitals.
03 "FLAGS": two flags side by side, each flat, 2:3 proportion. CCA FLAG: black field with alternating muted gold and off-white sunburst rays radiating from the bottom centre, a gold V-chevron with a circle in its notch in the upper half, a thin gold border, "C.C.A." stencilled at the bottom. CITY 09 FLAG: deep slate-blue field with a large off-white stencil "09" in the upper left, a thin black needle-like spire rising from a black five-arched dam, a white wave line beneath the dam, a narrow cyan stripe along the bottom.

CENTRE COLUMN (wide, the visual focus):
04 "UNIFORM — UNION 05": one full-body officer standing in a neutral A-pose, front view, large, filling the column. Off-white ceramic full-head gas-mask helmet; dark charcoal-navy padded jacket with a tall stand-up collar; quilted ballistic vest with horizontal padded ribs; a white double-bar patch on the left chest; light grey shoulder panels with thin blue edge stripes; a round UNION emblem patch on the right sleeve; a civil protection blue armband "C9:D5" with one thin silver bar on the left upper arm; two black duty belts with silver buckles, a radio with a cyan light; black gloves; dark grey-green trousers with a light grey side stripe; tall black boots. A black stun baton with a glowing copper-coil tip hangs from the right hand. Thin callout lines label "HELMET", "VEST", "ARMBAND", "DIVISION PATCH", "DUTY BELT", "STUN BATON".

RIGHT COLUMN (stacked top to bottom):
05 "HELMET": the off-white ceramic full-head gas-mask helmet in two views side by side — front and three-quarter — with a raised centre seam, two large round lenses in black rubber rims, a cylindrical gunmetal respirator canister with ridged rings and a black radio headset with stub antenna. A small inset beneath shows the lenses glowing pale cyan in darkness.
06 "ARMBAND": one flat woven cloth armband swatch, civil protection blue (#2F6FB5), stitched edges, black velcro ends, a small circular stun-baton glyph on the left, "C9:D5" in bold off-white stencil in the centre, one thin silver rank bar on the right. Beneath it a strip of six small colour chips labelled UNION, HELIX, JURY, RAZOR, SPEAR, OA (blue, white-teal, crimson, gold, orange, violet).
07 "DIVISION EMBLEMS": the UNION emblem shown large — a bevelled brushed-steel ring whose upper arc is civil protection blue, a sharp downward steel V-chevron breaking through the top, a faint wireframe globe behind, a recessed central medallion with an embossed bone-white upright stun baton and two small electric arcs. Beneath it, the other five division emblems in a small row at one-third size, each labelled: HELIX (teal arc, double helix), JURY (crimson arc, cracked skull), RAZOR (gold arc, shield split by a blade), SPEAR (orange arc, spearhead through a broken triangle), OA (violet arc, chevrons under a star).

FOOTER: a colour palette strip with labelled swatches — #2F6FB5 UNION, #3FB8A8 HELIX, #A3262A JURY, #C9A13B RAZOR / COMMAND, #D9641E SPEAR, #6B4FA0 OA, #26394A CITY 09, #5FC8DD CYAN, #1B2226 CHARCOAL.

ACCURACY: keep every label exactly as written. Each element appears once at full detail; only the small emblem row repeats the emblem design.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, matching the attached references exactly, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey and slate-blue palette with civil protection blue, cyan, silver and muted gold accents, worn fabric and scuffed ceramic textures, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

### MASTER B: Samhället och rangordningen

**Format:** 16:9 liggande. **Bifoga:** `citizen-base.jpg`, `citizen-commended.jpg`, `citizen-watch.jpg`, `ranks-enlisted.jpg`, `ranks-command.jpg`, och gärna den färdiga Master A som stilreferens.

```
A single wide master "art bible" page for a fictional dystopian city, "CITY 09", presenting its citizens and the rank order of its police force on one poster. Recreate each element faithfully from the attached reference images — same designs, colours, wear and typography — arranged in a clean modular grid with thin ruled borders on weathered warm-grey paper, matching the companion sheet "Master Sheet A". Every panel has a small numbered header in condensed stencil type.

TITLE BANNER across the full width: "CIVIL PROTECTION // CITY 09 — VISUAL IDENTITY" in large off-white stencil letters on a weathered charcoal strip, a thin cyan rule beneath, and a small subtitle: "MASTER SHEET B — CITIZENS & RANKS · ART BIBLE REV 2".

TOP HALF — "CITIZENS" (three panels side by side, equal width):
08 "CITIZEN — STANDARD": a full-body adult citizen, neutral pose, front view, in the standard-issue faded blue-teal work jacket (#3E5F6E) with a short mandarin stand collar and a row of small dark buttons, an off-white undershirt, dark indigo work trousers and worn brown leather shoes. Inset: close-up of the off-white cloth chest label on the wearer's right chest reading "CID 48271" above a small barcode.
09 "CITIZEN — COMMENDED": the same uniform visibly newer, cleaner and well fitted, worn by a well-fed man with a careful half-smile; a small round enamel pin with a gold rim and a gold V-chevron above the chest label; a gold line printed under the barcode. Inset: the label reading "CID 22614" with its gold line, and a grey "PRIORITY ALLOCATION" ration card with a gold corner stripe.
10 "CITIZEN — UNDER WATCH": the same uniform old, torn at the elbow and knee, worn by a thin, tense woman glancing sideways; the chest label "CID 39058" overprinted with a bold red (#A3262A) diagonal stripe and a small red "OBS"; a grey monitoring band with a cyan light on her wrist. Inset: the back of the jacket with a large faded red barred circle and "D5" beneath.

BOTTOM HALF — 11 "RANK INSIGNIA" (full width): a horizontal ladder of fourteen equal columns, left (lowest) to right (highest), each with the rank code in bold stencil, a small armband tab with the insignia, and a tiny helmet head beneath, separated by thin vertical rules. A long arrow under all columns labelled "AUTHORITY →".
- "RcT": grey tab "C9:D5 RcT", no bars; tiny head: shaved-headed recruit with no mask.
- "05", "04", "03", "02", "01": civil protection blue tabs with exactly 1, 2, 3, 4 and 5 thin silver bars; tiny head: the standard off-white helmet.
- "EpU": blue tab with ONE single wide silver bar; tiny head: the helmet with a thin silver-blue crest stripe.
- "OfC", "SqL", "DvL": blue tabs with one wide silver bar plus 1, 2 and 3 silver stars; tiny head: the helmet with a broad blue crest stripe.
- "AdC", "CmD", "SeC": black tabs with gold piping, one wide gold bar plus 1, 2 and 3 gold stars; tiny head: the graphite-grey helmet with a gold crest stripe and gold lens rings.
- "EA": no tab and no head — the small circular gold seal with a laurel wreath around the V-chevron.
Below the ladder, a legend in small stencil type: "THIN BAR = PROTECTION GRADE · WIDE BAR = ELITE AND ABOVE · STAR = OFFICER GRADE · GOLD ON BLACK = COMMAND · SEAL = EARTH ADMINISTRATION".

FOOTER: a typography sample "STENCIL — C9:D5 — CID 0123456789" and small swatches #3E5F6E CITIZEN, #A3262A OBSERVATION, #C9A13B COMMENDATION.

ACCURACY: keep every label, CID number and rank code exactly as written (RcT, EpU, OfC, SqL, DvL, AdC, CmD, SeC, EA). Count the bars and stars exactly as listed — protection grades 0, 1, 2, 3, 4, 5 bars; officers 1, 2, 3 stars; command 1, 2, 3 stars. All fourteen rank columns are the same width.

STYLE: gritty semi-realistic dystopian concept art, production design sheet quality, matching the attached references exactly, Eastern-European brutalist occupation aesthetic, cold overcast lighting from upper left, desaturated steel-grey and faded blue-teal palette with civil protection blue, red, silver, cyan and muted gold accents, worn fabric and scuffed ceramic textures, crisp linework under painted rendering, subtle film grain, clean orthographic presentation, all text sharp and correctly spelled.
```

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

**Allmän regel för enhetsporträtt:**
- Skriv "copy exactly the helmet/armband in the attached image" och bifoga en utklippt referens per detalj (`assets/img/ref/`).
- Beskriv headsetet som en *rundad hörlurskåpa med kort stubbantenn*, strecken som *VERTICAL* och armbandet som ett *wraparound band, not a patch*.
- Avsluta med en DO NOT-rad.
- **Designation på axeln (kanon):** enhetens fullständiga designation stencilerad med små benvita bokstäver på **vänster axelpanel, direkt ovanför armbandet**. Distriktet på armbandet ska matcha designationen, så en D1-enhet bär `C9:D1`. Promptrad: `The stencilled designation "CCA.C9.D5-UNION-02-48151" in small off-white letters on the left shoulder panel, directly above the armband. Everything pressed, tight, regulation-perfect.`

### Rook, Granite & the Tinker (Rev 3)

Gemensamt för alla: 1:1 eller 4:5, samma ID-fotouppställning som Mira, Halloran, Tomas och Ilse. **Bifoga alltid Mira-porträttet som stilreferens.** Enheter bifogar dessutom `ranks-enlisted.jpg` (manskap) eller `ranks-command.jpg` (officerare) och `armbands.jpg`.

#### Rook A: med mask

**Bifoga:** Mira-porträttet, `ranks-enlisted.jpg`, `armbands.jpg`.

```
Head-and-shoulders personnel file portrait of a masked civil police officer known as "Rook", a UNION division 02 Protection Unit, in the exact framing, lighting and background of the attached portrait of the young woman: plain near-black background, flat cold registration-booth light, faint cyan rim light.

POSE: body turned about 25 degrees so his LEFT shoulder and upper arm face the camera, head turned back to look straight into the lens. Lean, wiry build, slightly hunched, restless.

HELMET — copy exactly the helmet shown in the "02" column of the attached rank sheet:
- off-white bone-grey ceramic shell, smooth rounded dome, only a thin raised centre seam, NO coloured stripe;
- two large round eye openings in thick black rubber rims, dark smoked lenses with a faint cyan sheen;
- angular sculpted cheek plates sweeping down from the eyes;
- at the mouth a round gunmetal respirator filter with a second, smaller round filter directly beneath it;
- the ONLY electronics: one compact rounded black earmuff-style headset cup over the LEFT ear (right side of the image), ribbed housing, one short stub antenna no longer than a finger.
PERSONAL WEAR: the LEFT lens (right side of the image) has a long diagonal crack. The shell is heavily scuffed, chipped at the brow, grime in the seams.

ARMBAND — copy exactly the blue UNION armband from the attached armband sheet: a cloth band wrapped all the way around the left upper arm (a band, NOT a square patch), civil protection blue #2F6FB5, stitched edges; a small circular stun-baton glyph on the left, "C9:D5" in bold off-white stencil in the centre, EXACTLY FOUR thin silver bars standing VERTICALLY side by side on the right.

UNIFORM: dark charcoal-navy padded jacket with a tall stand-up collar zipped high, quilted ballistic vest with thick horizontal padded ribs, light grey shoulder panels with a thin blue edge stripe.

DETAILS: one gloved hand holds a black stun baton loosely across his chest, thumb on the switch, as if he is about to tap it against his thigh. A few flecks of cigarette ash on the collar.

The stencilled designation "CCA.C9.D5-UNION-02-48151" in small off-white letters on the left shoulder panel, directly above the armband.

DO NOT include: a walkie-talkie or box radio on the helmet, a tall antenna, a square shoulder patch, horizontal rank bars, a single cylindrical respirator, a smooth featureless faceplate, a coloured stripe on the helmet.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, matching the attached references exactly, desaturated steel-grey and slate-blue palette with civil protection blue and cyan accents, subtle film grain, all text sharp and correctly spelled.
```

#### Rook B: utan mask, på taket

**Bifoga:** Mira-porträttet och den färdiga Rook A (så att hjälm och armband matchar).

```
Head-and-shoulders character portrait of "Rook", the same civil police officer as in the attached masked portrait, now unmasked for the first time, on a rooftop at night. Same framing and plain near-black background as the attached portrait of the young woman, with only a faint hint of cold night sky and two distant red warning lights at the very edge of the frame.

FACE: a man in his early forties, older than his restless movements suggest. A long narrow face with a long jaw and hollow cheeks; two days of dark stubble greying at the chin; sharp tired grey eyes with crow's feet and dark shadows beneath. A thin white scar runs vertically through his LEFT eyebrow (right side of the image), lining up with the crack on his mask's left lens. Dark brown hair cropped very short, flattened and damp from hours under the helmet; a faint red pressure line across his forehead and cheekbones from the mask seal. Expression: a dry, guarded half-smile that is mostly exhaustion — the face of a man telling you a story he has never told anyone.

MASK: his helmet from the attached masked portrait — off-white ceramic, cracked left lens, round double respirator filter, small earmuff headset — pushed up and resting on top of his head.

CLOTHING: the same dark charcoal-navy padded jacket, collar unzipped and folded open, the quilted vest beneath. The blue wraparound armband with "C9:D5" and four VERTICAL silver bars just visible on his left upper arm.

DETAILS: a real pre-war cigarette between two fingers of a bare hand near his mouth, a thin curl of smoke drifting across the frame; its ember is the only warm light in the image. One black glove tucked into his collar.

LIGHTING: cold blue-grey night light from above, a small warm orange glow from the ember on the underside of his face, faint cyan rim light at the edges.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, desaturated palette with one warm accent, subtle film grain, believable skin texture.
```

#### Granite (UNION SqL), Rev 4

**Bifoga i denna ordning:** `ref/sql-armband.jpg`, `ref/sql-helmet.jpg`, Mira-porträttet.

```
Head-and-shoulders personnel file portrait of a masked civil police squadron leader known as "Granite", UNION division, District 5, in the framing, lighting and background of the THIRD attached image (the portrait of the young woman): plain near-black background, flat cold registration-booth light, faint cyan rim light.

POSE: facing the camera almost dead straight, body turned only about 15 degrees so his LEFT upper arm is clearly visible. Completely still, like a wall. An enormous, heavy man whose thick neck and shoulders fill the frame edge to edge. Both gloved hands rest together on a grey data slate held flat against his chest, its screen glowing faintly cyan with a duty roster.

HELMET — copy exactly the helmet in the SECOND attached image:
- off-white bone-grey ceramic shell with ONE broad civil protection blue (#2F6FB5) crest stripe from brow to crown;
- two large round eye openings in thick black rubber rims, dark smoked lenses with a faint cyan sheen, BOTH lenses intact and uncracked;
- angular sculpted cheek plates; a round gunmetal respirator filter with a smaller round filter directly beneath it;
- the ONLY electronics: one compact rounded black earmuff-style headset cup over the LEFT ear with one short stub antenna.
PERSONAL WEAR: the blue stripe is scratched and worn almost to grey along the crown; the ceramic is old but carefully maintained.

ARMBAND — copy exactly the armband in the FIRST attached image, now wrapped around his left upper arm as a cloth band (NOT a square patch): civil protection blue, "C9:D5" in bold off-white stencil, then ONE single WIDE vertical silver bar — as tall as the armband and about three times the width of a normal thin bar — followed by EXACTLY TWO large five-point silver stars, each star as tall as the letters of "C9:D5", side by side with a small gap between them. Bar and stars are embroidered in raised silver thread.

UNIFORM: dark charcoal-navy padded jacket with a tall stand-up collar, quilted ballistic vest with thick horizontal padded ribs, light grey shoulder panels with blue edge stripes, a white vertical double-bar patch on the left chest.

The stencilled designation "CCA.C9.D5-UNION-SqL-11902" in small off-white letters on the left shoulder panel, directly above the armband. Everything pressed, tight, regulation-perfect.

DO NOT include: any cup, mug, drink or steam; a cracked lens; a walkie-talkie or box radio; a tall antenna; a square shoulder patch; thin or multiple rank bars; small, tiny or clustered stars; more or fewer than two stars.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, matching the attached references exactly, desaturated steel-grey and slate-blue palette with civil protection blue, silver and cyan accents, subtle film grain, all text sharp and correctly spelled.
```

**Om du hellre rättar den befintliga bilden:** bifoga den + `ref/sql-armband.jpg` och skriv: *"Edit the first image. Remove the metal cup and all steam completely and extend his gloved hand over the slate. Remove the crack from the right lens. Replace the insignia on the armband with an exact copy of the second image: one wide vertical silver bar followed by exactly two large silver stars as tall as the C9:D5 letters. Keep everything else identical."*

#### The Tinker

**Bifoga:** Mira-porträttet, Halloran-porträttet (samma åldersnivå och hudtextur) och `citizen-base.jpg`.

```
Head-and-shoulders character portrait of an elderly radio repairman known only as "the Tinker", in the exact framing, lighting and background of the attached portrait of the young woman: plain near-black background, flat cold registration-booth light, faint cyan rim light — plus a warm yellow work-lamp glow from the left side.

POSE: facing the camera straight on, chin slightly lowered, looking at the viewer OVER the top of his spectacles. Both hands raised into frame at chest height.

FACE: a man in his mid-sixties. Completely bald, the scalp shiny with faint age spots, a fringe of short white stubble above the ears. A round, heavy face with jowls, a broad flattened nose, deep lines around the mouth, a neatly trimmed short grey beard. Thick heavy black-framed spectacles with scratched lenses slid down to the tip of his nose. Small, very sharp pale grey eyes — calm, amused, and examining the viewer more thoroughly than any interrogator. A faint closed-mouth smile. Skin texture and age detail like the attached old man.

CLOTHING: the standard-issue citizen jacket exactly as in the attached base citizen sheet — faded blue-teal denim-like canvas, short mandarin stand collar, row of small dark buttons — very worn and patched, under a heavy brown leather work apron scorched with small burn marks and solder spatter. On the wearer's right chest (left side of the image), the off-white cloth ID label in black stencil "CID 07731" above a small barcode, singed at one corner. A coil of thin copper wire looped over one shoulder; a jeweller's loupe on a cord around his neck.

HANDS: he holds a small gutted pre-war radio chassis full of glass valves and coloured wires. His fingertips are visibly scarred and shiny from old solder burns, nails short and black with grease. A thin wisp of soldering smoke rises from the chassis.

HIDDEN DETAIL: scratched small and faint on the inside of the radio's open back panel, a lambda symbol "λ".

DO NOT include: a uniform, a helmet, armour, hair on top of the head, round wire glasses (the frames are thick and black).

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, matching the attached references exactly, desaturated palette of browns and faded blue-teal with one warm accent, subtle film grain, believable aged skin texture, all text sharp and correctly spelled.
```


### Varianter (byggs på basen senare)

Lägg till i slutet av prompt A eller B:

- **Nedgången / svältande:** `jacket torn at one shoulder and patched with mismatched grey fabric, ID label half peeled off, hollow cheeks, filthy hands`
- **Fabriksarbetare (D2 the Works):** `blue dye stains on both forearms and the jacket front, a grey canvas work apron over the jacket, cotton dust in the hair`
- **Lojalist med utmärkelse** (fullständig prompt: C): `a small yellow circular commendation pin above the ID label, the jacket noticeably cleaner and better fitted`
- **Under bevakning** (fullständig prompt: D): `a red diagonal stripe printed across the ID label, the person glancing sideways nervously`
### Thirty, the Magistrate, HELIX 02 & Katya (Rev 1)

Samma uppställning som övriga porträtt. Utklippta referenser ligger i `assets/img/ref/`. **Bifoga alltid en referens per detalj, i den ordning prompten nämner dem.** Kör varje porträtt i en ny chatt, så att egenskaper från tidigare bilder (som Rooks spräckta lins) inte smittar av sig.

#### Thirty (UNION OfC, drillinstruktör)

**Bifoga:** 1 `ref/ofc-helmet.jpg` · 2 `ref/ofc-armband.jpg` · 3 Granite-porträttet (stil för maskerade enheter).

```
Head-and-shoulders personnel file portrait of a masked civil police drill instructor known to recruits as "Thirty", a UNION division Field Officer, in the exact framing, lighting and background of the THIRD attached image: plain near-black background, flat cold registration-booth light, faint cyan rim light.

POSE: standing rigidly at attention, chest out, hands clasped behind his back (not visible), body turned about 20 degrees so his LEFT upper arm faces the camera, head turned square to the lens. Medium height, compact and hard, like a coiled spring.

HELMET — copy exactly the helmet in the FIRST attached image: off-white bone-grey ceramic shell with one broad civil protection blue crest stripe from brow to crown; two large round eye openings in thick black rubber rims; angular sculpted cheek plates; a round gunmetal respirator filter with a smaller round filter directly beneath it; ONE compact rounded black earmuff-style headset over the left ear with one short stub antenna.
PERSONAL WEAR: a deep old gouge scar running diagonally across the ceramic over the LEFT eye socket (right side of the image) and scoring the rim of the left lens — the lens itself is intact, not cracked. The shell is otherwise immaculate and polished.

ARMBAND — copy exactly the SECOND attached image, as a cloth band wrapped around his left upper arm (NOT a square patch): civil protection blue, "C9:D1" in off-white stencil, ONE wide VERTICAL silver bar followed by EXACTLY ONE large silver five-point star as tall as the letters.

UNIFORM: dark charcoal-navy padded jacket with a tall stand-up collar zipped to the chin, quilted ballistic vest with horizontal padded ribs, light grey shoulder panels with blue edge stripes, a white vertical double-bar patch on the left chest. The stencilled designation "CCA.C9.D1-UNION-OfC-30117" in small off-white letters on the left shoulder panel, directly above the armband. Everything pressed, tight, regulation-perfect.

DO NOT include: a cracked lens, a walkie-talkie or box radio, a tall antenna, a square shoulder patch, thin or multiple bars, more than one star, any weapon in hand, a relaxed posture.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, matching the attached references exactly, desaturated steel-grey and slate-blue palette with civil protection blue, silver and cyan accents, subtle film grain, all text sharp and correctly spelled.
```

#### The Magistrate (JURY DvL)

**Bifoga:** 1 `ref/dvl-helmet.jpg` · 2 `ref/dvl-armband.jpg` · 3 `ref/armband-jury.jpg` · 4 `uniform-jury.jpg` · 5 Granite-porträttet.

```
Head-and-shoulders personnel file portrait of a masked military police commander known as "the Magistrate", a JURY division Division Leader, in the exact framing, lighting and background of the FIFTH attached image: plain near-black background, but lit lower and colder than usual, with a faint deep-red rim light instead of cyan.

POSE: perfectly still, upright, chin very slightly raised, head tilted a few degrees to one side as if listening to something only he can hear. Body turned about 20 degrees so his LEFT upper arm faces the camera. One gloved hand raised into frame, the fingers resting lightly together, almost delicate.

HELMET — copy the shape of the helmet in the FIRST attached image exactly, but recoloured for JURY: off-white bone-grey ceramic shell with one broad DEEP CRIMSON (#A3262A) crest stripe from brow to crown edged by two fine silver pinstripes; two large round eye openings in thick black rubber rims fitted with very dark, almost black lenses that show only a faint red glint; angular sculpted cheek plates; a round gunmetal respirator filter with a smaller round filter beneath it; ONE compact rounded black earmuff-style headset over the left ear with a short stub antenna. The ceramic is spotless, almost polished — no scratches, no grime.

ARMBAND — a cloth band wrapped around his left upper arm (NOT a square patch) in the colour, fabric and glyph of the THIRD attached image (deep crimson, cracked-skull glyph on the left), with the insignia of the SECOND attached image: "C9:D5" in off-white stencil, ONE wide VERTICAL silver bar followed by EXACTLY THREE silver five-point stars, each as tall as the letters.

UNIFORM — as in the FOURTH attached image: near-black charcoal padded jacket with a tall stand-up collar, near-black quilted ballistic vest, dark grey shoulder panels with crimson edge stripes, a white vertical double-bar patch on the left chest. Black polished leather gauntlets reaching toward the elbow. Everything immaculate and severe, almost ceremonial.

The stencilled designation "CCA.C9.D5-JURY-DvL-02842" in small off-white letters on the left shoulder panel, directly above the armband.

DO NOT include: a blue stripe, cyan lens glow, a cracked lens, a walkie-talkie or tall antenna, a square shoulder patch, horizontal bars, fewer or more than three stars, any visible weapon, any dirt or wear.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, matching the attached references exactly, desaturated near-black and steel-grey palette with deep crimson and silver accents, subtle film grain, all text sharp and correctly spelled.
```

#### HELIX-instruktören (HELIX 02-77301), Rev 2

**Bifoga i ordning:** 1 `ref/02-helmet.jpg` · 2 `ref/armband-helix.jpg` · 3 `ref/02-armband.jpg` · 4 `uniform-helix.jpg` · 5 Thirty- eller Granite-porträttet (stil för maskerade enheter). Kör den i en ny chatt.

```
Head-and-shoulders personnel file portrait of a masked civil police field medic, a woman, HELIX medical division, grade 02, in the exact framing, lighting and background of the FIFTH attached image: plain near-black background, flat cold clinical light from slightly above, faint pale-green rim light instead of cyan.

POSE: body turned about 25 degrees so her LEFT shoulder and upper arm face the camera, head turned back to look straight into the lens. Slim, narrow-shouldered build, posture composed but tired, shoulders a little rounded. Both hands raised into frame at chest height: she is peeling a thin pale grey nitrile glove off her left hand, revealing the black tactical glove beneath; a few small fresh drops of blood on the nitrile.

HELMET — copy the exact shape of the helmet in the FIRST attached image:
- off-white bone-grey ceramic shell, smooth rounded dome, only a thin raised centre seam, NO coloured stripe of any kind;
- two large round eye openings in thick black rubber rims fitted with PALE GREEN-TINTED lenses that glow very faintly;
- angular sculpted cheek plates sweeping down from the eyes;
- a round gunmetal respirator filter with a second, smaller round filter directly beneath it;
- the ONLY electronics: one compact rounded black earmuff-style headset cup over the LEFT ear (right side of the image) with one short stub antenna.
PERSONAL WEAR: the ceramic is clean and clinical, wiped down many times, with faint pale ghost-stains where blood has been scrubbed off around the jaw.

ARMBAND — a cloth band wrapped all the way around her left upper arm (a band, NOT a square patch), with the colours, fabric and glyph of the SECOND attached image: clinical white (#E9EEF0) with teal (#3FB8A8) piping along both edges and a circular double-helix glyph on the left. In the centre "C9:D1" in bold charcoal stencil. On the right the insignia of the THIRD attached image: EXACTLY FOUR thin VERTICAL silver bars standing side by side.

DESIGNATION: the stencilled designation "CCA.C9.D1-HELIX-02-77301" in small off-white letters on the left shoulder panel, directly above the armband. Everything clean, pressed, regulation-perfect.

UNIFORM — as in the FOURTH attached image: dark charcoal-navy padded jacket with a tall stand-up collar zipped to the chin, quilted ballistic vest with horizontal padded ribs, light grey shoulder panels with thin teal edge stripes, a white vertical double-bar patch on the left chest, a clean white band wrapped around the left forearm. A white hard-shell medical satchel strap crosses her chest diagonally, and the top of a small glass canister of glowing pale-blue biogel shows in a loop on the strap.

DO NOT include: a coloured stripe on the helmet; dark, black or cyan lenses; a cracked lens; a walkie-talkie or box radio; a tall antenna; a square shoulder patch; horizontal bars; more or fewer than four bars; "C9:D5" on the armband; a smiling or soft feminine mask — the helmet is the same unisex ceramic helmet as every other unit.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, matching the attached references exactly, desaturated steel-grey palette with clinical white, teal and pale green accents, subtle film grain, all text sharp and correctly spelled.
```

#### Katya (Miras vän, Stack 9, rebell)

**Bifoga:** 1 Mira-porträttet · 2 `citizen-base.jpg`.

```
Head-and-shoulders character portrait of Katya, a seventeen-year-old mill girl from an occupied dystopian Eastern-European city, in the exact framing, lighting and background of the FIRST attached image: plain near-black background, flat cold registration-booth light, faint cyan rim light. She must look clearly like a different person from the girl in the first image.

FACE: a round, open face with soft cheeks gone hollow from rations; a short upturned nose; thick dark-blonde eyebrows; wide-set light brown eyes with a frightened, defiant brightness, as if she has just decided something dangerous; chapped lips pressed together; a faint graze healing on her chin. Freckled, wind-reddened skin, no makeup.

HAIR: dirty dark-blonde hair in a single thick braid over one shoulder, frayed strands escaping around her face, a strand of red thread tied at the end of the braid.

CLOTHING — as in the SECOND attached image: the standard-issue faded blue-teal citizen work jacket with a short mandarin stand collar and a row of small dark buttons, a dirty off-white undershirt. On the wearer's right chest (left side of the image), the off-white cloth ID label printed in black stencil "CID 64187" above a small barcode. Grey canvas mill overall straps over the jacket, splashed with grey canal clay at the hem of what is visible.

DETAILS: the corner of a folded hand-printed leaflet just visible inside her jacket; a thin smear of blue spray paint on the side of one hand raised to her collar.

DO NOT include: a pencil behind the ear, dark brown shoulder-length hair, grey-green eyes (those belong to the girl in the first image); any weapon; makeup.

STYLE: gritty semi-realistic dystopian portrait, painterly realism with crisp detail, desaturated steel-grey and faded blue-teal palette, subtle film grain, believable skin texture, all text sharp and correctly spelled.
```


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
