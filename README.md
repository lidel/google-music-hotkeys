# Google Music Hotkeys

> Browser extension that adds keyboard control to the web version of Google Music

## Background

I wanted to control background playback of Google Music without switching tabs.
That is all :-)

## Features

- works in Firefox and Chromium-based browsers
- keyboard-based playback control
    - toggle playback
      > default: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>8</kbd>, visual hint: <kbd>*</kbd>  
      > windows: <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>8</kbd>
    - previous song
      > default: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>9</kbd>, visual hint: <kbd>(</kbd>  
      > windows: <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>9</kbd>
    - next song:
      > default: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd>, visual hint: <kbd>)</kbd>  
      > windows: <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd>
- **[option to customize default shortcuts](#how-to-customize-shortcuts)**
- toolbar button
    - regular click toggles playback
    - context-click shows menu with other playback controls
- open and pin Google Music if it is not open yet
- try to build a new playlist when one hasn't been loaded yet
- support for autoplay of bookmarks with `&autoplay=true` parameter

## Install

| Firefox                                                                                                                                                          | Chrome / Chromium                                                                                                                                                                              |
| -------------                                                                                                                                                    | -------------                                                                                                                                                                                  |
| [![Get the add-on](https://blog.mozilla.org/addons/files/2015/11/AMO-button_1.png)](https://addons.mozilla.org/en-US/firefox/addon/google-music-hotkeys-webext/) | [![](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/google-music-hotkeys/fgjkdpncbpnlhbdbmelbhmapblgaamkl) |

## How To Customize Shortcuts

### Firefox


1. Open `about:addons` → _Google Music Hotkeys_ → _Preferences_
   - ..or just right-click the Browser Action:  
     > ![Right-click on Browser Action](https://user-images.githubusercontent.com/157609/39958925-24e00498-560a-11e8-937e-45bc8fbf43eb.png)
3. Customize key bindings to your liking:
   - Supported values are listed [here](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values). Changes are saved automatically.
     > ![screenshot with old school shortcuts](https://user-images.githubusercontent.com/157609/39966689-5b7e9dce-56b0-11e8-886c-a98c2c3fef0e.png)
   - The shortcut may be specified as one of the following media keys:
     <kbd>MediaPlayPause</kbd>, <kbd>MediaPrevTrack</kbd>, <kbd>MediaNextTrack</kbd>
     > ![screenshot with media key](https://user-images.githubusercontent.com/157609/39966694-6abf5b02-56b0-11e8-9ad4-ec1cde02bc29.png)
   - Keep in mind that some shortcuts can be intercepted by regular desktop apps running on your system.
     For example, on MS Windows <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd> is hijacked by system itself – see [issue #3](https://github.com/lidel/google-music-hotkeys/issues/3).
     If something does not work, try a different shortcut.
   - Customization works in _Firefox 60 or later_. If you are using an older version please see [issue #1](https://github.com/lidel/google-music-hotkeys/issues/1) before reporting a new bug.
   - Firefox does not provide API for setting _Global_ shortcuts (that work when browser window is not focused) yet: [Bug 1411795 - Add global keyboard shortcut support to commands API](https://bugzilla.mozilla.org/show_bug.cgi?id=1411795).
4. That is all!

### Chromium

Chromium-based browsers provide global UI for managing shortcuts of all extensions.

1. Open `chrome://extensions/configureCommands`
2. Customize key bindings to your liking
3. You can optionally switch shortcut scope to _Global_:
   > ![peek 2017-11-28 19-44](https://user-images.githubusercontent.com/157609/33337860-a03f29f6-d474-11e7-88b9-748739b20725.gif)    
    _Global_ shortcuts should work even when Chrome isn’t ‘in focus’.    
    Keep in mind that _Global_ shortcuts can interfere with regular desktop app shortcuts.
4. That is all!


## Development


```
npm install
npm run build
npm run firefox
```

## License

`Play_music_triangle.png` from https://commons.wikimedia.org/wiki/File:Play_music_triangle.svg

[webextensions-lib-shortcut-customize-ui](https://github.com/piroor/webextensions-lib-shortcut-customize-ui) is [licensed under MIT](https://github.com/piroor/webextensions-lib-shortcut-customize-ui/blob/master/LICENSE)

The add-on itself is released under [CC0](LICENSE): to the extent possible under law, the author has waived all copyright and related or neighboring rights to this work, effectively placing it in the public domain.

