var express = require('express');
var router = express.Router();
var UserService = require('../services/users');
/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.accepts('text/html') || req.accepts('application/json')) {
                UserService.findLastUsers()
                    // Il n'y a pas l'appel pour les chansons les mieux notées
                    .then(function(users) {
                        if (req.accepts('text/html')) {
                            return res.render('index', {lastUser: users});
                        }
                        if (req.accepts('application/json')) {
                            res.status(200).send({lastUser: users});
                        }
                    })
                ;
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

module.exports = router;
