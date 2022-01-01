'use strict'
/* eslint-env chrome. webextensions */

const googleMusicPlayerUrl = 'https://play.google.com/music/listen*'
const youtubeMusicPlayerUrl = 'https://music.youtube.com/*'
const gpodcastMusicPlayerUrl = 'https://podcasts.google.com/*'
const togglePlaybackCommand = 'toggle-playback'
const previousSongCommand = 'previous-song'
const nextSongCommand = 'next-song'
const backupSuffix = '-backup'

async function openPlayer () {
  await chrome.tabs.create({
    pinned: true,
    url: youtubeMusicPlayerUrl.replace('*', '')
  })
}

function scriptFor (command, scriptThatClicksOn) {
  switch (command) {
    case togglePlaybackCommand:
    case togglePlaybackCommand + backupSuffix:
      return scriptThatClicksOn('play-pause')
    case previousSongCommand:
    case previousSongCommand + backupSuffix:
      return scriptThatClicksOn('rewind')
    case nextSongCommand:
    case nextSongCommand + backupSuffix:
      return scriptThatClicksOn('forward')
  }
}


function youTubeMusicScriptThatClicksOn (actionName) {
  return () => {
    // TODO: revisit when YouTube Music adds 'feeling lucky' on page without player
    const findButton = (actionName) => {
      const qs = (q) => document.querySelector(q)
      switch (actionName) {
        case 'rewind':
          return qs('.ytmusic-player-bar.previous-button') || qs('.previous-button')
        case 'forward':
          return qs('.ytmusic-player-bar.next-button') || qs('.next-button')
        case 'play-pause':
          return qs('.ytmusic-player-bar.play-pause-button') || qs('.play-pause-button') || document.getElementById('play-button')
      }
    }
    const button = findButton(actionName)
    if (button) {
      button.click()
    } else {
      console.log('[YouTube Music Hotkeys] unable to find the play button, please report a bug at https://github.com/lidel/google-music-hotkeys/issues/new')
    }
  }
}

function podcastsScriptThatClicksOn (actionName) {
  return () => {
    const getElementFromAria = function (...strings) {
      const selector = strings.map(str => `div[aria-label="${str}"]`).join(', ')
      return document.querySelector(selector)
    }

    try {
      const ariaIdsPerLang = {
        es: { play: 'Reproducir', pause: 'Pausar', rewind: 'Retroceder 10 segundos', forward: 'Avanzar 30 segundos' },
        en: { play: 'Play', pause: 'Pause', rewind: 'Rewind 10 seconds', forward: 'Fast forward 30 seconds' }
      }
      const localizedAria = ariaIdsPerLang[document.querySelector('html').lang]
      switch (actionName) {
        case 'rewind':
          return getElementFromAria(localizedAria.rewind).click()
        case 'forward':
          return getElementFromAria(localizedAria.forward).click()
        case 'play-pause':
          return getElementFromAria(localizedAria.play, localizedAria.pause).click()
      }
    } catch (err) {
      console.debug('[Google Podcasts hotkeys] unable to find button via aria labels, falling back to operating on audio node', err)
      const audioNode = document.querySelector('audio')

      switch (actionName) {
        case 'rewind':
          audioNode.currentTime -= 10
          return
        case 'forward':
          audioNode.currentTime += 30
          return
        case 'play-pause':
          if (audioNode.paused) { return audioNode.play() } else { return audioNode.pause() }
      }
    }
  }
}

async function executeGoogleMusicCommand (command) {
  console.log('[Google Music Hotkeys] executing command: ', command)
  const gmTabs = await chrome.tabs.query({ url: googleMusicPlayerUrl })
  const ymTabs = await chrome.tabs.query({ url: youtubeMusicPlayerUrl })
  const gpTabs = await chrome.tabs.query({ url: gpodcastMusicPlayerUrl })

  if (gmTabs.length === 0 && ymTabs.length === 0 && gpTabs.length === 0) {
    openPlayer()
    return
  }
  for (const tab of ymTabs) {
    // TODO: wait until chrome.scripting.executeScript is present in Brave
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scriptFor(command, youTubeMusicScriptThatClicksOn)
    })
  }
  for (const tab of gpTabs) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scriptFor(command, podcastsScriptThatClicksOn)
    })
  }
}

async function onRuntimeMessage (request, sender) {
  console.log('[Google Music Hotkeys] onRuntimeMessage', request)
  await chrome.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: scriptFor(request.command)
  })
}

// listen for keyboard hotkeys
chrome.commands.onCommand.addListener(executeGoogleMusicCommand)

// listen for messages from content script
chrome.runtime.onMessage.addListener(onRuntimeMessage)

// regular click on chrome.action toggles playback
chrome.action.onClicked.addListener(() => executeGoogleMusicCommand('toggle-playback'))

// context-click on chrome.action displays more options

/* TODO
chrome.contextMenus.removeAll()

chrome.contextMenus.create({
  id: 'toggle-playback-menu-item',
  title: 'Toggle Playback',
  contexts: ['browser_action'],
  // TODO: onclick: () => executeGoogleMusicCommand(togglePlaybackCommand)
  // TODO Extensions using event pages or Service Workers cannot pass an onclick parameter to chrome.contextMenus.create.
  // TODO Instead, use the chrome.contextMenus.onClicked event.
})

chrome.contextMenus.create({
  id: 'previous-song-menu-item',
  title: 'Previous Song',
  contexts: ['browser_action'],
  // TODO: onclick: () => executeGoogleMusicCommand(previousSongCommand)
})
chrome.contextMenus.create({
  id: 'next-song-menu-item',
  title: 'Next Song',
  contexts: ['browser_action'],
  // TODO: onclick: () => executeGoogleMusicCommand(nextSongCommand)
})
chrome.contextMenus.create({
  id: 'open-preferences-menu-item',
  title: 'Customize Shortcuts',
  contexts: ['browser_action'],
  TODO onclick: () => {
    chrome.runtime.openOptionsPage()
      .catch((err) => {
        console.error('runtime.openOptionsPage() failed, opening options page in tab instead.', err)
        // fallback for weird chrome. ;-)
        chrome.tabs.create({ url: chrome.extension.getURL('options.html') })
      })
  }
})

*/
