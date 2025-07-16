'use strict'
/* eslint-env chrome, webextensions */

// check if URL includes autoplay token
if (decodeURIComponent(window.location.href).includes('autoplay=true')) {
  console.log('[YouTube Music Hotkeys] Autoplay token detected')
  const autoplay = setInterval(async () => {
    // Look for YouTube Music play button
    const playbutton = document.querySelector('.ytmusic-player-bar .play-pause-button') ||
                      document.querySelector('.play-pause-button') ||
                      document.getElementById('play-button')

    // Check if button exists and indicates paused state
    if (playbutton && (playbutton.title === 'Play' || playbutton.getAttribute('aria-label')?.includes('Play'))) {
      clearInterval(autoplay)
      await chrome.runtime.sendMessage({ command: 'toggle-playback' })
      console.log('[YouTube Music Hotkeys] Toggled playback')
    }
  }, 1000)
}
