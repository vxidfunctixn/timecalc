import '../../node_modules/simplebar/dist/simplebar.js'
import {
  ERROR_CODES, MODE,
  MODE_VALUES
} from './modules/defines.js'
import Time from './modules/time.js'
const fs = require('fs')
const os = require('os')
const path = require('path')

class calc {
  constructor() {
    this.el = this.getElements()
    this.setOperationMode(MODE.PLUS)
    this.history = this.loadHistory()
    this.historyLastId = this.history.length + 1
    this.initEvents()
    this.simplebar = new SimpleBar(this.el.scrollSection)
    this.activeInput = 0
    this.updateHistoryList()
  }

  loadHistory() {
    const documentsPath = path.join(os.homedir(), 'Documents', 'timecalc');
    const filePath = path.join(documentsPath, 'history.json');

    try {
      if (fs.existsSync(filePath)) {
        const historyData = fs.readFileSync(filePath);
        return JSON.parse(historyData);
      } else {
        console.warn("History file does not exist: " + filePath);
        return [];
      }
    } catch (err) {
      console.error("Failed to load history file: " + filePath);
      console.error(err);
      return [];
    }
  }

  initEvents() {
    this.initModeSwitcher()
    this.el.resultButton.addEventListener('click', () => this.getResult())
    this.el.firstInput.addEventListener('click', function() { this.select() })
    this.el.secondInput.addEventListener('click', function() { this.select() })
    this.el.firstInput.addEventListener('focusin', () => {
      this.activeInput = 1
    })
    this.el.secondInput.addEventListener('focusin', () => {
      this.activeInput = 2
    })

    this.el.firstInput.addEventListener('keydown', e => {
      this.onInputKeyDown(e)
    })
    this.el.secondInput.addEventListener('keydown', e => {
      this.onInputKeyDown(e)
      if(e.key === 'Tab') {
        this.el.firstInput.focus()
        e.preventDefault()
      }
    })
    this.el.historyClear.addEventListener('click', () => {
      this.history = []
      this.historyLastId = 1
      this.updateHistoryList()
      window.dispatchEvent(new CustomEvent('saveHistory', { detail: [] }));
    })
    this.el.historyExport.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('saveHistoryToText', { detail: this.history }));
    })
  }

  onInputKeyDown(e) {
    this.resetWarning()
    if(e.key === 'Enter' || e.key === '=') {
      this.getResult()
      e.preventDefault()
    }
    if(e.key === '+') {
      this.setOperationMode(MODE.PLUS)
      if(this.el.firstInput.value)
        this.el.secondInput.focus()
      e.preventDefault()
    }
    else if(e.key === '_' || e.keyCode === 109) {
      this.setOperationMode(MODE.MINUS)
      if(this.el.firstInput.value)
        this.el.secondInput.focus()
      e.preventDefault()
    }
    else if(e.key === '*') {
      this.setOperationMode(MODE.MULTIPLY)
      if(this.el.firstInput.value)
        this.el.secondInput.focus()
      e.preventDefault()
    }
    else if(e.key === '/') {
      this.setOperationMode(MODE.DIVIDE)
      if(this.el.firstInput.value)
        this.el.secondInput.focus()
      e.preventDefault()
    }
  }

  getElements() {
    return {
      // Inputs
      firstInput: document.getElementById('input-first'),
      secondInput: document.getElementById('input-second'),
      // Operation controls
      operationWrapper: document.getElementById('operation'),
      operationItems: document.querySelectorAll('#operation .option'),
      resultButton: document.getElementById('result-button'),
      // History
      historyFirst: document.getElementById('first-item'),
      historyOther: document.getElementById('other-items'),
      scrollSection: document.querySelector('.scroll-section'),
      // History options
      historyClear: document.querySelector('#clear-history'),
      historyExport: document.querySelector('#export-history'),
      // Error
      errorContainer: document.getElementById('error')
    }
  }

  setOperationMode(mode) {
    this.resetWarning()
    if(MODE_VALUES.find(key => key === mode)) {
      this.el.operationWrapper.classList.remove(`set-${this.operationMode}`)
      this.operationMode = mode
      this.el.operationWrapper.classList.add(`set-${this.operationMode}`)
      document.body.setAttribute('mode', mode)
      if(this.activeInput === 1) {
        this.el.firstInput.focus()
      }
      else if(this.activeInput === 2) {
        this.el.secondInput.focus()
      }
      else {
        this.el.secondInput.focus()
      }
      if(mode === MODE.MULTIPLY || mode === MODE.DIVIDE) {
        this.el.secondInput.setAttribute('placeholder', 'np. 3 lub 2.5')
      } else {
        this.el.secondInput.setAttribute('placeholder', 'lub 1:2:3')
      }
    }
  }

  initModeSwitcher() {
    this.el.operationWrapper.classList.add(`set-${this.operationMode}`)
    this.el.operationItems.forEach(element => {
      element.addEventListener('click', () => {
        this.setOperationMode(element.classList[1])
      })
    })
  }

  addToHistory(time1, time2, operation, result) {
    const time1Str = this.timeStringify(time1)
    const time2Str = this.timeStringify(time2)
    const operationStr = `<span class="mode ${operation}"></span>`
    const operationFullStr = `<span>${time1Str}</span> ${operationStr} <span>${time2Str}</span>`
    const resultStr = this.timeStringify(result)
    const operationChar = this.operationStringify(operation)
    const operationFileStr = `${this.historyLastId}. ${time1Str} ${operationChar} ${time2Str} = ${resultStr}`

    this.history.unshift({
      id: this.historyLastId,
      strings: {
        operation: operationFullStr,
        result: resultStr,
        textNotation: operationFileStr
      },
      values: {
        time1,
        time2,
        result,
        operation,
      }
    })

    this.updateHistoryList()
    this.fromHistory(this.historyLastId)
    this.historyLastId ++

    window.dispatchEvent(new CustomEvent('saveHistory', { detail: this.history }));
  }

  updateHistoryList() {
    let list = ``
    if(this.history.length == 0) {
      this.el.historyFirst.innerHTML = this.historyStartTemplate()
      this.el.historyClear.classList.add('disabled')
      this.el.historyExport.classList.add('disabled')
    } else {
      this.history.map((element, index) => {
        const {strings: {operation, result}, id} = element
        if(index === 0) {
          this.el.historyFirst.innerHTML = this.historyItemTemplate(operation, result, id, 'theme-border')
        } else {
          list += this.historyItemTemplate(operation, result, id)
        }
      })
      this.el.historyClear.classList.remove('disabled')
      this.el.historyExport.classList.remove('disabled')
    }
    this.el.historyOther.innerHTML = list
    this.simplebar.recalculate()
  }

  historyItemTemplate(operation, result, id, className = null) {
    return `
    <div class="record${' ' + className || ''}" onclick="timeCalc.fromHistory(${id})">
      <div class="lp">${id}.</div>
      <div class="operation">${operation}</div>
      <div class="result theme-font">${result}</div>
      <div class="actions">
        <div class="icon arrow-right"></div>
      </div>
    </div>
    `
  }

  historyStartTemplate() {
    return `
    <div class="record info theme-border">
      Tutaj pojawi się wynik działania
    </div>
    `
  }

  fromHistory(id) {
    const item = this.history.find(x => x.id === id)
    this.el.firstInput.value = item.strings.result
    this.el.secondInput.value = ''
    this.setOperationMode(item.values.operation)
    this.el.secondInput.focus()
  }

  timeStringify(time) {
    if(time.type === 'number') {
      return time.hours
    } else {
      let string = ''
      if(Object.is(time.hours, -0)) string += '-'
      if(time.hours !== 0) string += `${time.hours}h `
      if(time.minutes > 0) string += `${time.minutes}m `
      if(time.seconds > 0) string += `${time.seconds}s`
      return string.trim()
    }
  }

  operationStringify(operation) {
    switch(operation) {
      case MODE.PLUS: return '+'
      case MODE.MINUS: return '-'
      case MODE.MULTIPLY: return '*'
      case MODE.DIVIDE: return '/'
    }
  }

  getResult() {
    this.resetWarning()
    const time1 = new Time(this.el.firstInput.value)
    const time2 = new Time(this.el.secondInput.value)

    if(time1.error) {
      console.error(ERROR_CODES[time1.error])
      this.showWarning(time1.error)
      return
    }

    if(time2.error) {
      console.error(ERROR_CODES[time2.error])
      this.showWarning(time2.error)
      return
    }

    if((this.operationMode === MODE.MULTIPLY || this.operationMode === MODE.DIVIDE) && time2.type !== 'number') {
      console.error(ERROR_CODES[3])
      this.showWarning(3)
      return
    }

    let result = {}

    switch(this.operationMode) {
      case MODE.PLUS: {
        let allSeconds1 = time1.seconds + (time1.minutes * 60) + (Math.abs(time1.hours) * 60 * 60)
        let allSeconds2 = time2.seconds + (time2.minutes * 60) + (Math.abs(time2.hours) * 60 * 60)
        if (time1.hours < 0 || Object.is(time1.hours, -0)) allSeconds1 *= -1
        if (time2.hours < 0 || Object.is(time2.hours, -0)) allSeconds2 *= -1
        const secondsResultOriginal = allSeconds1 + allSeconds2
        let secondsResult = Math.abs(secondsResultOriginal)

        let hours = Math.floor((secondsResult / 60) / 60)
        let minutes = Math.floor((secondsResult - (hours * 60 * 60)) / 60)
        let seconds = Math.round(secondsResult - (hours * 60 * 60) - (minutes * 60))

        if(secondsResultOriginal < 0) {
          hours *= -1
        }

        result = {
          hours,
          minutes,
          seconds
        }
        break
      }
      case MODE.MINUS: {
        let allSeconds1 = time1.seconds + (time1.minutes * 60) + (Math.abs(time1.hours) * 60 * 60)
        let allSeconds2 = time2.seconds + (time2.minutes * 60) + (Math.abs(time2.hours) * 60 * 60)
        if (time1.hours < 0 || Object.is(time1.hours, -0)) allSeconds1 *= -1
        if (time2.hours < 0 || Object.is(time2.hours, -0)) allSeconds2 *= -1
        const secondsResultOriginal = allSeconds1 - allSeconds2
        let secondsResult = Math.abs(secondsResultOriginal)

        let hours = Math.floor((secondsResult / 60) / 60)
        let minutes = Math.floor((secondsResult - (hours * 60 * 60)) / 60)
        let seconds = Math.round(secondsResult - (hours * 60 * 60) - (minutes * 60))

        if(secondsResultOriginal < 0) {
          hours *= -1
        }

        result = {
          hours,
          minutes,
          seconds
        }
        break
      }
      case MODE.MULTIPLY: {
        let allSeconds1 = time1.seconds + (time1.minutes * 60) + (Math.abs(time1.hours) * 60 * 60)
        let allSeconds2 = time2.hours
        if (time1.hours < 0 || Object.is(time1.hours, -0)) allSeconds1 *= -1
        if (time2.hours < 0 || Object.is(time2.hours, -0)) allSeconds2 *= -1
        const secondsResultOriginal = allSeconds1 * allSeconds2
        let secondsResult = Math.abs(secondsResultOriginal)

        let hours = Math.floor((secondsResult / 60) / 60)
        let minutes = Math.floor((secondsResult - (hours * 60 * 60)) / 60)
        let seconds = Math.round(secondsResult - (hours * 60 * 60) - (minutes * 60))

        if(secondsResultOriginal < 0) {
          hours *= -1
        }

        result = {
          hours,
          minutes,
          seconds
        }
        break
      }
      case MODE.DIVIDE: {
        let allSeconds1 = time1.seconds + (time1.minutes * 60) + (Math.abs(time1.hours) * 60 * 60)
        let allSeconds2 = time2.hours
        if (time1.hours < 0 || Object.is(time1.hours, -0)) allSeconds1 *= -1
        if (time2.hours < 0 || Object.is(time2.hours, -0)) allSeconds2 *= -1
        const secondsResultOriginal = allSeconds1 / allSeconds2
        let secondsResult = Math.abs(secondsResultOriginal)

        let hours = Math.floor((secondsResult / 60) / 60)
        let minutes = Math.floor((secondsResult - (hours * 60 * 60)) / 60)
        let seconds = Math.round(secondsResult - (hours * 60 * 60) - (minutes * 60))

        if(secondsResultOriginal < 0) {
          hours *= -1
        }

        result = {
          hours,
          minutes,
          seconds
        }
        break
      }
    }

    this.addToHistory(time1, time2, this.operationMode, result)
  }

  showWarning(errorCode) {
    const errorMessage = '⚠️ ' + (ERROR_CODES[errorCode] || 'Nieokreślony błąd: ' + errorCode)
    this.el.errorContainer.innerText = errorMessage
  }

  resetWarning() {
    this.el.errorContainer.innerText = ''
  }
}
window.addEventListener('DOMContentLoaded', () => {
  window.timeCalc = new calc()
})