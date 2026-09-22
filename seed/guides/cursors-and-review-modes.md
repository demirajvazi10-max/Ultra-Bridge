# The three JAWS cursors and their NVDA equivalents

JAWS gives you three named cursors. The PC cursor is the one you use most of the time; it follows the system focus and caret, exactly like a sighted user's blinking cursor. The JAWS cursor is independent of that: turn it on with Num Pad Minus and it moves with the numpad arrows like a mouse pointer, letting you read menus, tooltips or other screen areas the PC cursor cannot reach. Switch back with Num Pad Plus. The touch cursor, turned on with Shift+Num Pad Plus, is for exploring a Windows touchscreen device by touch instead of the keyboard.

NVDA does not have three separate cursors to switch between. The system focus and caret are always active in NVDA, the same as the JAWS PC cursor, and NVDA never turns that off. On top of that, NVDA offers review modes: Object review, Document review and Screen review, cycled with NVDA+Numpad7 (backwards with NVDA+Numpad1). Screen review is the closest match to the JAWS cursor, since it lets you read anything on screen regardless of what has focus. Object navigation, moved with NVDA+Numpad4, 6, 8 and 2, walks through the accessibility tree of buttons, panes and other controls, which is the other half of what the JAWS cursor is used for.

The touch cursor has no separate switch in NVDA. Touch interaction turns on by itself on a touchscreen device, and the same object navigation commands work through touch gestures once it is active.

The one habit to unlearn: in JAWS, activating the JAWS cursor disconnects the PC cursor from your typing until you switch back. In NVDA, cycling review modes never disconnects anything, so you can review the screen and keep typing without switching back afterward.
