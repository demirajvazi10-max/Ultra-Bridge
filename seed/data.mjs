// Ultra Bridge seed data
// Author: Demir Ajvazi
//
// Every command carries a `verification` level so the agent (and the reader) can tell
// how much to trust it:
//   cross-checked   two or more fetched sources agree, or a first-party source plus another agree
//   first-party     a single first-party document (Freedom Scientific / NV Access) states it
//   third-party     a single third-party page states it (Deque, Penn State)
//   recalled        not confirmed in a fetched source; must be checked by a human on a real system
//   tested-by-author  the author pressed the keys on a real JAWS or NVDA system and confirmed the behaviour
//
// Codes used below: X = cross-checked, F = first-party, T = third-party, R = recalled, V = tested by author.
// To confirm a recalled command on a real system, change its code from 'R' to 'V' and move the note text into a
// short "Tested by the author on <product and version>" note.

export const VERIFICATION = {
  X: 'cross-checked',
  F: 'first-party',
  T: 'third-party',
  R: 'recalled',
  V: 'tested-by-author',
}

export const screenReaders = [
  {
    id: 'jaws',
    name: 'JAWS',
    vendor: 'Freedom Scientific',
    licence: 'Commercial',
    modifierKeys: 'JAWS key: Insert (desktop layout) or CapsLock (laptop layout). Either can be used.',
    homepage: 'https://www.freedomscientific.com/products/software/jaws/',
  },
  {
    id: 'nvda',
    name: 'NVDA',
    vendor: 'NV Access',
    licence: 'Free and open source',
    modifierKeys:
      'NVDA key: Insert (numpad or extended). CapsLock can also be enabled as the NVDA key and is the usual choice with the laptop layout.',
    homepage: 'https://www.nvaccess.org/',
  },
]

export const sources = [
  {
    id: 'fs-keystrokes',
    title: 'JAWS Keystrokes (Freedom Scientific)',
    publisher: 'Freedom Scientific',
    firstParty: true,
    url: 'https://support.freedomscientific.com/Content/Documents/Manuals/JAWS/Keystrokes.txt',
  },
  {
    id: 'fs-hotkeys',
    title: 'JAWS Hotkeys (Freedom Scientific training)',
    publisher: 'Freedom Scientific',
    firstParty: true,
    url: 'https://www.freedomscientific.com/training/jaws/hotkeys/',
  },
  {
    id: 'nvda-guide',
    title: 'NVDA User Guide',
    publisher: 'NV Access',
    firstParty: true,
    url: 'https://www.nvaccess.org/files/nvda/documentation/userGuide.html',
  },
  {
    id: 'nvda-wiki-switching',
    title: 'Switching from JAWS to NVDA (NVDA wiki)',
    publisher: 'NV Access',
    firstParty: true,
    url: 'https://github.com/nvaccess/nvda/wiki/SwitchingFromJawsToNVDA',
  },
  {
    id: 'deque-jaws',
    title: 'JAWS Keyboard Shortcuts (Deque University)',
    publisher: 'Deque Systems',
    firstParty: false,
    url: 'https://dequeuniversity.com/screenreaders/jaws-keyboard-shortcuts',
  },
  {
    id: 'deque-nvda',
    title: 'NVDA Keyboard Shortcuts (Deque University)',
    publisher: 'Deque Systems',
    firstParty: false,
    url: 'https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts',
  },
  {
    id: 'psu-jaws',
    title: 'JAWS Commands (Penn State Accessibility)',
    publisher: 'Penn State University',
    firstParty: false,
    url: 'https://accessibility.psu.edu/software/jawscommands',
  },
  {
    id: 'nvda-key-commands',
    title: 'NVDA Commands Quick Reference',
    publisher: 'NV Access',
    firstParty: true,
    url: 'https://www.nvaccess.org/files/nvda/documentation/keyCommands.html',
  },
]

// Command tuple: [layout, keys, verification, sources[], note?, context?]
//   layout: 'desktop' | 'laptop' | 'both'   ('both' = same keys in either layout)
//   context defaults to 'anywhere'; use 'browse-mode' for web/document navigation keys.
const both = 'both'
const D = 'desktop'
const L = 'laptop'

