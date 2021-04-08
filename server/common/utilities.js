'use strict';

var util = module.exports;

/**
 * 返回一个介于 min 和 max 之间的整型随机数
 * 
 * @min {int} 最小值
 * @max {int} 最大值
 */
util.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 随机字符
 */
var _chars = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];
/**
 * 返回一个长度为 length 的随机字符串
 */
util.getRandomCode = function (length) {
    var code = '';
    while (code.length < length) {
        code += _chars[util.getRandomInt(0, _chars.length-1)];
    }
    return code;
}
/**
 * 返回一个长度为 length 的纯数字随机码
 */
util.getRandomIntCode = function (length) {
    var code = '';
    while (code.length < length) {
        code += _chars[util.getRandomInt(0, 9)];
    }
    return code;
}

util.padLeft = function (value, length, character) {
    value = value.toString();
    while (value.length < length) {
        value = character + value;
    }
    return value;
}

util.padRight = function (value, length, character) {
    value = value.toString();
    while (value.length < length) {
        value += character;
    }
    return value;
}

util.generateSerialNo = function (randomLength, array) {
  randomLength = randomLength || 6
  var now = new Date()
  var year = now.getFullYear()
  var month = util.padLeft(now.getMonth() + 1, 2, '0')
  var date = util.padLeft(now.getDate(), 2, '0')
  var hours = util.padLeft(now.getHours(), 2, '0')
  var minutes = util.padLeft(now.getMinutes(), 2, '0')
  var seconds = util.padLeft(now.getSeconds(), 2, '0')
  var randomNo = util.getRandomIntCode(randomLength)
  var serialNo = `${year}${month}${date}${hours}${minutes}${seconds}${randomNo}`

  if (array && Array.isArray(array)) {
    while (array.some(v => v === serialNo)) {
      serialNo = util.generateSerialNo(randomLength)
    }
    array.push(serialNo)
  }
  return serialNo
}

util.dateToString = function (date, timeZone) {
  var dt = new Date(date);
  timeZone = timeZone || 'local';

  var year;
  var month;
  var day;
  var hour;
  var minute;
  var second;
  var millisecond;

  if (timeZone === 'local') {
    year        = dt.getFullYear();
    month       = dt.getMonth() + 1;
    day         = dt.getDate();
    hour        = dt.getHours();
    minute      = dt.getMinutes();
    second      = dt.getSeconds();
    millisecond = dt.getMilliseconds();
  } else {
    var tz = convertTimezone(timeZone);

    if (tz !== false && tz !== 0) {
      dt.setTime(dt.getTime() + (tz * 60000));
    }

    year        = dt.getUTCFullYear();
    month       = dt.getUTCMonth() + 1;
    day         = dt.getUTCDate();
    hour        = dt.getUTCHours();
    minute      = dt.getUTCMinutes();
    second      = dt.getUTCSeconds();
    millisecond = dt.getUTCMilliseconds();
  }

  // YYYY-MM-DD HH:mm:ss.mmm
  return zeroPad(year, 4) + '-' + zeroPad(month, 2) + '-' + zeroPad(day, 2) + ' ' +
    zeroPad(hour, 2) + ':' + zeroPad(minute, 2) + ':' + zeroPad(second, 2) + '.' +
    zeroPad(millisecond, 3);
};

function zeroPad(number, length) {
  number = number.toString();
  while (number.length < length) {
    number = '0' + number;
  }

  return number;
}
