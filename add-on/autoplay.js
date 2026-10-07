'use strict'
/* eslint-env browser */

// Runs at document_start (see manifest.json): YouTube Music drops unknown URL
// parameters while it loads. YouTube Music starts songs (/watch URLs) by
// itself, so only other pages need their first play button pressed.
if (window.location.pathname !== '/watch' && decodeURIComponent(window.location.href).includes('autoplay=true')) {
  console.log('[YouTube Music Hotkeys] Autoplay token detected')
  // give up after 30 seconds or once the listener takes over, so a page they
  // move to never starts playing
  let attemptsLeft = 30
  const autoplay = setInterval(() => {
    const button = document.querySelector('ytmusic-browse-response ytmusic-play-button-renderer')
    if (button) {
      button.click()
      console.log('[YouTube Music Hotkeys] Pressed the first play button')
    }
    if (button || --attemptsLeft === 0) {
      clearInterval(autoplay)
    }
  }, 1000)
  for (const type of ['pointerdown', 'keydown']) {
    window.addEventListener(type, () => clearInterval(autoplay), { capture: true, once: true })
  }
}
