/*!
 * apiai
 * Copyright(c) 2015 http://api.ai/
 * Apache 2.0 Licensed
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var https = require('https');
var http = require('http');
var HttpsProxyAgent = require('https-proxy-agent');
var url = require('url');

exports.Request = module.exports.Request = Request;

util.inherits(Request, EventEmitter);

function Request (application, options) {
    var self = this;

    self.clientAccessToken = application.clientAccessToken;

    self.hostname = application.hostname;

    self.endpoint = options.endpoint;
    self.requestSource = application.requestSource;

    var requestOptions = self._requestOptions();

    if (application.secure) {
      var _http = https
      var proxy_uri = process.env.HTTP_PROXY;

      if (proxy_uri) {
        var agent = new HttpsProxyAgent(proxy_uri);
      }
    } else {
      var _http = http
      var agent = application._agent;
    }

    requestOptions.agent = agent;

    var request = _http.request(requestOptions, function(response) {
        self._handleResponse(response);
    });

    request.on('error', function(error) {
        self.emit('error', error);
    });

    self.request = request;
}

Request.prototype._handleResponse = function(response) {
    throw new Error("Can't call abstract method!");
};

Request.prototype._headers = function() {
    var self = this;

    return {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + self.clientAccessToken,
        'api-request-source': self.requestSource
    };
};

Request.prototype._requestOptions = function() {
    var self = this;

    return {
        hostname: self.hostname,
        headers: self._headers(),
    };
};

Request.prototype.write = function(chunk) {
    this.request.write(chunk);
};

Request.prototype.end = function() {
    this.request.end();
};
