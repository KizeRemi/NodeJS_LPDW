var express = require('express');
var _ = require('lodash');
var router = express.Router();
var SongService = require('../services/songs');
var UserService = require('../services/users');
var RatingService = require('../services/ratings');

var verifyIsAdmin = function(req, res, next) {
    if (req.isAuthenticated() && req.user.username === 'admin') {
        return next();
    }
    else {
        res.status(403).send({err: 'Current user can not access to this operation'});
    }
};

router.get('/', function(req, res) {
    if (req.accepts('text/html') || req.accepts('application/json')) {
        var request;
        if(req.query.filtre && req.query.filtreText){
            if(req.query.filtre == "album")
                request = {album: req.query.filtreText};
        }
        if(req.query.filtre && req.query.filtreText){
        // cette validation est repetée plusieurs fois... tu peux la refactorer
            if(req.query.filtre == "title")
                request = {title: req.query.filtreText};
        }
        if(req.query.filtre && req.query.filtreText){
            if(req.query.filtre == "artist")
                request = {artist: req.query.filtreText};
        }
        if(req.query.filtre && req.query.filtreText){
            if(req.query.filtre == "year")
                request = {year: req.query.filtreText};
        }
        if(req.query.filtre && req.query.filtreText){
            if(req.query.filtre == "bpm")
                request = {bpm: req.query.filtreText};
        }
        SongService.find(request)
            .then(function(songs) {
                if (req.accepts('text/html')) {
                    return res.render('songs', {songs: songs});
                }
                if (req.accepts('application/json')) {
                    res.status(200).send(songs);
                }
            })
        ;
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.get('/songs', function(req, res) {
    if (req.accepts('text/html') || req.accepts('application/json')) {

        SongService.find(req.query || {})
            .then(function(songs) {
                if (req.accepts('text/html')) {
                    return res.render('songs', {songs: songs});
                }
                if (req.accepts('application/json')) {
                    res.status(200).send(songs);
                }
            })
        ;
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.get('/add', verifyIsAdmin, function(req, res) {
    var song = (req.session.song) ? req.session.song : {};
    var err = (req.session.err) ? req.session.err : null;
    if (req.accepts('text/html')) {
        req.session.song = null;
        req.session.err = null;
        return res.render('newSong', {song: song, err: err});
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.get('/:id', function(req, res) {
    if (req.accepts('text/html') || req.accepts('application/json')) {
        SongService.findOneByQuery({_id: req.params.id})
            .then(function(song) {
                if (!song) {
                    res.status(404).send({err: 'No song found with id' + req.params.id});
                    return;
                }
                if (req.accepts('text/html')) {
                    return res.render('song', {song: song});
                }
                if (req.accepts('application/json')) {
                    return res.send(200, song);
                }
            })
            .catch(function(err) {
                console.log(err);
                res.status(500).send(err);
            })
        ;
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.get('/artist/:artist', function(req, res) {
    SongService.find({artist: {$regex: req.params.artist, $options: 'i'}})
        .then(function(songs) {
            res.status(200).send(songs);
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        })
    ;
});

var songBodyVerification = function(req, res, next) {
    var attributes = _.keys(req.body);
    var mandatoryAttributes = ['title', 'album', 'artist'];
    var missingAttributes = _.difference(mandatoryAttributes, attributes);
    if (missingAttributes.length) {
        res.status(400).send({err: missingAttributes.toString()});
    }
    else {
        if (req.body.title && req.body.album && req.body.artist) {
            next();
        }
        else {
            var error = mandatoryAttributes.toString() + ' are mandatory';
            if (req.accepts('text/html')) {
                req.session.err = error;
                req.session.song = req.body;
                res.redirect('/songs/add');
            }
            else {
                res.status(400).send({err: error});
            }
        }
    }
};

router.post('/', verifyIsAdmin, songBodyVerification, function(req, res) {
    SongService.create(req.body)
        .then(function(song) {
            if (req.accepts('text/html')) {
                return res.redirect('/songs/' + song._id);
            }
            if (req.accepts('application/json')) {
                return res.status(201).send(song);
            }
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

router.delete('/', verifyIsAdmin, function(req, res) {
    SongService.deleteAll()
        .then(function(songs) {
            res.status(200).send(songs);
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

router.get('/edit/:id', verifyIsAdmin, function(req, res) {
    var song = (req.session.song) ? req.session.song : {};
    var err = (req.session.err) ? req.session.err : null;
    if (req.accepts('text/html')) {
        SongService.findOneByQuery({_id: req.params.id})
            .then(function(song) {
                if (!song) {
                    res.status(404).send({err: 'No song found with id' + req.params.id});
                    return;
                }
                return res.render('editSong', {song: song, err: err});
            })
        ;
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.put('/:id', verifyIsAdmin, function(req, res) {
    SongService.updateSongById(req.params.id, req.body)
        .then(function (song) {
            if (!song) {
                res.status(404).send({err: 'No song found with id' + req.params.id});
                return;
            }
            if (req.accepts('text/html')) {
                return res.redirect('/songs/' + song._id);
            }
            if (req.accepts('application/json')) {
                res.status(200).send(song);
            }
        })
        .catch(function (err) {
            res.status(500).send(err);
        })
    ;
});

router.delete('/:id', verifyIsAdmin, function(req, res) {
    SongService.removeAsync({_id: req.params.id})
        .then(function() {
            res.status(204);
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});
router.post('/favoris/:id', function(req, res) {
    // L'url ne fait reference au fait qu'on modifie un utilisateur. **POST /users/me/favorites/:song_id** aurait été plus parlant
    UserService.addFavorite(req.user._id, req.params.id)
        .then(function(user) {
            if (req.accepts('text/html')) {
                return res.redirect("/songs/" + req.params.id);
            }
            if (req.accepts('application/json')) {
                res.status(201).send(user);
                // 201 est utilisé pour une création. Là on est sur plus sur l'ajout d'une reference sur un objet existant.
                // je dirais plutôt un 200
            }
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});
router.delete('/favoris/:id', function(req, res) {
    UserService.deleteFavorites(req.user._id, req.params.id)
        .then(function(user) {
            // tu ne fais que le traitement du cas application/json et pas le cas text/html, du coup sur la vue les chansons ne se
            // mettent pas à jour après la supression. Il suffisait de faire
            if (req.accepts('text/html')) {
                res.redirect('/users/profil');
            }
            if (req.accepts('application/json')) {
                res.status(204).send();
            }
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});
router.delete('/favoris/all', function(req, res) {
    UserService.deleteAllFavorites(req.user._id)
        .then(function(user) {
            if (req.accepts('application/json')) {
                res.status(204).send();
            }
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});
module.exports = router;