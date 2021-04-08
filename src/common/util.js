export default{
  formatTime: function (dateObj) {
    if (!dateObj) {
      return
    }

    var hh = this.padZero(dateObj.getHours())
    var mm = this.padZero(dateObj.getMinutes())
    return hh + ':' + mm
  },
  formatDate: function (dateObj) {
    if (!dateObj) {
      return
    }
    dateObj = new Date(dateObj)
    var yy = dateObj.getFullYear()
    var mm = this.padZero(dateObj.getMonth() + 1)
    var dd = this.padZero(dateObj.getDate())
    var day = dateObj.getDay()
    return yy + '年' + mm + '月' + dd + '日' + '星期' + this.toChineseDay(day)
  },
  padZero: function (n, length) {
    if (!length) {
      length = 2
    }

    n = '' + n
    while (n.length < length) {
      n = '0' + n
    }
    return n
  },

  toChineseDay: function (n) {
    switch (n) {
      case 0:
        return '日'
      case 1:
        return '一'
      case 2:
        return '二'
      case 3:
        return '三'
      case 4:
        return '四'
      case 5:
        return '五'
      case 6:
        return '六'
    }
  },
  calcDiffInDay: function (day1, day2) {
    if (typeof day1 === 'string') {
      day1 = new Date(day1)
      day2 = new Date(day2)
    }
    return parseInt((day1 - day2) / 1000 / 3600 / 24)
  },

  generate_day_list: function (item) {
    var list = []
    var current = item.start_time || item.st
    var dayDiff = this.calcDiffInDay(item.end_time || item.et, current)
    for (var i = 0; i <= dayDiff; i++) {
      list.push(current)
      current = new Date(Number(current))
      current.setDate(current.getDate() + 1)
    }
    return list
  },

  nextPage: function (url, msg, callback) {
    var vm = this
    vm.$http.post(url, msg)
      .then(callback.bind(vm))
  },
  dateTostring: function (val) {
    let d = val
    var m = (d.getMonth() + 1)
    if (m < 10) {
      m = '0' + m
    }
    var dd = (d.getDate())
    if (dd < 10) {
      dd = '0' + dd
    }
    return d.getFullYear() + '-' + m + '-' + dd + ' 00:00:00'
  },
  removeSeconds: function (time) {
    var temp = time.split(':')
    temp.pop()
    return temp.join(':')
  },

  getName: function (dateObj) {
//        console.log(s)
    return '' + dateObj.getFullYear() + this.padZero(dateObj.getMonth() + 1) + this.padZero(dateObj.getDate()) + this.padZero(dateObj.getHours()) + this.padZero(dateObj.getMinutes()) + this.padZero(dateObj.getSeconds()) + this.padZero(dateObj.getMilliseconds(), 3)
  }

}

