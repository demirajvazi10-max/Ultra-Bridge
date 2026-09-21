# Hands-on verification checklist

Commands marked `V` (tested-by-author) were pressed on a real system by the author. The commands below are still open. Press them on a real system and note the result. Then change their code in `seed/data.mjs` from `'R'` or `'T'` to `'V'`, write a short "Tested by the author on <product>" note, and rebuild with `node seed/build-seed.mjs`.

Use input help first: Insert+1 in JAWS, NVDA+1 in NVDA. It tells you what a key does without doing it.

## Done (tested by the author)

JAWS: Insert+Tab, Insert+Page Down, Insert+1, Insert+F4, Insert+J, Insert+3, Insert+Z.
NVDA: N and M in browse mode, NVDA+F7 then Alt+B (Buttons) and Alt+D (Landmarks).

## Still open

- [ ] JAWS Insert+C: keyboard help says it speaks the misspelled or highlighted word in Spell Checker and Find and Replace. Does it also read the clipboard in a normal window?

## Also worth a quick check (single third-party source)

- [ ] JAWS Q jumps to main content and JAWS D goes to a different element.
- [ ] JAWS N skips links, JAWS I next list item, JAWS U and V unvisited and visited links.
- [ ] NVDA Numpad 5 reads the word and Numpad 2 reads the character (desktop layout).
- [ ] NVDA U and V for unvisited and visited links.

Run `node seed/print-unverified.mjs` for the current list.
