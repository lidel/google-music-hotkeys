/* global browser, ShortcutCustomizeUI */
async function buildShortcutCustomizeUI () {
  const browserInfo = await browser.runtime.getBrowserInfo()
  const runtimeBrowserName = browserInfo ? browserInfo.name : 'unknown'
  const runtimeIsFirefox = !!runtimeBrowserName.match('Firefox')
  const shortcutsSection = document.getElementById('shortcuts')
  if (runtimeIsFirefox) {
    // Firefox does not provide native UI for customizing shortcuts, just an API
    // so we use a lib that builds UI in userland
    ShortcutCustomizeUI.build().then(list => {
      // remove old UI, if any
      while (shortcutsSection.firstChild) {
        shortcutsSection.removeChild(shortcutsSection.firstChild)
      }
      shortcutsSection.appendChild(list)
    })
  }
}

document.addEventListener('DOMContentLoaded', buildShortcutCustomizeUI)
