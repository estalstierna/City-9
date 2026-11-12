# City 09 // Visual Style Sheet & Prompt Library

Promptbibliotek för att generera ett enhetligt referensark (och senare karaktärer och scener) till spelet. Själva prompterna är på engelska, eftersom bildmodeller följer engelska bäst. Förklaringarna är på svenska.

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

**Variant per division** (lägg till i slutet):
- UNION: `armband and shoulder stripe civil protection blue #2F6FB5`
- HELIX: `white armband with teal trim, white medical satchel with biogel canisters on the hip, teal shoulder stripe`
- JURY: `crimson armband, crimson shoulder stripe, black leather gloves to the elbow, a slate tablet on the belt`
- RAZOR: `gold armband, gold shoulder stripe, heavier ballistic plates on chest and thighs, compact SMG on a sling`
- SPEAR: `orange armband, orange shoulder stripe, grime and ash, extra ammo pouches, sealed respirator with twin filters`
- OA: `violet armband, violet shoulder stripe, long dark greatcoat over the vest, peaked officer collar insignia`

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
