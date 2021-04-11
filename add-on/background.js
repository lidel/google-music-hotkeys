'use strict'
/* eslint-env browser, webextensions */

const googleMusicPlayerUrl = 'https://play.google.com/music/listen*'
const youtubeMusicPlayerUrl = 'https://music.youtube.com/*'
const gpodcastMusicPlayerUrl = 'https://podcasts.google.com/*'
const togglePlaybackCommand = 'toggle-playback'
const previousSongCommand = 'previous-song'
const nextSongCommand = 'next-song'
const backupSuffix = '-backup'

async function openPlayer() {
	await browser.tabs.create({
		pinned: true,
		url: youtubeMusicPlayerUrl.replace('*', '')
	})
}

function scriptFor(command, scriptThatClicksOn) {
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

function googleMusicScriptThatClicksOn(actionName) { // TODO: remove them GM is dead
	const script = function () {
		// Google Music (to be removed)
		// ============================
		const buttons = document.getElementsByTagName('paper-icon-button')
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
		const tryFallbackButtons = function () {
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
			// TODO: try 'play all' button (eg. on album listing page)
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

function youTubeMusicScriptThatClicksOn(actionName) {
	const script = function () {
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
		const button = findButton('kitty')
		if (button) {
			button.click()
		} else {
			console.log('[YouTube Music Hotkeys] unable to find the play button, please report a bug at https://github.com/lidel/google-music-hotkeys/issues/new')
		}
	}
	return '(' + script.toString().replace('kitty', actionName) + ')()'
}

function podcastsScriptThatClicksOn(actionName) {
	
	const script = function (actionName) {
		const getElementFromAria = function(...strings) {
			let selector = strings.map(str => `div[aria-label="${str}"]`).join(", ");
			return document.querySelector(selector);
		}
		
		try {
			const ariaIdsPerLang = {
				es: { play: "Reproducir", pause: "Pausar", rewind: "Retroceder 10 segundos", forward: "Avanzar 30 segundos" },
				en: { play: "Play", pause: "Pause", rewind: "Rewind 10 seconds", forward: "Fast forward 30 seconds" },
			};
			const localizedAria = ariaIdsPerLang[document.querySelector("html").lang];
			switch (actionName) {
				case 'rewind':
					return getElementFromAria(localizedAria.rewind).click();
				case 'forward':
					return getElementFromAria(localizedAria.forward).click();
				case 'play-pause':
					button = getElementFromAria(localizedAria.play, localizedAria.pause);
					return button.click();
			}
		} catch (err) {
			console.debug(err);
			const audioNode = document.querySelector("audio");

			switch (actionName) {
				case 'rewind':
					return audioNode.currentTime -= 10
				case 'forward':
					return audioNode.currentTime += 30
				case 'play-pause':
					if (audioNode.paused)
						return audioNode.play()
					else
						return audioNode.pause()
			}
		}


	}
	return '(' + script.toString() + ')("' + actionName + '")'
}



async function executeGoogleMusicCommand(command) {
	console.log('[Google Music Hotkeys] executing command: ', command)
	const gmTabs = await browser.tabs.query({ url: googleMusicPlayerUrl })
	const ymTabs = await browser.tabs.query({ url: youtubeMusicPlayerUrl })
	const gpTabs = await browser.tabs.query({ url: gpodcastMusicPlayerUrl })


	if (gmTabs.length === 0 && ymTabs.length === 0 && gpTabs.length === 0) {
		openPlayer()
		return
	}
	for (const tab of gmTabs) { // TODO: remove them GM is dead
		browser.tabs.executeScript(tab.id, {
			runAt: 'document_start',
			code: scriptFor(command, googleMusicScriptThatClicksOn)
		})
	}
	for (const tab of ymTabs) {
		browser.tabs.executeScript(tab.id, {
			runAt: 'document_start',
			code: scriptFor(command, youTubeMusicScriptThatClicksOn)
		})
	}
	for (const tab of gpTabs) {
		browser.tabs.executeScript(tab.id, {
			runAt: 'document_start',
			code: scriptFor(command, podcastsScriptThatClicksOn)
		})
	}
}

async function onRuntimeMessage(request, sender) {
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
browser.contextMenus.create({
	id: 'open-preferences-menu-item',
	title: 'Customize Shortcuts',
	contexts: ['browser_action'],
	onclick: () => {
		browser.runtime.openOptionsPage()
			.catch((err) => {
				console.error('runtime.openOptionsPage() failed, opening options page in tab instead.', err)
				// fallback for weird browsers ;-)
				browser.tabs.create({ url: browser.extension.getURL('options.html') })
			})
	}
})
