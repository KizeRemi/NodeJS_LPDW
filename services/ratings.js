'use strict'
var Promise = require('bluebird');
var Songs = Promise.promisifyAll(require('../database/songs'));

// Ici t'aurais plutôt faire appel à ratings pour exposer les opérations liés à l'enregistrement d'une note dans la base
