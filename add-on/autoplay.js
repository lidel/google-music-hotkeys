'use strict'
/* eslint-env browser, webextensions */

// check if URL includes autoplay token
if (decodeURIComponent(window.location.href).includes('autoplay=true')) {
  console.log('[Google Music Hotkeys] Autoplay token detected')
  let autoplay = setInterval(async () => {
    let playbutton = document.getElementById('player-bar-play-pause')
    // press button only if  there is no playback
    if (playbutton && playbutton.title === 'Play') {
      clearInterval(autoplay)
      await browser.runtime.sendMessage({command: 'toggle-playback'})
      console.log('[Google Music Hotkeys] Toggled playback')
    }
  }, 1000)
}
