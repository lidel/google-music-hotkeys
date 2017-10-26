'use strict'
/* eslint-env browser, webextensions */

const googleMusicPlayerUrl = 'https://play.google.com/music/listen*'
const togglePlaybackCommand = 'toggle-playback'
const previousSongCommand = 'previous-song'
const nextSongCommand = 'next-song'

async function openGoogleMusic() {
  await browser.tabs.create({
    pinned: true,
    url: googleMusicPlayerUrl.replace('*', '')
  })
}

function scriptFor (command) {
  switch (command) {
    case togglePlaybackCommand:
      return scriptThatClicksOn('play-pause')
    case previousSongCommand:
      return scriptThatClicksOn('rewind')
    case nextSongCommand:
      return scriptThatClicksOn('forward')
  }
}

function scriptThatClicksOn (actionName) {
  let script = function () {
    let buttons = document.getElementsByTagName('paper-icon-button')
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-id') === 'kitty') {
        buttons[i].click()
        break
      }
    }
  }
  return '(' + script.toString().replace('kitty', actionName) + ')()'
}

async function executeGoogleMusicCommand(command) {
  console.log('[Google Music Hotkeys] executing command: ', command)
  const gmTabs = await browser.tabs.query({ url: googleMusicPlayerUrl })
  if (gmTabs.length === 0) {
    openGoogleMusic()
    return
  }
  for (let tab of gmTabs) {
    // console.log('tab', tab)
    browser.tabs.executeScript(tab.id, {
      runAt: 'document_start',
      code: scriptFor(command)
    })
  }
}

// listen for keyboard hotkeys
browser.commands.onCommand.addListener(executeGoogleMusicCommand)

// regular click on browser action toggles playback
browser.browserAction.onClicked.addListener(() => executeGoogleMusicCommand('toggle-playback'))

// context-click on browser action displays more options
browser.contextMenus.create({
  id: 'toggle-playback-menu-item',
  title: 'Toggle Playback',
  contexts: ['browser_action'],
  onclick: () => executeGoogleMusicCommand(togglePlaybackCommand)
})
browser.contextMenus.create({
  id: 'previous-song-menu-item',
  title: 'Previous Song',
  contexts: ['browser_action'],
  onclick: () => executeGoogleMusicCommand(previousSongCommand)
})
browser.contextMenus.create({
  id: 'next-song-menu-item',
  title: 'Next Song',
  contexts: ['browser_action'],
  onclick: () => executeGoogleMusicCommand(nextSongCommand)
})

