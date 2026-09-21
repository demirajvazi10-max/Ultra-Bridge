# Ultra Bridge QA report

Run: 2026-09-21T21:07:25.982Z
Summary: 15 of 15 questions answered.


## 1. What is the NVDA equivalent of JAWS Insert+F7?

Status: ok. Time: 3.6 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"jaws\" && keys==\"Insert+F7\"]{keys, layout, \"action\": action->title, \"nvda\": *[_type==\"command\" && action._ref==^.action._ref && screenReader->slug.current==\"nvda\"]{keys, layout, note, verification, \"sources\": sources[]->{title, url}}}"}

Answer:

The NVDA equivalent of JAWS Insert+F7 is NVDA+F7, using Insert as the NVDA key in the desktop layout.

- NVDA+F7 opens the Elements list, which combines links, headings, form fields, buttons and landmarks in one dialog.
- Verification: cross-checked.

Sources:
- Switching from JAWS to NVDA (NVDA wiki) (https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA)
- NVDA Keyboard Shortcuts (Deque University) (https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts)
- NVDA User Guide (https://www.nvaccess.org/files/nvda/documentation/userGuide.html)

## 2. Which keys do different jobs in JAWS and NVDA?

Status: ok. Time: 4.0 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"jaws\" && context==\"browse-mode\"]{\n  keys,\n  verification,\n  \"jawsAction\": action->title,\n  \"sources\": sources[]->{title, url},\n  \"nvdaMeansSomethingElse\": *[_type==\"command\" && screenReader->slug.current==\"nvda\" && keys==^.keys && action._ref != ^.action._ref]{\n    \"action\": action->title,\n    verification,\n    \"sources\": sources[]->{title, url}\n  }\n}[count(nvdaMeansSomethingElse)>0]{\n  keys,\n  jawsAction,\n  verification,\n  sources,\n  nvdaMeansSomethingElse\n}"}

Answer:

Here are the keys that do different jobs in JAWS and NVDA during browse mode:

- Key Q: jumps to the main content in JAWS, but jumps to the next block quote in NVDA.
- Key O: jumps to the next article in JAWS, but jumps to the next embedded object in NVDA.
- Key D: jumps to the next element of a different type in JAWS, but jumps to the next landmark in NVDA.
- Key R: jumps to the next landmark in JAWS, but jumps to the next radio button in NVDA.
- Key A: jumps to the next radio button in JAWS, but jumps to the next annotation in NVDA.
- Key S: jumps to the next element of the same type in JAWS, but jumps to the next separator in NVDA.

These commands have verification levels of cross-checked, first-party, and third-party. Third-party means the information comes from a single third-party page.

Sources:
- JAWS Keyboard Shortcuts (Deque University) https://dequeuniversity.com/screenreaders/jaws-keyboard-shortcuts
- NVDA User Guide https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- NVDA Keyboard Shortcuts (Deque University) https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts
- JAWS Keystrokes (Freedom Scientific) https://support.freedomscientific.com/Content/Documents/Manuals/JAWS/Keystrokes.txt
- Switching from JAWS to NVDA (NVDA wiki) https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA
- JAWS Commands (Penn State Accessibility) https://accessibility.psu.edu/software/jawscommands

## 3. Which JAWS commands have no default NVDA equivalent?

Status: ok. Time: 3.8 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"action\" && count(*[_type==\"command\" && action._ref==^._id && screenReader->slug.current==\"jaws\"]) > 0 && count(*[_type==\"command\" && action._ref==^._id && screenReader->slug.current==\"nvda\"]) == 0]{\n  title,\n  \"jawsCommands\": *[_type==\"command\" && action._ref==^._id && screenReader->slug.current==\"jaws\"]{\n    label,\n    keys,\n    layout,\n    verification,\n    \"sources\": sources[]->{title, url}\n  }\n}"}

Answer:

Here are the JAWS actions and commands that have no default NVDA equivalent:

- Search for a command by name:
  - Desktop layout: Insert+Space, then J
  - Laptop layout: CapsLock+Space, then J

- Jump to the main content of the page:
  - Q

- Jump to the next article:
  - O

- Jump to the next element of a different type:
  - D

