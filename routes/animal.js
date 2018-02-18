'use strict'

var express = require('express');

var AnimalController = require('../controllers/animal');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/animals' });
var md_admin = require('../middlewares/is_admin');

api.get('/pruebas-animales', md_auth.ensureAuth, AnimalController.pruebas);
api.post('/animal', [md_auth.ensureAuth, md_admin.isAdmin], AnimalController.saveAnimal);
api.get('/animales', AnimalController.getAnimals);
api.get('/animal/:id', AnimalController.getAnimal);
api.put('/animal/:id', [md_auth.ensureAuth, md_admin.isAdmin], AnimalController.updateAnimal);
api.post('/upload-animal/:id', [md_auth.ensureAuth, md_admin.isAdmin, md_upload], AnimalController.uploadImage);
api.get('/get-image-animal/:image', AnimalController.getImageFile);
api.delete('/animal/:id', [md_auth.ensureAuth, md_admin.isAdmin], AnimalController.deleteAnimal);

module.exports = api;