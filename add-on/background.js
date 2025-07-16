'use strict'
/* eslint-env chrome, webextensions */

const youtubeMusicPlayerUrl = 'https://music.youtube.com/*'
const togglePlaybackCommand = 'toggle-playback'
const previousSongCommand = 'previous-song'
const nextSongCommand = 'next-song'

async function openPlayer () {
  await chrome.tabs.create({
    pinned: true,
    url: youtubeMusicPlayerUrl.replace('*', '')
  })
}

function getActionName (command) {
  switch (command) {
    case togglePlaybackCommand:
      return 'play-pause'
    case previousSongCommand:
      return 'rewind'
    case nextSongCommand:
      return 'forward'
  }
}

function youTubeMusicScriptThatClicksOn (actionName) {
  // TODO: revisit when YouTube Music adds 'feeling lucky' on page without player
  const findButton = (action) => {
    const qs = (q) => document.querySelector(q)
    switch (action) {
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

async function executeCommand (command) {
  console.log('[YouTube Music Hotkeys] executing command: ', command)
  const ymTabs = await chrome.tabs.query({ url: youtubeMusicPlayerUrl })

  if (ymTabs.length === 0) {
    openPlayer()
    return
  }

  const actionName = getActionName(command)

  for (const tab of ymTabs) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: youTubeMusicScriptThatClicksOn,
      args: [actionName]
    })
  }
}

async function onRuntimeMessage (request, sender) {
  console.log('[YouTube Music Hotkeys] onRuntimeMessage', request)
  const actionName = getActionName(request.command)
  await chrome.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: youTubeMusicScriptThatClicksOn,
    args: [actionName]
  })
}

// listen for keyboard hotkeys
chrome.commands.onCommand.addListener(executeCommand)

// listen for messages from content script
chrome.runtime.onMessage.addListener(onRuntimeMessage)

// regular click on chrome.action toggles playback
chrome.action.onClicked.addListener(() => executeCommand('toggle-playback'))

// context-click on chrome.action displays more options
chrome.contextMenus.removeAll()

chrome.contextMenus.create({
  id: 'toggle-playback-menu-item',
  title: 'Toggle Playback',
  contexts: ['action']
})

chrome.contextMenus.create({
  id: 'previous-song-menu-item',
  title: 'Previous Song',
  contexts: ['action']
})

chrome.contextMenus.create({
  id: 'next-song-menu-item',
  title: 'Next Song',
  contexts: ['action']
})

chrome.contextMenus.create({
  id: 'open-preferences-menu-item',
  title: 'Customize Shortcuts',
  contexts: ['action']
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'toggle-playback-menu-item':
      executeCommand(togglePlaybackCommand)
      break
    case 'previous-song-menu-item':
      executeCommand(previousSongCommand)
      break
    case 'next-song-menu-item':
      executeCommand(nextSongCommand)
      break
    case 'open-preferences-menu-item':
      chrome.runtime.openOptionsPage()
        .catch((err) => {
          console.error('runtime.openOptionsPage() failed, opening options page in tab instead.', err)
          chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })
        })
      break
  }
})
