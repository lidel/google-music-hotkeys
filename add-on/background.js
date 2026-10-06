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

// Runs in the page's main world, the only place the YouTube player API on
// #movie_player is visible. YouTube's own media key handlers use this API, and
// it does not change with the player bar layout YouTube Music serves.
function controlYouTubeMusicPlayer (actionName) {
  // https://developers.google.com/youtube/iframe_api_reference#getPlayerState
  const PLAYING = 1
  const BUFFERING = 3
  const player = document.getElementById('movie_player')
  if (!player || !player.getPlayerState) {
    console.log('[YouTube Music Hotkeys] unable to find the player, please report a bug at https://github.com/lidel/google-music-hotkeys/issues/new')
    return
  }
  switch (actionName) {
    case 'rewind':
      player.previousVideo()
      break
    case 'forward':
      player.nextVideo()
      break
    case 'play-pause': {
      // during an ad the ad player is the presenting one, not the song
      const state = player.getPlayerState(player.getPresentingPlayerType())
      if (state === PLAYING || state === BUFFERING) {
        player.pauseVideo()
      } else {
        player.playVideo()
      }
      break
    }
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
      world: 'MAIN',
      func: controlYouTubeMusicPlayer,
      args: [actionName]
    })
  }
}

// listen for keyboard hotkeys
chrome.commands.onCommand.addListener(executeCommand)

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