export const actions = [
  // ---------------------------------------------------------------- READING
  {
    id: 'say-all',
    title: 'Read continuously from the cursor (Say All)',
    category: 'reading',
    description: 'Starts continuous reading from the current position until you stop it.',
    phrases: ['read the whole page', 'read everything', 'say all', 'continuous reading', 'read from here'],
    jaws: [
      [D, 'Insert+Down Arrow', 'X', ['fs-keystrokes', 'deque-jaws', 'psu-jaws']],
      [L, 'CapsLock+A', 'X', ['fs-keystrokes', 'psu-jaws']],
    ],
    nvda: [
      [D, 'NVDA+Down Arrow', 'X', ['nvda-guide', 'nvda-wiki-switching', 'deque-nvda']],
      [L, 'NVDA+A', 'X', ['nvda-guide', 'nvda-wiki-switching']],
    ],
  },
  {
    id: 'read-line',
    title: 'Read the current line',
    category: 'reading',
    description: 'Speaks the line the cursor is on.',
    phrases: ['read line', 'say line', 'what is on this line'],
    jaws: [
      [D, 'Insert+Up Arrow', 'X', ['fs-keystrokes', 'deque-jaws']],
      [L, 'CapsLock+I', 'X', ['fs-keystrokes', 'psu-jaws']],
    ],
    nvda: [
      [D, 'NVDA+Up Arrow', 'X', ['nvda-guide', 'nvda-wiki-switching', 'deque-nvda']],
      [L, 'NVDA+L', 'X', ['nvda-guide', 'nvda-wiki-switching']],
    ],
  },
  {
    id: 'read-word',
    title: 'Read the current word',
    category: 'reading',
    description: 'Speaks the word at the cursor.',
    phrases: ['read word', 'say word', 'current word'],
    jaws: [
      [D, 'Insert+Numpad 5', 'X', ['fs-keystrokes', 'deque-jaws']],
      [L, 'CapsLock+K', 'F', ['fs-keystrokes']],
    ],
    nvda: [
      [
        D,
        'Numpad 5',
        'T',
        ['deque-nvda'],
        'Reports the word at the review cursor, which may differ from the system caret.',
      ],
    ],
  },
  {
    id: 'read-character',
    title: 'Read the current character',
    category: 'reading',
    description: 'Speaks the single character at the cursor.',
    phrases: ['read character', 'say character', 'what letter is this'],
    jaws: [
      [D, 'Numpad 5', 'X', ['fs-keystrokes', 'deque-jaws']],
      [L, 'CapsLock+Comma', 'F', ['fs-keystrokes']],
    ],
    nvda: [
      [
        D,
        'Numpad 2',
        'T',
        ['deque-nvda'],
        'Reports the character at the review cursor. Numpad 5 in NVDA reads the word, not the character.',
      ],
    ],
  },
  {
    id: 'read-window-title',
    title: 'Read the window title',
    category: 'reading',
    description: 'Announces the title of the active window.',
    phrases: ['what window am I in', 'window title', 'title bar'],
    jaws: [
      [D, 'Insert+T', 'F', ['fs-keystrokes']],
      [L, 'CapsLock+T', 'F', ['fs-keystrokes']],
    ],
    nvda: [[both, 'NVDA+T', 'X', ['nvda-wiki-switching', 'nvda-guide', 'deque-nvda']]],
  },
  {
    id: 'report-focus',
    title: 'Report the control that has focus',
    category: 'reading',
    description: 'Reports the current focus: the window or control and its label.',
    phrases: ['where is focus', 'what is focused', 'current focus'],
    jaws: [[D, 'Insert+Tab', 'V', [], 'Tested by the author on JAWS: it says the current window and its associated label.']],
    nvda: [[both, 'NVDA+Tab', 'X', ['nvda-wiki-switching', 'nvda-guide']]],
  },
  {
    id: 'read-status-bar',
    title: 'Read the status bar',
    category: 'reading',
    description: 'Reads the bottom line of the active window, normally the status bar.',
    phrases: ['status bar', 'read bottom of window'],
    jaws: [[D, 'Insert+Page Down', 'V', [], 'Tested by the author on JAWS: it reads the bottom line of the current window.']],
    nvda: [
      [D, 'NVDA+End', 'F', ['nvda-wiki-switching']],
      [L, 'NVDA+Shift+End', 'F', ['nvda-wiki-switching']],
    ],
  },
  {
    id: 'read-selected-text',
    title: 'Read the selected text',
    category: 'reading',
    description: 'Speaks whatever text is currently selected.',
    phrases: ['read selection', 'what is selected', 'selected text'],
    jaws: [
      [D, 'Insert+Shift+Down Arrow', 'F', ['fs-keystrokes']],
      [L, 'CapsLock+Shift+A', 'F', ['fs-keystrokes']],
    ],
    nvda: [
      [D, 'NVDA+Shift+Up Arrow', 'X', ['nvda-wiki-switching', 'nvda-guide']],
      [L, 'NVDA+Shift+S', 'X', ['nvda-wiki-switching', 'nvda-guide']],
    ],
  },
  {
    id: 'read-clipboard',
    title: 'Read the clipboard',
    category: 'reading',
    description: 'Speaks the text currently on the clipboard.',
    phrases: ['read clipboard', 'what did I copy', 'clipboard text'],
    nvda: [[both, 'NVDA+C', 'X', ['nvda-wiki-switching', 'nvda-guide']]],
  },
  {
    id: 'read-time-date',
    title: 'Read the time and date',
    category: 'reading',
    description: 'Announces the system time. Pressing the same command twice announces the date.',
    phrases: ['what time is it', 'what is the date', 'system time'],
    jaws: [
      [D, 'Insert+F12', 'F', ['fs-keystrokes']],
      [L, 'CapsLock+F12', 'F', ['fs-keystrokes']],
    ],
    nvda: [[both, 'NVDA+F12', 'X', ['nvda-wiki-switching', 'nvda-guide'], 'Press twice to hear the date.']],
  },
  {
    id: 'read-formatting',
    title: 'Read text formatting',
    category: 'reading',
    description: 'Announces the font and formatting of the text at the cursor.',
    phrases: ['font', 'formatting', 'what font is this', 'bold or italic'],
    jaws: [
      [D, 'Insert+F', 'F', ['fs-keystrokes']],
      [L, 'CapsLock+F', 'F', ['fs-keystrokes']],
    ],
    nvda: [[both, 'NVDA+F', 'F', ['nvda-wiki-switching']]],
  },

  // ---------------------------------------------------------------- SPEECH
  {
    id: 'stop-speech',
    title: 'Stop speech',
    category: 'speech',
    description: 'Immediately silences whatever is being spoken.',
    phrases: ['stop reading', 'be quiet', 'shut up speech', 'silence'],
    jaws: [[both, 'Control', 'X', ['fs-keystrokes', 'deque-jaws']]],
    nvda: [[both, 'Control', 'X', ['nvda-guide', 'nvda-wiki-switching', 'deque-nvda']]],
  },
  {
    id: 'pause-speech',
    title: 'Pause and resume speech',
    category: 'speech',
    description: 'Pauses speech and lets you resume from the same place.',
    phrases: ['pause reading', 'resume speech'],
    jaws: [[both, 'Shift', 'T', ['nvda-wiki-switching'], 'Documented from the NVDA side of the comparison; verify on JAWS.']],
    nvda: [[both, 'Shift', 'X', ['nvda-guide', 'nvda-wiki-switching']]],
  },
  {
    id: 'toggle-speech-mode',
    title: 'Cycle the speech mode',
    category: 'speech',
    description: 'Switches between speech modes such as full speech, beeps and speech on demand.',
    phrases: ['mute speech', 'speech on demand', 'turn speech off'],
    jaws: [
      [D, 'Insert+Space, then S', 'F', ['fs-keystrokes']],
      [L, 'CapsLock+Space, then S', 'F', ['fs-keystrokes']],
    ],
    nvda: [[both, 'NVDA+S', 'F', ['nvda-guide']]],
  },
  {
    id: 'keyboard-help',
    title: 'Keyboard help (learn what a key does)',
    category: 'speech',
    description: 'Turns on a mode where pressing a key tells you what it does without performing it.',
    phrases: ['input help', 'what does this key do', 'learn keys'],
    jaws: [[D, 'Insert+1', 'V', [], 'Tested by the author on JAWS.']],
    nvda: [[both, 'NVDA+1', 'X', ['nvda-guide', 'deque-nvda']]],
  },

  // ---------------------------------------------------------------- SYSTEM
  {
    id: 'command-search',
    title: 'Search for a command by name',
    category: 'system',
    description: 'Lets you type what you want to do and find the command and its keys.',
    phrases: ['find a command', 'what is the shortcut for', 'search commands'],
    jaws: [
      [D, 'Insert+Space, then J', 'F', ['fs-keystrokes']],
      [L, 'CapsLock+Space, then J', 'F', ['fs-keystrokes']],
    ],
    nvda: [],
  },
  {
    id: 'exit-screen-reader',
    title: 'Exit the screen reader',
    category: 'system',
    description: 'Shuts the screen reader down.',
    phrases: ['close jaws', 'quit nvda', 'turn off screen reader'],
    jaws: [[D, 'Insert+F4', 'V', [], 'Tested by the author on JAWS.']],
    nvda: [[both, 'NVDA+Q, then Enter', 'F', ['nvda-wiki-switching'], 'A confirmation dialog appears; Enter confirms.']],
  },
  {
    id: 'open-menu',
    title: 'Open the screen reader menu',
    category: 'system',
    description: 'Opens the main menu of the screen reader for settings and tools.',
    phrases: ['settings menu', 'jaws window', 'nvda menu', 'open preferences'],
    jaws: [[D, 'Insert+J', 'V', [], 'Tested by the author on JAWS: opens the JAWS window.']],
    nvda: [[both, 'NVDA+N', 'F', ['nvda-guide']]],
  },
  {
    id: 'pass-key-through',
    title: 'Pass the next key through to the application',
    category: 'system',
    description: 'Sends the next keystroke to the program instead of letting the screen reader handle it.',
    phrases: ['let the app handle this key', 'pass through', 'ignore next key'],
    jaws: [[D, 'Insert+3', 'V', [], 'Tested by the author on JAWS.']],
    nvda: [[both, 'NVDA+F2', 'X', ['nvda-guide', 'deque-nvda']]],
  },

  // ------------------------------------------------- BROWSE-MODE QUICK KEYS
  {
    id: 'next-heading',
    title: 'Jump to the next heading',
    category: 'browse-navigation',
    description: 'Moves to the next heading. Add Shift to go backwards.',
    phrases: ['next heading', 'go to heading', 'jump by headings'],
    jaws: [[both, 'H', 'X', ['fs-keystrokes', 'deque-jaws', 'psu-jaws'], 'Shift+H for previous.', 'browse-mode']],
    nvda: [[both, 'H', 'X', ['nvda-guide', 'deque-nvda', 'nvda-wiki-switching'], 'Shift+H for previous.', 'browse-mode']],
  },
  {
    id: 'next-heading-level',
    title: 'Jump to a heading of a specific level',
    category: 'browse-navigation',
    description: 'Moves to the next heading of level 1 to 6 using the number keys.',
    phrases: ['heading level 2', 'next h2', 'jump to level'],
    jaws: [[both, '1 to 6', 'X', ['deque-jaws', 'psu-jaws'], 'Shift+number for previous.', 'browse-mode']],
    nvda: [[both, '1 to 6', 'X', ['nvda-guide', 'deque-nvda'], 'Shift+number for previous.', 'browse-mode']],
  },
  {
    id: 'next-list',
    title: 'Jump to the next list',
    category: 'browse-navigation',
    description: 'Moves to the next list on the page.',
    phrases: ['next list', 'jump to list'],
    jaws: [[both, 'L', 'X', ['psu-jaws', 'deque-jaws'], '', 'browse-mode']],
    nvda: [[both, 'L', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-list-item',
    title: 'Jump to the next list item',
    category: 'browse-navigation',
    description: 'Moves to the next item inside a list.',
    phrases: ['next list item', 'next bullet'],
    jaws: [[both, 'I', 'T', ['deque-jaws'], '', 'browse-mode']],
    nvda: [[both, 'I', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-table',
    title: 'Jump to the next table',
    category: 'tables',
    description: 'Moves to the next table on the page.',
    phrases: ['next table', 'find a table', 'jump to table'],
    jaws: [[both, 'T', 'X', ['psu-jaws', 'deque-jaws', 'fs-keystrokes'], '', 'browse-mode']],
    nvda: [[both, 'T', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-graphic',
    title: 'Jump to the next graphic',
    category: 'browse-navigation',
    description: 'Moves to the next image on the page.',
    phrases: ['next image', 'next picture', 'jump to graphic'],
    jaws: [[both, 'G', 'X', ['psu-jaws', 'deque-jaws'], '', 'browse-mode']],
    nvda: [[both, 'G', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-button',
    title: 'Jump to the next button',
    category: 'forms-and-modes',
    description: 'Moves to the next button.',
    phrases: ['next button', 'find a button'],
    jaws: [[both, 'B', 'X', ['fs-keystrokes', 'psu-jaws', 'deque-jaws'], '', 'browse-mode']],
    nvda: [[both, 'B', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-form-field',
    title: 'Jump to the next form field',
    category: 'forms-and-modes',
    description: 'Moves to the next form control of any kind.',
    phrases: ['next form field', 'next input', 'next control'],
    jaws: [[both, 'F', 'X', ['psu-jaws', 'deque-jaws'], '', 'browse-mode']],
    nvda: [[both, 'F', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-edit-field',
    title: 'Jump to the next edit field',
    category: 'forms-and-modes',
    description: 'Moves to the next text input.',
    phrases: ['next edit box', 'next text box', 'next input field'],
    jaws: [[both, 'E', 'X', ['fs-keystrokes', 'psu-jaws'], '', 'browse-mode']],
    nvda: [[both, 'E', 'F', ['nvda-guide'], '', 'browse-mode']],
  },
  {
    id: 'next-checkbox',
    title: 'Jump to the next checkbox',
    category: 'forms-and-modes',
    description: 'Moves to the next checkbox.',
    phrases: ['next checkbox', 'next check box'],
    jaws: [[both, 'X', 'X', ['fs-keystrokes', 'psu-jaws', 'deque-jaws'], '', 'browse-mode']],
    nvda: [[both, 'X', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-combo-box',
    title: 'Jump to the next combo box',
    category: 'forms-and-modes',
    description: 'Moves to the next drop-down list.',
    phrases: ['next combo box', 'next dropdown', 'next select'],
    jaws: [[both, 'C', 'F', ['fs-keystrokes'], '', 'browse-mode']],
    nvda: [[both, 'C', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-radio-button',
    title: 'Jump to the next radio button',
    category: 'forms-and-modes',
    description: 'Moves to the next radio button.',
    phrases: ['next radio button', 'next option button'],
    jaws: [
      [
        both,
        'A',
        'F',
        ['fs-keystrokes'],
        'Freedom Scientific lists A. The Penn State page lists R, which is probably from an older JAWS version.',
        'browse-mode',
      ],
    ],
    nvda: [[both, 'R', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-landmark',
    title: 'Jump to the next landmark (region)',
    category: 'browse-navigation',
    description: 'Moves to the next ARIA landmark such as main, navigation or search.',
    phrases: ['next landmark', 'next region', 'jump to main content', 'jump to navigation'],
    jaws: [
      [
        both,
        'R',
        'X',
        ['fs-keystrokes', 'deque-jaws'],
        'Called a region in JAWS. The Penn State page also lists Semicolon.',
        'browse-mode',
      ],
    ],
    nvda: [[both, 'D', 'X', ['nvda-guide', 'deque-nvda', 'nvda-wiki-switching'], 'Called a landmark in NVDA.', 'browse-mode']],
  },
  {
    id: 'next-link',
    title: 'Jump to the next link',
    category: 'browse-navigation',
    description: 'Moves to the next link on the page.',
    phrases: ['next link', 'jump to link', 'find a link'],
    jaws: [
      [
        both,
        'Tab',
        'F',
        ['fs-keystrokes'],
        'In JAWS browse mode Tab moves to the next link or other focusable element.',
        'browse-mode',
      ],
    ],
    nvda: [[both, 'K', 'X', ['nvda-guide', 'deque-nvda'], 'Tab in NVDA moves focus to the next focusable control, not only links.', 'browse-mode']],
  },
  {
    id: 'next-unvisited-link',
    title: 'Jump to the next unvisited link',
    category: 'browse-navigation',
    description: 'Moves to the next link you have not visited yet.',
    phrases: ['next unvisited link', 'new link'],
    jaws: [[both, 'U', 'T', ['deque-jaws'], '', 'browse-mode']],
    nvda: [[both, 'U', 'T', ['deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'next-visited-link',
    title: 'Jump to the next visited link',
    category: 'browse-navigation',
    description: 'Moves to the next link you have already visited.',
    phrases: ['next visited link'],
    jaws: [[both, 'V', 'T', ['deque-jaws'], '', 'browse-mode']],
    nvda: [[both, 'V', 'T', ['deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'skip-past-links',
    title: 'Skip past a block of links to the next text',
    category: 'browse-navigation',
    description: 'Jumps over a run of links to the next piece of ordinary text.',
    phrases: ['skip links', 'skip navigation links', 'next non-link text'],
    jaws: [[both, 'N', 'T', ['psu-jaws'], '', 'browse-mode']],
    nvda: [[both, 'N', 'V', [], 'Tested by the author on NVDA: skips forward past a block of links.', 'browse-mode']],
  },
  {
    id: 'next-frame',
    title: 'Jump to the next frame',
    category: 'browse-navigation',
    description: 'Moves to the next frame in a page that uses frames.',
    phrases: ['next frame', 'iframe'],
    jaws: [[both, 'M', 'F', ['fs-keystrokes'], '', 'browse-mode']],
    nvda: [[both, 'M', 'V', [], 'Tested by the author on NVDA.', 'browse-mode']],
  },
  {
    id: 'next-article',
    title: 'Jump to the next article',
    category: 'browse-navigation',
    description: 'Moves to the next article element on a page.',
    phrases: ['next article', 'jump between articles'],
    jaws: [[both, 'O', 'X', ['fs-keystrokes', 'nvda-wiki-switching'], 'Shift+O for previous.', 'browse-mode']],
    nvda: [],
  },

  {
    id: 'next-block-quote',
    title: 'Jump to the next block quote',
    category: 'browse-navigation',
    description: 'Moves to the next quoted block of text.',
    phrases: ['next quote', 'next blockquote'],
    jaws: [],
    nvda: [[both, 'Q', 'X', ['nvda-guide', 'deque-nvda'], '', 'browse-mode']],
  },
  {
    id: 'jump-to-main-content',
    title: 'Jump to the main content of the page',
    category: 'browse-navigation',
    description: 'Moves straight to the main region of a page, skipping headers and navigation.',
    phrases: ['skip to main content', 'go to main', 'skip the menu'],
    jaws: [[both, 'Q', 'T', ['deque-jaws'], '', 'browse-mode']],
    nvda: [],
  },
  {
    id: 'next-annotation',
    title: 'Jump to the next annotation',
    category: 'browse-navigation',
    description: 'Moves to the next comment, editor revision or other annotation.',
    phrases: ['next comment', 'next annotation', 'next revision'],
    jaws: [],
    nvda: [[both, 'A', 'F', ['nvda-guide'], '', 'browse-mode']],
  },
  {
    id: 'next-embedded-object',
    title: 'Jump to the next embedded object',
    category: 'browse-navigation',
    description: 'Moves to the next embedded object such as a plugin or media player.',
    phrases: ['next embedded object', 'next player', 'next plugin'],
    jaws: [],
    nvda: [[both, 'O', 'F', ['nvda-guide'], '', 'browse-mode']],
  },
  {
    id: 'next-spelling-error',
    title: 'Jump to the next spelling error',
    category: 'browse-navigation',
    description: 'Moves to the next word flagged as misspelled.',
    phrases: ['next spelling error', 'next misspelling'],
    jaws: [],
    nvda: [[both, 'W', 'F', ['nvda-guide'], '', 'browse-mode']],
  },
  {
    id: 'next-separator',
    title: 'Jump to the next separator',
    category: 'browse-navigation',
    description: 'Moves to the next horizontal separator on a page.',
    phrases: ['next separator', 'next divider'],
    jaws: [],
    nvda: [[both, 'S', 'F', ['nvda-guide'], '', 'browse-mode']],
  },
  {
    id: 'next-same-element',
    title: 'Jump to the next element of the same type',
    category: 'browse-navigation',
    description: 'Moves to the next element that is the same kind as the current one.',
    phrases: ['next same element', 'same type of element'],
    jaws: [[both, 'S', 'X', ['fs-keystrokes', 'psu-jaws'], 'Shift+S for previous.', 'browse-mode']],
    nvda: [],
  },
  {
    id: 'next-different-element',
    title: 'Jump to the next element of a different type',
    category: 'browse-navigation',
    description: 'Moves to the next element that is a different kind from the current one.',
    phrases: ['next different element'],
    jaws: [[both, 'D', 'T', ['psu-jaws'], 'Shift+D for previous.', 'browse-mode']],
    nvda: [],
  },

  // ---------------------------------------------------------- ELEMENT LISTS
  {
    id: 'list-links',
    title: 'Show a list of all links',
    category: 'element-lists',
    description: 'Opens a dialog that lists every link on the page so you can search and jump.',
    phrases: ['links list', 'list all links', 'show links'],
    jaws: [[both, 'Insert+F7', 'X', ['fs-keystrokes', 'deque-jaws', 'psu-jaws', 'nvda-wiki-switching']]],
    nvda: [
      [
        both,
        'NVDA+F7',
        'X',
        ['nvda-wiki-switching', 'deque-nvda', 'nvda-guide'],
        'Opens the Elements list, which combines links, headings, form fields, buttons and landmarks in one dialog.',
      ],
    ],
  },
  {
    id: 'list-headings',
    title: 'Show a list of all headings',
    category: 'element-lists',
    description: 'Opens a dialog that lists every heading on the page.',
    phrases: ['headings list', 'list all headings', 'page outline'],
    jaws: [[both, 'Insert+F6', 'X', ['fs-keystrokes', 'deque-jaws', 'psu-jaws', 'nvda-wiki-switching']]],
    nvda: [[both, 'NVDA+F7, then Alt+H', 'F', ['nvda-wiki-switching'], 'Alt+H selects the headings view in the Elements list.']],
  },
  {
    id: 'list-form-fields',
    title: 'Show a list of all form fields',
    category: 'element-lists',
    description: 'Opens a dialog that lists every form control on the page.',
    phrases: ['form fields list', 'list all form fields', 'list inputs'],
    jaws: [[both, 'Insert+F5', 'X', ['fs-keystrokes', 'deque-jaws', 'psu-jaws', 'nvda-wiki-switching']]],
    nvda: [[both, 'NVDA+F7, then Alt+F', 'F', ['nvda-wiki-switching'], 'Alt+F selects the form fields view in the Elements list.']],
  },
  {
    id: 'list-buttons',
    title: 'Show a list of all buttons',
    category: 'element-lists',
    description: 'Opens a dialog that lists every button on the page.',
    phrases: ['buttons list', 'list all buttons'],
    jaws: [[both, 'Insert+Ctrl+B', 'X', ['fs-keystrokes', 'psu-jaws']]],
    nvda: [[both, 'NVDA+F7, then Alt+B (Buttons view)', 'V', [], 'Tested by the author on NVDA: in the Elements list, Alt+B selects the Buttons type. Other types: Alt+K links, Alt+H headings, Alt+F form fields, Alt+D landmarks.']],
  },
  {
    id: 'list-landmarks',
    title: 'Show a list of all landmarks',
    category: 'element-lists',
    description: 'Opens a dialog that lists every landmark (region) on the page.',
    phrases: ['landmarks list', 'regions list'],
    jaws: [[both, 'Insert+Ctrl+Semicolon', 'T', ['psu-jaws']]],
    nvda: [[both, 'NVDA+F7, then Alt+D (Landmarks view)', 'V', [], 'Tested by the author on NVDA: in the Elements list, Alt+D selects the Landmarks type.']],
  },

  // ---------------------------------------------------- FORMS AND MODES
  {
    id: 'toggle-browse-focus-mode',
    title: 'Toggle between browse mode and focus mode',
    category: 'forms-and-modes',
    description:
      'Switches between reading the page with navigation keys and passing keys straight to the page.',
    phrases: ['browse mode', 'focus mode', 'virtual cursor', 'turn virtual cursor off', 'forms mode toggle'],
    jaws: [[D, 'Insert+Z', 'V', ['deque-jaws'], 'Tested by the author on JAWS: toggles the virtual cursor on or off.']],
    nvda: [[both, 'NVDA+Space', 'X', ['deque-nvda', 'nvda-guide']]],
  },
  {
    id: 'enter-forms-mode',
    title: 'Enter forms mode / focus mode on a field',
    category: 'forms-and-modes',
    description: 'Lets you type into a form field instead of navigating the page.',
    phrases: ['start typing in field', 'enter forms mode', 'edit a field'],
    jaws: [[both, 'Enter', 'X', ['fs-keystrokes', 'psu-jaws', 'deque-jaws'], 'Pressing Enter on a form field enters forms mode.']],
    nvda: [
      [
        both,
        'NVDA+Space (or automatic)',
        'X',
        ['deque-nvda', 'nvda-guide'],
        'NVDA can switch to focus mode automatically when focus moves into a field; this is configurable in browse mode settings.',
      ],
    ],
  },
  {
    id: 'exit-forms-mode',
    title: 'Leave forms mode / focus mode',
    category: 'forms-and-modes',
    description: 'Returns to browse mode after typing in a field.',
    phrases: ['exit forms mode', 'leave edit field', 'go back to browsing'],
    jaws: [[both, 'Numpad Plus', 'X', ['fs-keystrokes', 'psu-jaws', 'deque-jaws']]],
    nvda: [[both, 'NVDA+Space', 'T', ['deque-nvda'], 'When focus mode was entered automatically, moving focus away also returns to browse mode.']],
  },

  // ---------------------------------------------------------------- TABLES
  {
    id: 'table-cell-navigation',
    title: 'Move between table cells',
    category: 'tables',
    description: 'Moves to the cell right, left, above or below inside a table.',
    phrases: ['navigate table', 'next cell', 'move in table', 'table cells'],
    jaws: [[both, 'Alt+Ctrl+Arrow keys', 'X', ['psu-jaws', 'deque-jaws']]],
    nvda: [[both, 'Ctrl+Alt+Arrow keys', 'T', ['deque-nvda']]],
  },

  // ---------------------------------------------------------------- SEARCH
  {
    id: 'find-text',
    title: 'Find text',
    category: 'search',
    description: 'Opens the screen reader search dialog to find text on the page or in a document.',
    phrases: ['search page', 'find word', 'search for text'],
    jaws: [
      [
        D,
        'Insert+Ctrl+F',
        'F',
        ['fs-keystrokes'],
        'The NVDA wiki lists Ctrl+F for the JAWS find dialog, which conflicts with Freedom Scientific.',
      ],
      [L, 'CapsLock+Ctrl+F', 'F', ['fs-keystrokes']],
    ],
    nvda: [[both, 'NVDA+Ctrl+F', 'X', ['nvda-wiki-switching', 'deque-nvda']]],
  },
  {
    id: 'find-next',
    title: 'Find next',
    category: 'search',
    description: 'Jumps to the next match of the last search.',
    phrases: ['next match', 'find again'],
    jaws: [[both, 'F3', 'F', ['fs-keystrokes']]],
    nvda: [[both, 'NVDA+F3', 'F', ['nvda-wiki-switching']]],
  },
  {
    id: 'find-previous',
    title: 'Find previous',
    category: 'search',
    description: 'Jumps to the previous match of the last search.',
    phrases: ['previous match', 'find backwards'],
    jaws: [[both, 'Shift+F3', 'F', ['fs-keystrokes']]],
    nvda: [[both, 'NVDA+Shift+F3', 'F', ['nvda-wiki-switching']]],
  },
  {
    id: 'switch-independent-cursor',
    title: 'Switch to the independent reading cursor',
    category: 'cursors-and-review',
    description:
      'Moves to a cursor that reads the screen independently of the system focus and caret, and back again.',
    phrases: ['jaws cursor', 'independent cursor', 'screen review', 'object navigation cursor', 'review cursor'],
    jaws: [
      [
        D,
        'Num Pad Minus',
        'F',
        ['fs-keystrokes'],
        'Activates the JAWS cursor: a reading cursor moved with the numpad arrows, independent of the PC cursor. Num Pad Plus switches back to the PC cursor.',
      ],
      [L, 'CapsLock+P', 'F', ['fs-keystrokes'], 'Laptop layout. CapsLock+Semicolon switches back to the PC cursor.'],
    ],
    nvda: [
      [
        D,
        'NVDA+Numpad7',
        'F',
        ['nvda-key-commands'],
        'Cycles to the next review mode: object, document, then screen review. Screen review is the closest match to the JAWS cursor. NVDA+Numpad1 cycles backwards. Unlike JAWS, NVDA keeps following your typing the whole time.',
      ],
      [L, 'NVDA+Page Up', 'F', ['nvda-key-commands'], 'Cycles to the next review mode; NVDA+Page Down cycles backwards.'],
    ],
  },
  {
    id: 'switch-touch-cursor',
    title: 'Turn on the touch cursor',
    category: 'cursors-and-review',
    description:
      'Switches to a cursor made for exploring a touchscreen by touch instead of the numpad or arrow keys.',
    phrases: ['touch cursor', 'touchscreen mode', 'explore by touch'],
    jaws: [
      [D, 'Shift+Num Pad Plus', 'F', ['fs-keystrokes'], 'Turns on the JAWS touch cursor for touchscreen Windows devices.'],
      [L, 'CapsLock+Shift+Semicolon', 'F', ['fs-keystrokes']],
    ],
    nvda: [
      [
        both,
        'No key needed',
        'F',
        ['nvda-wiki-switching'],
        "NVDA turns on touch interaction by itself on a touchscreen device; explore with object navigation and touch gestures once it is active.",
      ],
    ],
  },
]

// Terminology and feature equivalents. `terms` = [readerId, term, note?]
export const concepts = [
  {
    id: 'browse-mode',
    title: 'Reading a web page with navigation keys',
    definition:
      'The mode in which the screen reader gives you its own copy of a page or document so you can move through it with arrow keys and single letter keys. NVDA calls it browse mode. JAWS calls it the virtual cursor.',
    terms: [
      ['jaws', 'Virtual cursor', 'Can be turned on and off, and has simple and screen layout variants.'],
      ['nvda', 'Browse mode', 'Screen layout can be toggled with NVDA+V.'],
    ],
    relatedActions: ['toggle-browse-focus-mode', 'next-heading'],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'forms-mode',
    title: 'Typing into form fields',
    definition:
      'The mode in which keys go straight to the page so you can type in fields. JAWS calls it forms mode. NVDA calls it focus mode.',
    terms: [
      ['jaws', 'Forms mode', 'Entered with Enter on a field, left with Numpad Plus.'],
      ['nvda', 'Focus mode', 'Toggled with NVDA+Space and can switch on automatically.'],
    ],
    relatedActions: ['enter-forms-mode', 'exit-forms-mode', 'toggle-browse-focus-mode'],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'quick-keys',
    title: 'Single letter navigation',
    definition: 'Pressing one letter to jump to the next element of a type, with Shift to go backwards.',
    terms: [
      ['jaws', 'Quick keys', ''],
      ['nvda', 'Single letter navigation', ''],
    ],
    relatedActions: ['next-heading', 'next-table', 'next-button'],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'elements-list',
    title: 'Lists of links, headings and form fields',
    definition:
      'JAWS has a separate dialog for links, headings and form fields. NVDA combines them in one Elements list opened with NVDA+F7 and switched between with Alt letters.',
    terms: [
      ['jaws', 'Links list, Headings list, Form fields list', 'Insert+F7, Insert+F6, Insert+F5.'],
      ['nvda', 'Elements list', 'NVDA+F7.'],
    ],
    relatedActions: ['list-links', 'list-headings', 'list-form-fields'],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'landmarks',
    title: 'Page regions',
    definition: 'Named areas of a page such as main content, navigation and search.',
    terms: [
      ['jaws', 'Region', ''],
      ['nvda', 'Landmark', ''],
    ],
    relatedActions: ['next-landmark', 'list-landmarks'],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'system-cursor',
    title: 'The cursor that follows the keyboard focus',
    definition: 'The cursor tied to the application keyboard focus and text caret.',
    terms: [
      ['jaws', 'PC cursor', ''],
      ['nvda', 'System focus and system caret', ''],
    ],
    relatedActions: [],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'exploration-cursor',
    title: 'The cursor for exploring the screen without moving focus',
    definition: 'A cursor that lets you read parts of the screen without changing the application focus.',
    terms: [
      ['jaws', 'JAWS cursor', 'The invisible cursor is a related, separate mode.'],
      ['nvda', 'Object navigation and the review cursor', 'The mouse does not follow the review cursor by default.'],
    ],
    relatedActions: ['read-word', 'read-character'],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'screen-blanking',
    title: 'Blanking the screen for privacy',
    definition: 'Turns the display black while the screen reader keeps working.',
    terms: [
      ['jaws', 'Screen Shade', ''],
      ['nvda', 'Screen Curtain', 'NVDA+Ctrl+Escape according to the NVDA wiki.'],
    ],
    relatedActions: [],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'remote-support',
    title: 'Remote support from another person',
    definition: 'Lets a helper connect to your computer and use it with the screen reader.',
    terms: [
      ['jaws', 'JAWS Tandem', ''],
      ['nvda', 'Remote Access', 'Built in from NVDA 2025.1 according to the NVDA wiki; older versions used an add-on.'],
    ],
    relatedActions: [],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'place-markers',
    title: 'Bookmarks inside a document',
    definition: 'Saves a position in a page or document so you can return to it.',
    terms: [
      ['jaws', 'PlaceMarkers', 'Built in.'],
      ['nvda', 'Place Markers add-on', 'Not built in. Add-on keys per the wiki: Ctrl+Shift+NVDA+Y saves, NVDA+Y next, Shift+NVDA+Y previous.'],
    ],
    relatedActions: [],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'pronunciation',
    title: 'Custom pronunciations',
    definition: 'Teaches the synthesizer how to say specific words.',
    terms: [
      ['jaws', 'Dictionary Manager', ''],
      ['nvda', 'Speech dictionaries', 'Reached from the NVDA menu under Preferences.'],
    ],
    relatedActions: [],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'per-app-settings',
    title: 'Settings that apply only in one program',
    definition: 'Different speech or navigation settings for different applications.',
    terms: [
      ['jaws', 'Application-specific settings', ''],
      ['nvda', 'Configuration profiles', 'NVDA+Ctrl+P opens the dialog.'],
    ],
    relatedActions: [],
    sources: ['nvda-wiki-switching'],
  },
  {
    id: 'cursor-types',
    title: 'Cursor and review mode terms',
    definition:
      'JAWS names distinct cursors for different reading tasks: a PC cursor for normal reading, a JAWS cursor for reading independently of focus, and a touch cursor for touchscreens. NVDA keeps one system focus and caret always active, and adds review modes and object navigation on top instead of switching cursors off.',
    terms: [
      ['jaws', 'PC Cursor', 'The default cursor; follows the system focus and caret, restored with Num Pad Plus.'],
      ['jaws', 'JAWS Cursor', 'An independent reading cursor moved with the numpad, turned on with Num Pad Minus.'],
      ['jaws', 'Touch Cursor', 'For touchscreen Windows devices, turned on with Shift+Num Pad Plus.'],
      ['nvda', 'System focus and caret', 'What NVDA reads by default; always active, the equivalent of the JAWS PC cursor.'],
      [
        'nvda',
        'Review cursor and review modes',
        'Reads independently of focus in Object, Document or Screen review; Screen review is closest to the JAWS cursor. Cycled with NVDA+Numpad7.',
      ],
      ['nvda', 'Touch mode', 'Turns on by itself on a touchscreen device; no key needed.'],
    ],
    relatedActions: ['switch-independent-cursor', 'switch-touch-cursor'],
    sources: ['nvda-wiki-switching', 'fs-keystrokes', 'nvda-key-commands'],
  },
]

// Things that will trip up someone who moves from one to the other.
export const differences = [
  {
    id: 'numpad-5',
    title: 'Numpad 5 reads a character in JAWS but a word in NVDA',
    severity: 'high',
    readers: ['jaws', 'nvda'],
    actions: ['read-character', 'read-word'],
    summary:
      'On the desktop layout, JAWS speaks the current character with Numpad 5 and the current word with Insert+Numpad 5. In NVDA, Numpad 5 reads the current word at the review cursor, and the character is on Numpad 2.',
    workaround:
      'When moving from JAWS to NVDA, retrain Numpad 5 to mean word and use Numpad 2 for a character. When moving from NVDA to JAWS, use Insert+Numpad 5 for a word.',
  },
  {
    id: 'r-key',
    title: 'The R key means region in JAWS but radio button in NVDA',
    severity: 'high',
    readers: ['jaws', 'nvda'],
    actions: ['next-landmark', 'next-radio-button'],
    summary:
      'In JAWS, R jumps to the next region (landmark) and A jumps to the next radio button. In NVDA, R jumps to the next radio button, D jumps to the next landmark, and A jumps to an annotation.',
    workaround:
      'In NVDA use D for landmarks and R for radio buttons. In JAWS use R for regions and A for radio buttons.',
  },
  {
    id: 'letter-collisions',
    title: 'Several single letter keys do different jobs in JAWS and NVDA',
    severity: 'high',
    readers: ['jaws', 'nvda'],
    actions: [
      'next-landmark',
      'next-radio-button',
      'jump-to-main-content',
      'next-block-quote',
      'next-same-element',
      'next-separator',
      'next-different-element',
      'next-article',
      'next-embedded-object',
      'next-annotation',
    ],
    summary:
      'The letters R, A, Q, S, D and O exist in both screen readers but mean different things. R is region in JAWS and radio button in NVDA. A is radio button in JAWS and annotation in NVDA. Q is main content in JAWS and block quote in NVDA. S is same element in JAWS and separator in NVDA. D is different element in JAWS and landmark in NVDA. O is article in JAWS and embedded object in NVDA.',
    workaround:
      'When you switch screen readers, do not trust your muscle memory for these letters. Use the Elements list or check the key with input help (Insert+1 in JAWS, NVDA+1 in NVDA).',
  },
  {
    id: 'o-key',
    title: 'The O key jumps to articles in JAWS but has a different meaning in NVDA',
    severity: 'medium',
    readers: ['jaws', 'nvda'],
    actions: ['next-article'],
    summary:
      'JAWS uses O and Shift+O to move between articles. The NVDA wiki says article navigation is not assigned by default in NVDA, where O is used for embedded objects.',
    workaround: 'In NVDA, assign a gesture to article navigation in the Input gestures dialog if you need it.',
  },
  {
    id: 'links-key',
    title: 'Links use Tab in JAWS browse mode but K in NVDA',
    severity: 'medium',
    readers: ['jaws', 'nvda'],
    actions: ['next-link'],
    summary:
      'JAWS moves through links with Tab in browse mode. NVDA has a dedicated single letter key, K, for links. Tab in NVDA moves the keyboard focus to the next focusable control.',
    workaround: 'In NVDA use K and Shift+K for links.',
  },
  {
    id: 'one-elements-list',
    title: 'NVDA has one Elements list instead of separate JAWS list dialogs',
    severity: 'medium',
    readers: ['jaws', 'nvda'],
    actions: ['list-links', 'list-headings', 'list-form-fields'],
    summary:
      'JAWS opens separate dialogs with Insert+F7 for links, Insert+F6 for headings and Insert+F5 for form fields. NVDA opens a single Elements list with NVDA+F7, and you switch what it shows using Alt plus a letter such as Alt+H for headings or Alt+F for form fields.',
    workaround: 'Open NVDA+F7 and then press the Alt letter for the element type you want.',
  },
  {
    id: 'modes-terminology',
    title: 'Forms mode is called focus mode in NVDA, and mode switching is different',
    severity: 'medium',
    readers: ['jaws', 'nvda'],
    actions: ['toggle-browse-focus-mode', 'enter-forms-mode', 'exit-forms-mode'],
    summary:
      'JAWS enters forms mode with Enter on a field and leaves it with Numpad Plus, and toggles the virtual cursor with Insert+Z. NVDA toggles browse and focus mode with NVDA+Space and can switch automatically depending on settings.',
    workaround:
      'In NVDA, check the browse mode settings for automatic focus mode if the behaviour surprises you.',
  },
  {
    id: 'find-conflict',
    title: 'Sources disagree about the JAWS Find keys',
    severity: 'low',
    readers: ['jaws'],
    actions: ['find-text'],
    summary:
      'Freedom Scientific lists Insert+Ctrl+F for the JAWS Find dialog, while the NVDA wiki lists Ctrl+F. In a web browser Ctrl+F normally opens the browser Find bar.',
    workaround: 'Use Insert+Ctrl+F for the JAWS dialog and NVDA+Ctrl+F for NVDA.',
  },
  {
    id: 'no-command-search',
    title: 'NVDA has no command search like JAWS Insert+Space, J',
    severity: 'low',
    readers: ['nvda'],
    actions: ['command-search'],
    summary:
      'JAWS can search for commands by name. NVDA has no direct equivalent by default; the closest tool is the Input gestures dialog under Preferences, which lists commands and their keys.',
    workaround: 'Use NVDA+1 for input help to learn a key, or browse the Input gestures dialog.',
  },
  {
    id: 'exit-confirm',
    title: 'Exiting NVDA needs a confirmation',
    severity: 'low',
    readers: ['nvda'],
    actions: ['exit-screen-reader'],
    summary: 'NVDA+Q opens an exit dialog and you confirm with Enter.',
    workaround: 'Press NVDA+Q and then Enter.',
  },
  {
    id: 'modifier-double-press',
    title: 'Modifier key setup differs',
    severity: 'low',
    readers: ['jaws', 'nvda'],
    actions: [],
    summary:
      'JAWS treats Insert or CapsLock as the JAWS key. NVDA uses Insert by default and can also use CapsLock. Pressing the NVDA key twice quickly gives you the original function of the key.',
    workaround: 'Enable CapsLock as an NVDA key in NVDA settings if you prefer it.',
  },
  {
    id: 'cursor-switch-vs-review-mode',
    title: 'JAWS switches cursors off; NVDA keeps following you',
    severity: 'medium',
    readers: ['jaws', 'nvda'],
    actions: ['switch-independent-cursor'],
    summary:
      'In JAWS, turning on the JAWS cursor with Num Pad Minus stops the PC cursor from following your typing until you switch back with Num Pad Plus. In NVDA, cycling review modes with NVDA+Numpad7 only changes what the review commands read; NVDA keeps tracking your system focus and caret the whole time, so typing and normal navigation are never interrupted.',
    workaround:
      'In NVDA, cycle back to Document review with NVDA+Numpad7 or NVDA+Numpad1 when you want the review cursor to match your focus again, or just keep typing — NVDA never disconnected from it.',
  },
]

// Long-form guides. These are also written to markdown files and imported into the Knowledge Base.
export const guides = [
  {
    id: 'first-hour-with-nvda',
    title: 'Your first hour with NVDA if you know JAWS',
    audience: 'JAWS user trying NVDA',
    summary: 'The things that stay the same, the things that move, and the three keys to learn first.',
    relatedActions: ['say-all', 'read-line', 'list-links', 'open-menu', 'keyboard-help'],
    relatedConcepts: ['browse-mode', 'forms-mode', 'quick-keys'],
    body: `# Your first hour with NVDA if you know JAWS

Good news first. A lot of what you know carries over. Say All is Insert+Down Arrow in both screen readers on the desktop layout. Reading the current line is Insert+Up Arrow in both. Single letter navigation for headings, tables, buttons, form fields, edit fields, checkboxes, combo boxes and graphics uses the same letters: H, T, B, F, E, X, C and G. Stopping speech with Control works the same.

The main change of vocabulary is this. What JAWS calls the virtual cursor, NVDA calls browse mode. What JAWS calls forms mode, NVDA calls focus mode. What JAWS calls quick keys, NVDA calls single letter navigation. What JAWS calls a region, NVDA calls a landmark.

Learn these three keys first. NVDA+N opens the NVDA menu, which is where settings live. NVDA+1 turns on input help, where pressing a key tells you what it does. NVDA+F7 opens the Elements list, which replaces the separate JAWS lists for links, headings and form fields.

Then be careful with the keys that change meaning: Numpad 5 reads a word in NVDA, not a character, and R selects radio buttons instead of regions. See the guide on keys that change meaning for details.
`,
  },
  {
    id: 'browse-and-focus-mode',
    title: 'Browse mode and focus mode for JAWS users',
    audience: 'JAWS user trying NVDA',
    summary: 'How NVDA switches between reading a page and typing into it.',
    relatedActions: ['toggle-browse-focus-mode', 'enter-forms-mode', 'exit-forms-mode'],
    relatedConcepts: ['browse-mode', 'forms-mode'],
    body: `# Browse mode and focus mode for JAWS users

In a web page, NVDA gives you a browse mode where arrow keys and single letters move through the content. When you move into a form field, NVDA can switch to focus mode so that the keys you type reach the field. You can also switch by hand with NVDA+Space.

In JAWS the same idea is the virtual cursor and forms mode. You enter forms mode by pressing Enter on a field and you leave it with Numpad Plus. Insert+Z turns the virtual cursor on and off.

The difference that surprises people is how automatic NVDA can be. There are settings for automatic focus mode when focus changes and for caret movement. If NVDA switches modes at moments you do not expect, look in the browse mode settings. NVDA+F2 passes the next key through to the application, which is useful when a web app has its own shortcuts.
`,
  },
  {
    id: 'keys-that-change-meaning',
    title: 'Keys that change meaning between JAWS and NVDA',
    audience: 'Anyone switching between the two',
    summary: 'The short list of keys that do a different job in each screen reader.',
    relatedActions: ['read-character', 'read-word', 'next-landmark', 'next-radio-button', 'next-article', 'next-link', 'jump-to-main-content', 'next-block-quote', 'next-same-element', 'next-separator'],
    relatedConcepts: ['landmarks', 'quick-keys'],
    body: `# Keys that change meaning between JAWS and NVDA

Numpad 5. In JAWS on the desktop layout, Numpad 5 speaks the current character and Insert+Numpad 5 speaks the current word. In NVDA, Numpad 5 speaks the word at the review cursor and Numpad 2 speaks the character.

R. In JAWS, R jumps to the next region, and radio buttons are on A. In NVDA, R jumps to the next radio button and landmarks are on D.

O. In JAWS, O jumps between articles. The NVDA wiki reports that article navigation has no default key in NVDA.

Links. JAWS uses Tab for links in browse mode. NVDA uses K for links and keeps Tab for moving keyboard focus.

Other letters. Q is main content in JAWS and block quote in NVDA. S is same element in JAWS and separator in NVDA. D is different element in JAWS and landmark in NVDA. A is radio button in JAWS and annotation in NVDA.

Lists. JAWS has three separate dialogs on Insert+F5, F6 and F7. NVDA has one Elements list on NVDA+F7.

Sources sometimes disagree about individual keys. Where the data shows lower confidence, check the key on your own system.
`,
  },
  {
    id: 'elements-list-explained',
    title: 'The NVDA Elements list explained',
    audience: 'JAWS user trying NVDA',
    summary: 'One dialog that replaces the JAWS links list, headings list and form fields list.',
    relatedActions: ['list-links', 'list-headings', 'list-form-fields', 'list-buttons', 'list-landmarks'],
    relatedConcepts: ['elements-list'],
    body: `# The NVDA Elements list explained

In JAWS you press Insert+F7 for links, Insert+F6 for headings and Insert+F5 for form fields, and each opens its own dialog.

NVDA has a single dialog. Press NVDA+F7 to open the Elements list. Inside it, you choose which kind of element to show. According to the NVDA wiki, Alt+H switches to headings and Alt+F switches to form fields. The list also covers links, buttons and landmarks.

Once the list is showing, you can move through it, use the Move to or Activate buttons to act on the selected element, and use the filter field to narrow the list down by typing.
`,
  },
  {
    id: 'where-jaws-features-live',
    title: 'Where JAWS features live in NVDA',
    audience: 'JAWS user trying NVDA',
    summary: 'Screen Shade, Tandem, PlaceMarkers, the Dictionary Manager and application settings.',
    relatedActions: ['open-menu', 'command-search'],
    relatedConcepts: ['screen-blanking', 'remote-support', 'place-markers', 'pronunciation', 'per-app-settings'],
    body: `# Where JAWS features live in NVDA

Screen Shade in JAWS is called Screen Curtain in NVDA. The NVDA wiki lists NVDA+Ctrl+Escape for it.

JAWS Tandem, the remote support feature, corresponds to Remote Access in NVDA. According to the NVDA wiki it is built into NVDA from version 2025.1. Before that it was an add-on.

PlaceMarkers in JAWS are not built into NVDA. There is a Place Markers add-on. The wiki lists Ctrl+Shift+NVDA+Y to save a marker, NVDA+Y to go to the next one and Shift+NVDA+Y to go to the previous one.

The JAWS Dictionary Manager corresponds to NVDA speech dictionaries, reached from the NVDA menu under Preferences. Application-specific settings in JAWS correspond to configuration profiles in NVDA, opened with NVDA+Ctrl+P.

NVDA has no command search like JAWS Insert+Space, J. The nearest thing is the Input gestures dialog.
`,
  },
  {
    id: 'desktop-or-laptop-layout',
    title: 'Desktop layout or laptop layout',
    audience: 'Anyone without a numeric keypad',
    summary: 'Which keys change when you use a laptop.',
    relatedActions: ['say-all', 'read-line', 'read-selected-text', 'read-status-bar'],
    relatedConcepts: [],
    body: `# Desktop layout or laptop layout

Both screen readers offer a desktop layout that relies on the numeric keypad and a laptop layout that avoids it.

Some commands are identical in both layouts. Others change. For Say All, JAWS uses Insert+Down Arrow on the desktop layout and CapsLock+A on the laptop layout. NVDA uses NVDA+Down Arrow on the desktop layout and NVDA+A on the laptop layout.

For reading the current line, JAWS uses Insert+Up Arrow or CapsLock+I, and NVDA uses NVDA+Up Arrow or NVDA+L.

Quick navigation letters such as H, T and B are the same in both layouts, because they do not depend on the modifier key.
`,
  },
  {
    id: 'cursors-and-review-modes',
    title: 'The three JAWS cursors and their NVDA equivalents',
    audience: 'JAWS user trying NVDA',
    summary: 'What the PC cursor, JAWS cursor and touch cursor become in NVDA.',
    relatedActions: ['switch-independent-cursor', 'switch-touch-cursor'],
    relatedConcepts: ['cursor-types'],
    body: `# The three JAWS cursors and their NVDA equivalents

JAWS gives you three named cursors. The PC cursor is the one you use most of the time; it follows the system focus and caret, exactly like a sighted user's blinking cursor. The JAWS cursor is independent of that: turn it on with Num Pad Minus and it moves with the numpad arrows like a mouse pointer, letting you read menus, tooltips or other screen areas the PC cursor cannot reach. Switch back with Num Pad Plus. The touch cursor, turned on with Shift+Num Pad Plus, is for exploring a Windows touchscreen device by touch instead of the keyboard.

NVDA does not have three separate cursors to switch between. The system focus and caret are always active in NVDA, the same as the JAWS PC cursor, and NVDA never turns that off. On top of that, NVDA offers review modes: Object review, Document review and Screen review, cycled with NVDA+Numpad7 (backwards with NVDA+Numpad1). Screen review is the closest match to the JAWS cursor, since it lets you read anything on screen regardless of what has focus. Object navigation, moved with NVDA+Numpad4, 6, 8 and 2, walks through the accessibility tree of buttons, panes and other controls, which is the other half of what the JAWS cursor is used for.

The touch cursor has no separate switch in NVDA. Touch interaction turns on by itself on a touchscreen device, and the same object navigation commands work through touch gestures once it is active.

The one habit to unlearn: in JAWS, activating the JAWS cursor disconnects the PC cursor from your typing until you switch back. In NVDA, cycling review modes never disconnects anything, so you can review the screen and keep typing without switching back afterward.
`,
  },
]
