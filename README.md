# Google Music Hotkeys

> Browser extension that adds keyboard control to web version of Google Music

## Background

I wanted to control background playback of Google Music without switching tabs.
That is all.

## Features

- works in Firefox and Chrome
- regular click toggles playback
- context-click shows menu with other playback controls
- open and pin Google Music if it is not open yet
- try to build a new playlist when one hasn't been loaded yet
- keyboard-based playback control
    - toggle playback: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>8</kbd>, visual hint: <kbd>*</kbd>
    - previous song: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>9</kbd>, visual hint: <kbd>(</kbd>
    - next song: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd>, visual hint: <kbd>)</kbd>
    - how to customize default shortcuts?
        - Chrome: via `chrome://extensions/configureCommands` dialog
        - Firefox: no cigar yet (see [Issue #1](https://github.com/lidel/google-music-hotkeys/issues/1))

## Install

| Firefox                                                                                                                                                          | Chrome / Chromium                                                                                                                                                                              |
| -------------                                                                                                                                                    | -------------                                                                                                                                                                                  |
| [![Get the add-on](https://blog.mozilla.org/addons/files/2015/11/AMO-button_1.png)](https://addons.mozilla.org/en-US/firefox/addon/google-music-hotkeys-webext/) | [![](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/google-music-hotkeys/fgjkdpncbpnlhbdbmelbhmapblgaamkl) |


## Development

```
npm install
npm run build
npm run firefox
```

## License

`Play_music_triangle.png` from https://commons.wikimedia.org/wiki/File:Play_music_triangle.svg

The add-on itself is released under [CC0](LICENSE): to the extent possible under law, the author has waived all copyright and related or neighboring rights to this work, effectively placing it in the public domain.

