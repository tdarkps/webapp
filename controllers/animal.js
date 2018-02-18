'use strict'

// modulos
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');
var Animal = require('../models/animal');


// acciones
function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de animales y la funcion de pruebas',
        user: req.user
    });
}

function saveAnimal(req, res) {
    var animal = new Animal();
    var params = req.body;

    if (params.name) {
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;

        animal.populate({ path: 'user' }).save((err, animalStored) => {
            if (err) {
                res.status(500).send({
                    message: 'error en el servidor'
                });
            } else {
                if (!animalStored) {
                    res.status(404).send({
                        message: 'no se guardo el animal'
                    });
                } else {
                    res.status(200).send({ animal: animalStored });
                }

            }
        });
    } else {
        res.status(404).send({
            message: 'el nombre del animal es obligatorio'
        });
    }
}

function getAnimals(req, res) {
    Animal.find({}).populate({ path: 'user' }).exec((err, animals) => {
        if (err) {
            res.status(500).send({
                message: 'error en el servidor'
            });
        } else {
            if (!animals) {
                res.status(404).send({
                    message: 'no hay animales'
                });
            } else {
                res.status(200).send({
                    animals
                });
            }
        }
    });
}

function getAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findById(animalId).populate({ path: 'user' }).exec((err, animal) => {
        if (err) {
            res.status(500).send({
                message: 'error en el servidor'
            });
        } else {
            if (!animal) {
                res.status(404).send({
                    message: 'el animale no existe'
                });
            } else {
                res.status(200).send({
                    animal
                });
            }
        }
    });
}

function updateAnimal(req, res) {
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate(animalId, update, { new: true }, (err, animalUpdated) => {
        if (err) {
            res.status(500).send({
                message: 'error en el servidor'
            });
        } else {
            if (!animalUpdated) {
                res.status(404).send({
                    message: 'el animale no se actualizo'
                });
            } else {
                res.status(200).send({
                    animalUpdated
                });
            }
        }
    });
}

function uploadImage(req, res) {
    var animalId = req.params.id;
    var file_name = 'no subio ...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];


        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg') {

            Animal.findByIdAndUpdate(animalId, { image: file_name }, { new: true }, (err, animalUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'error al actualizar usuario' });
                } else {
                    if (!animalUpdated) {
                        res.status(500).send({ message: 'no se ha podido actualizar el usuario' });
                    } else {
                        res.status(200).send({ animal: animalUpdated, image: file_name });
                    }
                }
            });

        } else {
            fs.unlink(file_path, (err) => {
                if (err) {
                    res.status(500).send({ message: 'Extension no valida y no borrado' });
                } else {
                    res.status(500).send({ message: 'Extension no valida' });
                }
            });

        }

    } else {
        res.status(500).send({ message: 'no se ha subido el fichero' });
    }


}

function getImageFile(req, res) {
    var imageFile = req.params.image;
    var path_file = './uploads/animals/' + imageFile;

    fs.exists(path_file, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(404).send({ message: 'la imagen no existe' });
        }
    });

}

function deleteAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
        if (err) {
            res.status(500).send({ message: 'error en la peticion' });
        } else {
            if (!animalRemoved) {
                res.status(500).send({ message: 'no se ha podido eliminar el animal' });
            } else {
                res.status(200).send({ animal: animalRemoved });
            }
        }
    });
}

module.exports = {
    pruebas,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImage,
    getImageFile,
    deleteAnimal
}