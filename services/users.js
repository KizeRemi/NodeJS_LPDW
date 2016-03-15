'use strict'
var Promise = require('bluebird');
var Users = Promise.promisifyAll(require('../database/users'));

exports.findOneByQuery = function(query) {
    return Users.findOneAsync(query);
};

exports.findAll = function() {
    return Users.findAsync();
};
exports.createUser = function(user) {
    return Users.createAsync(user);
};

exports.addFavorite = function(userId, songId) {
    return Users.findOneAndUpdateAsync(
        {_id: userId},
        {$push: {favoriteSongs: songId}},
        {new: true}
    );
};

exports.deleteFavorites = function(userId, songId) {
    return Users.findOneAndUpdateAsync(
        {_id: userId},
        {$pop: {favoriteSongs: songId}},
        {new: true}
    );
};

exports.deleteAllFavorites = function(userId) {
    return Users.findOneAndUpdateAsync(
        {_id: userId},
        {favoriteSongs: []},
        {new: true}
    );
};

exports.findLastUsers = function() {
    return Users.find({}).sort('-createdAt').limit(3);
};