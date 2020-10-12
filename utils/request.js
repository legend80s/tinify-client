const http = require('http');
const https = require('https');

/**
 * @param {string} url
 */
const getRequest = url => /https:\/\//.test(url) ? https : http;

exports.getRequest = getRequest;