- Jump to the next element of the same type:
  - S

Verification levels vary: the search commands are first-party, the article navigation is cross-checked, and the main content and element jumping commands come from third-party sources.

Sources:
- JAWS Keystrokes (Freedom Scientific) (https://support.freedomscientific.com/Content/Documents/Manuals/JAWS/Keystrokes.txt)
- JAWS Keyboard Shortcuts (Deque University) (https://dequeuniversity.com/screenreaders/jaws-keyboard-shortcuts)
- Switching from JAWS to NVDA (NVDA wiki) (https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA)
- JAWS Commands (Penn State Accessibility) (https://accessibility.psu.edu/software/jawscommands)

## 4. How do I read the whole page with NVDA on a laptop?

Status: ok. Time: 3.2 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"nvda\" && action->slug.current==\"say-all\" && layout in [\"laptop\", \"both\"]]{\n  keys,\n  layout,\n  note,\n  verification,\n  \"sources\": sources[]->{title, url}\n}"}

Answer:

To read the whole page with NVDA on a laptop, press NVDA+A. In the NVDA laptop layout, CapsLock also works as the NVDA key. This verification level is cross-checked.

Sources:
- NVDA User Guide: https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- Switching from JAWS to NVDA (NVDA wiki): https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA

## 5. I use JAWS. What should I learn first in NVDA?

Status: ok. Time: 5.3 s. Verification wording: NO. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"guide\" && slug.current match \"*jaws*nvda*\"]{title, summary, body, \"slug\": slug.current}[0...1]"}
- groq_query: {"query":"*[_type==\"guide\"]{title, summary, \"slug\": slug.current}[0...10]"}
- groq_query: {"query":"*[_type==\"guide\" && slug.current==\"first-hour-with-nvda\"]{title, summary, body}[0]"}

Answer:

If you know JAWS, a lot carries over. Say All is Insert+Down Arrow on the desktop layout and reading the current line is Insert+Up Arrow in both. Single letter navigation uses the same letters for headings, tables, buttons, form fields, edit fields, checkboxes, combo boxes and graphics. Stopping speech with Control works the same.

The main change of vocabulary is that what JAWS calls the virtual cursor, NVDA calls browse mode. What JAWS calls forms mode, NVDA calls focus mode. What JAWS calls quick keys, NVDA calls single letter navigation, and regions are called landmarks.

Learn these three keys first:
- NVDA+N opens the NVDA menu, which is where settings live.
- NVDA+1 turns on input help, where pressing any key tells you what it does.
- NVDA+F7 opens the Elements list, which replaces the separate JAWS lists for links, headings and form fields.

Be careful with keys that change meaning: Numpad 5 reads a word in NVDA instead of a character, and R selects radio buttons instead of regions.

Sources:
- Your first hour with NVDA if you know JAWS (https://www.nvaccess.org/ and https://www.freedomscientific.com/)

## 6. Which commands in your data are not fully verified?

Status: ok. Time: 7.4 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type == \"command\" && verification in [\"recalled\", \"third-party\"]]{\n  label,\n  keys,\n  layout,\n  verification,\n  \"screenReader\": screenReader->name,\n  \"action\": action->title,\n  note,\n  \"sources\": sources[]{title, url}\n}"}
- groq_query: {"query":"*[_type == \"command\" && verification in [\"recalled\", \"third-party\"]]{\n  label,\n  keys,\n  verification\n}"}

Answer:

Here are the commands in the data that are not fully verified. Third-party commands come from a single third-party page. Recalled commands are not confirmed in a source and should be checked with input help (Insert+1 in JAWS, NVDA+1 in NVDA).

- JAWS: Exit the screen reader (desktop layout): Insert+F4 (recalled)
- JAWS: Jump to the main content of the page (both layouts): Q (third-party)
- JAWS: Keyboard help (learn what a key does) (desktop layout): Insert+1 (recalled)
- JAWS: Show a list of all landmarks (both layouts): Insert+Ctrl+Semicolon (third-party)
- JAWS: Jump to the next element of a different type (both layouts): D (third-party)
- JAWS: Jump to the next list item (both layouts): I (third-party)
- JAWS: Jump to the next unvisited link (both layouts): U (third-party)
- JAWS: Jump to the next visited link (both layouts): V (third-party)
- JAWS: Open the screen reader menu (desktop layout): Insert+J (recalled)
- JAWS: Pass the next key through to the application (desktop layout): Insert+3 (recalled)
- JAWS: Pause and resume speech (both layouts): Shift (third-party)
- JAWS: Read the clipboard (desktop layout): Insert+C (recalled)
- JAWS: Read the status bar (desktop layout): Insert+Page Down (recalled)
- JAWS: Report the control that has focus (desktop layout): Insert+Tab (recalled)
- JAWS: Skip past a block of links to the next text (both layouts): N (third-party)
- JAWS: Toggle between browse mode and focus mode (desktop layout): Insert+Z (third-party)
- NVDA: Leave forms mode / focus mode (both layouts): NVDA+Space (third-party)
- NVDA: Show a list of all buttons (both layouts): NVDA+F7, then choose Buttons (recalled)
- NVDA: Show a list of all landmarks (both layouts): NVDA+F7, then choose Landmarks (recalled)
- NVDA: Jump to the next frame (both layouts): M (recalled)
- NVDA: Jump to the next unvisited link (both layouts): U (third-party)
- NVDA: Jump to the next visited link (both layouts): V (third-party)
- NVDA: Read the current character (desktop layout): Numpad 2 (third-party)
- NVDA: Read the current word (desktop layout): Numpad 5 (third-party)
- NVDA: Skip past a block of links to the next text (both layouts): N (recalled)
- NVDA: Move between table cells (both layouts): Ctrl+Alt+Arrow keys (third-party)

Sources: None recorded

## 7. What does Insert+F7 do in NVDA?

Status: ok. Time: 5.7 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"nvda\" && keys==\"Insert+F7\"]{\n  keys,\n  layout,\n  note,\n  verification,\n  \"action\": action->title,\n  \"sources\": sources[]->{title, url}\n}"}
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"nvda\" && keys match \"F7\"]{\n  keys,\n  layout,\n  note,\n  verification,\n  \"action\": action->title,\n  \"sources\": sources[]->{title, url}\n}"}

