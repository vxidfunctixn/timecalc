class Time {
  constructor(input) {
    this.timeString = input
    const translatedTime = this.translateTime()
    const validatedTimeError = this.validateTime(translatedTime)

    if(validatedTimeError === 0) {
      return translatedTime
    } else {
      return {
        error: validatedTimeError
      }
    }
  }

  translateTime() {
    let validate = this.timeString.replace(/[^0-9$:.mhgsMHGS\-]/g,'')

    if(validate.match(/:/)) {
      validate = validate.replace(/[^0-9$:\-]/g,'')
      const timeArray = validate.split(':')
      let hours = parseInt(timeArray[0])
      if(validate.match(/-/)) {
        hours = Math.abs(hours) * -1
      }
      const minutes = parseInt(timeArray[1]) || 0
      const seconds = parseInt(timeArray[2]) || 0
      return {
        hours,
        minutes,
        seconds,
        type: 'short'
      }
    }
    else if(validate.match(/[mhgsMHGS-]/)) {
      const hourH = this.getNumberBeforeChar(validate, 'h')
      const hourHH = this.getNumberBeforeChar(validate, 'H')
      const hourG = this.getNumberBeforeChar(validate, 'g')
      const hourGG = this.getNumberBeforeChar(validate, 'G')
      let hours = hourGG || hourG || hourHH || hourH || 0

      if(validate.match(/-/)) {
        hours = Math.abs(hours) * -1
      }

      const minuteM = this.getNumberBeforeChar(validate, 'm')
      const minuteMM = this.getNumberBeforeChar(validate, 'M')
      const minutes = minuteMM || minuteM || 0

      const secondS = this.getNumberBeforeChar(validate, 's')
      const secondSS = this.getNumberBeforeChar(validate, 'S')
      const seconds = secondSS || secondS || 0

      return {
        hours,
        minutes,
        seconds,
        type: 'long'
      }
    }
    else if(validate.match(/[0-9]/)) {
      validate = validate.replace(/[^0-9$.\-]/g,'')

      return {
        hours: parseFloat(validate),
        minutes: 0,
        seconds: 0,
        type: 'number'
      }
    }
  }

  getNumberBeforeChar(string, char) {
    const split = string.split(char)
    return parseInt(split[0].match(/\d+$/)) || null
  }

  validateTime(time) {
    let error = 0
    if(!time) {
      return 2
    }

    const {hours, minutes, seconds} = time

    if(hours === 0 && minutes === 0 && seconds === 0) {
      error = 4
    }

    if(minutes < 0 || minutes >= 60) {
      error = 1
    }

    if(seconds < 0 || seconds >= 60) {
      error = 1
    }

    return error
  }
}

export default Time