const {ipcRenderer} = require('electron')
const ipc = ipcRenderer
const shell = require('electron').shell

window.addEventListener('DOMContentLoaded', () => {
	const titleBar = document.getElementsByClassName('title-bar')[0]
	const titleBarHelp = document.getElementById('title-bar-help')
	const titleBarMinimize = document.getElementById('title-bar-minimize')
	const titleBarClose = document.getElementById('title-bar-close')
	const titleBarCloseHelp = document.getElementById('title-bar-close-help')
	const authorlink = document.getElementById('authorlink')

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
})