Answer:

In NVDA, Insert+F7 opens the Elements list, which combines links, headings, form fields, buttons and landmarks in one dialog. Insert works as the NVDA key in the desktop layout. This verification level is cross-checked.

Sources:
- Switching from JAWS to NVDA (NVDA wiki) (https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA)
- NVDA Keyboard Shortcuts (Deque University) (https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts)
- NVDA User Guide (https://www.nvaccess.org/files/nvda/documentation/userGuide.html)

## 8. Kako u NVDA-u pročitam ceo prozor?

Status: ok. Time: 4.4 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"nvda\" && (action->title match \"*read*\" || action->title match \"*all*\" || action->description match \"*window*\" || action->description match \"*screen*\")]{\n  keys,\n  layout,\n  note,\n  verification,\n  \"actionTitle\": action->title,\n  \"actionDesc\": action->description,\n  \"sources\": sources[]->{title, url}\n}"}
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"nvda\" && action->slug.current==\"say-all\"]{\n  keys,\n  layout,\n  note,\n  verification,\n  \"actionTitle\": action->title,\n  \"sources\": sources[]->{title, url}\n}"}

Answer:

Za čitanje od trenutnog položaja kursora do kraja (Say All) u NVDA-u koristite sledeće prečice:
- Desktop raspored: Insert+Down Arrow
- Laptop raspored: Insert+A

U NVDA radnom okruženju taster Insert služi kao NVDA taster.

Te komande su proverene iz više izvora (cross-checked).

Sources:
- NVDA User Guide (https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- Switching from JAWS to NVDA (NVDA wiki) (https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA)
- NVDA Keyboard Shortcuts (Deque University) (https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts)

## 9. Which JAWS command lists all headings?

Status: ok. Time: 3.3 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"jaws\" && (action->title match \"*heading*\" || action->description match \"*heading*\" || label match \"*heading*\")]{\n  label,\n  keys,\n  layout,\n  context,\n  verification,\n  \"sources\": sources[]->{title, url}\n}"}

