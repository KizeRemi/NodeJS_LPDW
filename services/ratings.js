'use strict'
var Promise = require('bluebird');
var Songs = Promise.promisifyAll(require('../database/songs'));
