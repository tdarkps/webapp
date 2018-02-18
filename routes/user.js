'use strict'
var express = require('express');

var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' })
api.get('/pruebas-de-controlador', md_auth.ensureAuth, UserController.pruebas);

api.post('/register', UserController.SaveUser);
api.post('/login', UserController.login);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image/:image', UserController.getImageFile);
api.get('/keppers', UserController.getKeppers);
module.exports = api;