Answer:

The JAWS command to list all headings is Insert+F6.
This command is cross-checked.

Sources:
- JAWS Keystrokes (Freedom Scientific) (https://support.freedomscientific.com/Content/Documents/Manuals/JAWS/Keystrokes.txt)
- JAWS Keyboard Shortcuts (Deque University) (https://dequeuniversity.com/screenreaders/jaws-keyboard-shortcuts)
- JAWS Commands (Penn State Accessibility) (https://accessibility.psu.edu/software/jawscommands)
- Switching from JAWS to NVDA (NVDA wiki) (https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA)

## 10. What is the NVDA shortcut for the Windows Copilot key?

Status: ok. Time: 5.4 s. Verification wording: NO. Sources line: NO.

Queries:
- groq_query: {"query":"*[_type == \"command\" && screenReader->slug.current == \"nvda\" && (keys match \"*Copilot*\" || label match \"*Copilot*\" || action->title match \"*Copilot*\" || action->description match \"*Copilot*\")]{\n  label,\n  keys,\n  layout,\n  context,\n  note,\n  verification,\n  \"action\": action->title,\n  \"sources\": sources[]->{title, url}\n}"}
- groq_query: {"query":"*[_type == \"action\" && (title match \"*Copilot*\" || description match \"*Copilot*\" || phrases[] match \"*Copilot*\")]{\n  title,\n  \"slug\": slug.current\n}"}
- groq_query: {"query":"*[_type == \"command\" && screenReader->slug.current == \"nvda\" && (keys match \"*Windows*\" || keys match \"*Win*\")]{\n  label,\n  keys,\n  layout,\n  \"action\": action->title\n}[0...10]"}

Answer:

The dataset does not contain any information about a Windows Copilot key or shortcut for NVDA. The data covers JAWS and NVDA commands mainly for reading, speech, and web browsing.

## 11. How do I change the speech rate in JAWS and in NVDA?

Status: ok. Time: 9.5 s. Verification wording: NO. Sources line: NO.

Queries:
- groq_query: {"query":"*[_type == \"action\" && (title match \"speech rate*\" || description match \"speech rate*\" || phrases[] match \"speech rate*\" || title match \"*rate*\" || phrases[] match \"*rate*\")]{_id, title, description, phrases}"}
- groq_query: {"query":"*[_type == \"action\" && (title match \"*speech*\" || description match \"*speech*\" || phrases[] match \"*speech*\")]{_id, title, description, phrases}"}
- groq_query: {"query":"*[_type == \"action\"]{_id, title, description, phrases}"}
- groq_query: {"query":"*[_type==\"command\" && (keys match \"*rate*\" || label match \"*rate*\" || note match \"*rate*\")]{label, keys, layout, context, \"screenReader\": screenReader->name, \"action\": action->title}"}
- groq_query: {"query":"*[_type==\"concept\" && (title match \"*rate*\" || definition match \"*rate*\" || terms[].term match \"*rate*\")]{title, definition}"}
- groq_query: {"query":"*[_type==\"guide\" && (title match \"*speech*\" || summary match \"*speech*\" || body match \"*speech*\")]{title, summary}"}
- groq_query: {"query":"*[_type==\"command\" && (keys match \"*Ctrl*\" || keys match \"*Page*\")]{label, keys, layout, \"screenReader\": screenReader->name}"}

Answer:

The data covers JAWS and NVDA mainly for reading, speech and web browsing, but changing the speech rate is outside the data.

## 12. What is the difference between the JAWS virtual cursor and NVDA browse mode?

Status: ok. Time: 4.7 s. Verification wording: NO. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type == \"concept\" && title match \"*virtual cursor*\" || title match \"*browse mode*\"]{\n  title,\n  definition,\n  terms[]{\n    \"screenReader\": screenReader->name,\n    term,\n    note\n  },\n  \"sources\": sources[]->{title, url}\n}"}
- groq_query: {"query":"*[_type == \"concept\" && (title match \"*virtual*\" || title match \"*browse*\" || definition match \"*virtual*\" || definition match \"*browse*\")]{\n  title,\n  definition,\n  terms[]{\n    \"screenReader\": screenReader->name,\n    term,\n    note\n  },\n  \"sources\": sources[]->{title, url}\n}"}

Answer:

The JAWS virtual cursor and NVDA browse mode describe the same feature: the mode in which the screen reader gives you its own copy of a page or document so you can move through it with arrow keys and single letter keys. JAWS calls it the virtual cursor, and NVDA calls it browse mode.

- JAWS term: Virtual cursor. Note: Can be turned on and off, and has simple and screen layout variants.
- NVDA term: Browse mode. Note: Screen layout can be toggled with NVDA+V.

Sources:
- Switching from JAWS to NVDA (NVDA wiki) (https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA)

## 13. Which NVDA commands in your data were only recalled and not tested?

Status: ok. Time: 4.0 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"nvda\" && verification==\"recalled\"]{\n  label,\n  keys,\n  layout,\n  context,\n  note,\n  \"sources\": sources[]->{title, url}\n}[0...50]"}

Answer:

Recalled: these commands are not confirmed in a source and should be checked with input help (Insert+1 in JAWS, NVDA+1 in NVDA).

- NVDA: Show a list of all buttons (both layouts): NVDA+F7, then choose Buttons (keys: NVDA+F7, then choose Buttons, layout: both, context: anywhere, note: The Elements list offers a Buttons view; the exact accelerator was not confirmed.)
- NVDA: Show a list of all landmarks (both layouts): NVDA+F7, then choose Landmarks (keys: NVDA+F7, then choose Landmarks, layout: both, context: anywhere, note: The Elements list offers a Landmarks view; the exact accelerator was not confirmed.)
- NVDA: Jump to the next frame (both layouts): M (keys: M, layout: both, context: browse-mode, note: Not confirmed in the fetched excerpts.)
- NVDA: Skip past a block of links to the next text (both layouts): N (keys: N, layout: both, context: browse-mode, note: Listed as non-linked text in the NVDA single letter navigation table; not confirmed in the fetched excerpts.)

Sources: none recorded.

## 14. How do I pause speech in NVDA?

Status: ok. Time: 3.4 s. Verification wording: yes. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"nvda\" && (action->title match \"*pause*\" || action->description match \"*pause*\" || action->phrases match \"*pause*\" || label match \"*pause*\" || keys match \"*pause*\")]{\n  label,\n  keys,\n  layout,\n  note,\n  verification,\n  \"action\": action->title,\n  \"sources\": sources[]->{title, url}\n}"}

