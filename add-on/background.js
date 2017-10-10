'use strict'
/* eslint-env browser, webextensions */

const googleMusicPlayerUrl = 'https://play.google.com/music/listen*'

async function openGoogleMusic() {
  await browser.tabs.create({
    pinned: true,
    url: googleMusicPlayerUrl.replace('*', '')
  })
}

function scriptFor (command) {
  switch (command) {
    case 'toggle-playback':
      return scriptThatClicksOn('play-pause')
    case 'previous-song':
      return scriptThatClicksOn('rewind')
    case 'next-song':
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

browser.commands.onCommand.addListener(async (command) => {
  console.log('[Google Music Hotkeys] executing command: ', command)
  const gmTabs = await browser.tabs.query({ url: googleMusicPlayerUrl })
  if (gmTabs.length === 0) {
    openGoogleMusic()
    return
  }
  for (let tab of gmTabs) {
    // console.log('tab', tab)
    browser.tabs.executeScript(tab.id, {
      code: scriptFor(command)
    })
  }
})

/*
let gettingAllCommands = browser.commands.getAll()
gettingAllCommands.then((commands) => {
  for (let command of commands) {
    console.log(command)
  }
})
*/

