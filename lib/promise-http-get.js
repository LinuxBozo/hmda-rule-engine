/* global -Promise */
'use strict';

var Promise = require('bluebird');
var http = require('http');

var request = function(url) {
    var deferred = Promise.defer();

    if (typeof url !== 'string') {
      deferred.reject(new Error('The URL/path must be a string.'));
    }

    http.get(url, function(res) {
        var chunks = [];

        if (res.statusCode >= 300) {
            deferred.reject(new Error('Server responded with status code '+ res.statusCode+' for url ' + url));
        }

        res.on('data', function(chunk) {
            chunks[chunks.length] = chunk;
        });

        res.on('end', function() {
            // The UTF8 byte order mark
            // Strip this value out, can break JSON.parse().
            if (chunks[0].length > 0 && chunks[0][0] === '\uFEFF') {
                chunks[0] = chunks[0].substring(1);
            }
            var body = '';
            for (var i = 0; i < chunks.length; i++) {
                body += chunks[i];
            }
            deferred.resolve(body);
        });

    }).on('error', function(e) {
        deferred.reject(e);
    });

    return deferred.promise;
};

module.exports = request;