Answer:

To pause speech in NVDA, press Shift in both desktop and laptop layouts. In the NVDA desktop layout, Insert works as the NVDA key.

This command is cross-checked.

Sources:
- NVDA User Guide: https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- Switching from JAWS to NVDA (NVDA wiki): https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA

## 15. What is the NVDA command to open the Braille settings?

Status: ok. Time: 10.2 s. Verification wording: NO. Sources line: yes.

Queries:
- groq_query: {"query":"*[_type==\"command\" && screenReader->slug.current==\"nvda\" && (action->title match \"*Braille*\" || action->description match \"*Braille*\" || label match \"*Braille*\")]{\n  keys,\n  layout,\n  note,\n  verification,\n  \"actionTitle\": action->title,\n  \"sources\": sources[]->{title, url}\n}"}
- groq_query: {"query":"*[_type==\"action\" && (title match \"*Braille*\" || description match \"*Braille*\" || phrases[] match \"*Braille*\")]{\n  title,\n  \"slug\": slug.current,\n  \"category\"\n}"}
- groq_query: {"query":"*[_type==\"action\" && (title match \"*braille*\" || description match \"*braille*\")]{\n  title,\n  \"slug\": slug.current\n}"}
- groq_query: {"query":"*[_type==\"action\" && category == \"system\"]{title, \"slug\": slug.current, description}"}
- groq_query: {"query":"*[_type==\"action\"]{title, \"slug\": slug.current, category}"}

Answer:

The data does not contain a command for opening the Braille settings in NVDA. The dataset covers JAWS and NVDA mainly for reading, speech, and web browsing, and this specific action is outside the data.

Sources: No source recorded.
