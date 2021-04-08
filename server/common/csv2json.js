'use strict';

var fs = require('fs');

var csv2json = module.exports;

const _separator = ',';

csv2json.convert = function(filename, callback) {
    convertWithMapping(filename, null, callback);
}

csv2json.convertWithMapping = function (filename, mapping, callback) {
    fs.readFile(filename, 'utf-8', function(err, data) {
        if (err) {
            return callback(err);
        }

        var lines = data.replace(/\r\n/g, '\n').replace(/\r/g, '').split('\n');
        var headers = lines.shift().split(_separator);

        var list = [];
        while (lines.length) {
            var arr = lines.shift().split(_separator);
            var item = {};
            arr.forEach(function(v, i) {
                var key = headers[i];
                if (mapping && mapping[headers[i]]) {
                    key = mapping[headers[i]];
                }
                item[key] = arr[i];
            });
            list.push(item);
        }
        callback(err, list);
    });  
}
