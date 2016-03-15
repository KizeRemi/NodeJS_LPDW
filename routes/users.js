var express = require('express');
var router = express.Router();
var SongService = require('../services/songs');
var UserService = require('../services/users');

/* GET users listing. */
router.get('/', function(req, res) {
  if (req.accepts('text/html')  || req.accepts('application/json'))  {
      UserService.findAll(req.query)
          .then(function(users){
              if (req.accepts('text/html')) {
                  return res.render('reseau', {users: users});
              }
              if (req.accepts('application/json')) {
                  res.status(200).send(users);
              }
          })
      ;
  }
  else {
      res.status(406).send({err: 'Not valid type for asked ressource'});
  }
});

router.get('/profil', function(req, res) {
    UserService.findOneByQuery({_id: req.user._id})
        .then(function(user){
            if (!user) {
                res.status(404).send({err: 'No user found with id'});
                return;
            }
            SongService.find({_id: { $in: user.favoriteSongs}})
                .then(function(songs){
                    if (req.accepts('text/html')) {
                        return res.render('profil', {user: user, favoriteSongs: songs});
                    }
            });
        });
});

router.get('/:id', function(req, res) {
    if (req.accepts('text/html') || req.accepts('application/json')) {
        UserService.findOneByQuery({_id: req.params.id})
            .then(function(user) {
                if (!user) {
                    res.status(404).send({err: 'No user found with id' + req.params.id});
                    return;
                }

                if (req.accepts('text/html')) {
                    res.render('user', {user: user});
                    return;
                }

                if (req.accepts('application/json')) {
                    res.status(200).send(user);
                    return;
                }
            })
            .catch(function(err) {

            })
        ;
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});
module.exports = router;
