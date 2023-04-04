const {ipcRenderer} = require('electron')
const ipc = ipcRenderer
const shell = require('electron').shell
const fs = require('fs')
const os = require('os')
const path = require('path')

function parseHistoryToText(history) {
	let text = ''
	history.map(item => {
		text += item.strings.textNotation + "\n"
	})
	return text
}

window.addEventListener('DOMContentLoaded', () => {
	const titleBar = document.getElementsByClassName('title-bar')[0]
	const titleBarHelp = document.getElementById('title-bar-help')
	const titleBarMinimize = document.getElementById('title-bar-minimize')
	const titleBarClose = document.getElementById('title-bar-close')
	const titleBarCloseHelp = document.getElementById('title-bar-close-help')
	const authorlink = document.getElementById('authorlink')
	const appVersion = document.getElementById('appVersion')

	if(appVersion) {
		appVersion.innerText = ipc.sendSync('getAppVersion');
	}

	window.addEventListener("blur", (e) => {
		titleBar.classList.add('inactive')
	})
	window.addEventListener("focus", (e) => {
		titleBar.classList.remove('inactive')
	})

	if(authorlink)
	authorlink.addEventListener('click', () => {
		shell.openExternal("http://marcin-kalinowski.pl")
	})

	if(titleBarClose)
	titleBarClose.addEventListener('click', () => {
		ipc.send('closeApp')
	})

	if(titleBarMinimize)
	titleBarMinimize.addEventListener('click', () => {
		ipc.send('minimizeApp')
	})

	if(titleBarHelp)
	titleBarHelp.addEventListener('click', () => {
		ipc.send('openHelp')
	})

	if(titleBarCloseHelp)
	titleBarCloseHelp.addEventListener('click', () => {
		ipc.send('closeHelp')
	})

	window.addEventListener('saveHistory', (event) => {
		const historyData = event.detail;
		const documentsPath = path.join(os.homedir(), 'Documents', 'timecalc');
		if (!fs.existsSync(documentsPath)) {
			fs.mkdirSync(documentsPath, { recursive: true });
		}
		const filePath = path.join(documentsPath, 'history.json');
		fs.writeFile(filePath, JSON.stringify(historyData), (err) => {
			if (err) {
				console.error(err)
			} else {
				console.log('History saved successfully in: ' + filePath)
			}
		})
	})

	window.addEventListener('saveHistoryToText', async (event) => {
		const historyData = event.detail;
		const filePath = await ipcRenderer.invoke('saveFileDialog');

		if (filePath) {
			fs.writeFile(filePath, parseHistoryToText(historyData), (err) => {
				if (err) {
					console.error(err)
				} else {
					console.log('History saved successfully in: ' + filePath)
				}
			})
		}
	})
})

