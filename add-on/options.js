/* global ShortcutCustomizeUI */
/* eslint-env chrome, webextensions */
async function buildShortcutCustomizeUI () {
  let runtimeIsFirefox = false

  try {
    // Try to detect Firefox by checking for Firefox-specific APIs
    if (typeof window.browser !== 'undefined' &&
        window.browser.runtime &&
        typeof window.browser.runtime.getBrowserInfo === 'function') {
      const browserInfo = await window.browser.runtime.getBrowserInfo()
      const runtimeBrowserName = browserInfo ? browserInfo.name : 'unknown'
      runtimeIsFirefox = !!runtimeBrowserName.match('Firefox')
    }
  } catch (err) {
    // Not Firefox or browser API not available
    runtimeIsFirefox = false
  }
  const shortcutsSection = document.getElementById('shortcuts')
  if (runtimeIsFirefox) {
    shortcutsSection.classList.add('firefox')
    // Chrome has no commands.update API, so only Firefox gets an editor here
    ShortcutCustomizeUI.build().then(list => {
      // remove old UI, if any
      while (shortcutsSection.firstChild) {
        shortcutsSection.removeChild(shortcutsSection.firstChild)
      }
      shortcutsSection.insertAdjacentHTML('afterbegin', '<h2>Customize Bindings</h2>')
      shortcutsSection.appendChild(list)
      shortcutsSection.insertAdjacentHTML('beforeend', '<p>List of supported shortcut keys names can be found <a href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#shortcut_values">here</a>.</p>')
    })
  }
}

document.addEventListener('DOMContentLoaded', buildShortcutCustomizeUI)
