'use strict'
/* eslint-env browser, webextensions */

const googleMusicPlayerUrl = 'https://play.google.com/music/listen*'
const togglePlaybackCommand = 'toggle-playback'
const previousSongCommand = 'previous-song'
const nextSongCommand = 'next-song'

async function openGoogleMusic () {
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
    let disabledMainPlayButton = false
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-id') === 'kitty') {
        if (buttons[i].style['pointer-events'] === 'none') {
          disabledMainPlayButton = true
        } else {
          buttons[i].click()
        }
        break
      }
    }
    let tryFallbackButtons = function () {
      // try I'm Feeling Lucky button (main page)
      let buttons = document.getElementsByTagName('gpm-ifl-button')
      if (buttons.length > 0) {
        console.log('[Google Music Hotkeys] Playing Feeling Lucky Radio')
        buttons[0].click()
        return
      }
      // try first 'play' button (eg. on album listing page)
      buttons = document.getElementsByTagName('button')
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-id') === 'play') {
          console.log('[Google Music Hotkeys] Playing first playable item')
          buttons[i].click()
          return
        }
      }
      // try standalone play button (eg. on a radio page)
      const playButton = document.getElementById('playButton')
      if (playButton) {
        console.log('[Google Music Hotkeys] Playing current context')
        playButton.click()
        return
      }
      // try context's shuffle button (eg. on the main library page)
      buttons = document.getElementsByTagName('paper-button')
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-id') === 'shuffle-my-library') {
          console.log('[Google Music Hotkeys] Playing shuffled library')
          buttons[i].click()
          return
        }
      }
    }
    if (disabledMainPlayButton) {
      // https://github.com/lidel/google-music-hotkeys/issues/2
      console.log('[Google Music Hotkeys] trying to load a new playlist..')
      tryFallbackButtons()
    }
  }
  return '(' + script.toString().replace('kitty', actionName) + ')()'
}

async function executeGoogleMusicCommand (command) {
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

async function onRuntimeMessage (request, sender) {
  console.log('[Google Music Hotkeys] onRuntimeMessage', request)
  await browser.tabs.executeScript(sender.tab.id, {
    runAt: 'document_start',
    code: scriptFor(request.command)
  })
}

// listen for keyboard hotkeys
browser.commands.onCommand.addListener(executeGoogleMusicCommand)

// listen for messages from content script
setTimeout(() => {
  // this needs to be run bit later due to a bug in Chrome with current browser polyfill:
  // Uncaught Error: runtime namespace is null or undefined
  browser.runtime.onMessage.addListener(onRuntimeMessage)
}, 250)

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
