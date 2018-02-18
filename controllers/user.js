'use strict'

// modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');


//servicios
var jwt = require('../services/jwt');


// acciones
function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de usuarios y la funcion de pruebas',
        user: req.user
    });
}

function SaveUser(req, res) {
    // crear el objeto del usuario
    var user = new User();

    // recoger parametros peticion
    var params = req.body;
    //console.log(params);


    if (params.password && params.name && params.email) {
        // Asignar valores al objeto usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;


        User.findOne({ email: user.email.toLowerCase() }, (err, issetUser) => {
            if (err) {
                res.status(500).send({ message: 'Error al comprobar el usuario' });
            }
            if (!issetUser) {
                //Cifrar cotraseña
                bcrypt.hash(params.password, null, null, function(err, hash) {
                    user.password = hash;

                    //guardo usuario en base de datos
                    user.save((err, userStored) => {
                        if (err) {
                            res.status(500).send({ message: 'Error al guardar' });
                        } else {
                            if (!userStored) {
                                res.status(404).send({ message: 'no se registro el usuario' });
                            } else {
                                res.status(200).send({ user: userStored });
                                console.log('user guardado en mongodb')
                            }

                        }

                    });

                });
            } else {
                res.status(404).send({ message: 'el usuario ya existe' });
            }
        });



    } else {
        res.status(200).send({
            message: 'Introduce los datos'
        });
    }

}

function login(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Error al comprobar el usuario' });
        }
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {

                    //Comprobar el token
                    if (params.gettoken) {
                        //devolver jwt
                        res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        res.status(200).send({ user });
                    }

                } else {
                    res.status(404).send({ message: 'la contraseña no coincide' });
                }
            });

        } else {
            res.status(404).send({ message: 'usuario no existe' });
        }
    });
}


function updateUser(req, res) {

    var userId = req.params.id;
    var update = req.body;
    delete update.password;


    if (userId != req.user.sub) {
        return res.status(403).send({ message: 'no tienes permisos' });
    }

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) {
            res.status(500).send({ message: 'error al actualizar usuario' });
        } else {
            if (!userUpdated) {
                res.status(500).send({ message: 'no se ha podido actualizar el usuario' });
            } else {
                res.status(200).send({ user: userUpdated });
            }
        }
    });

}

function uploadImage(req, res) {
    var userId = req.params.id;
    var file_name = 'no subio ...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];


        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg') {
            if (userId != req.user.sub) {
                return res.status(403).send({ message: 'no tienes permisos' });
            }

            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'error al actualizar usuario' });
                } else {
                    if (!userUpdated) {
                        res.status(500).send({ message: 'no se ha podido actualizar el usuario' });
                    } else {
                        res.status(200).send({ user: userUpdated, image: file_name });
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
    var path_file = './uploads/users/' + imageFile;

    fs.exists(path_file, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(404).send({ message: 'la imagen no existe' });
        }
    });

}

function getKeppers(req, res) {
    User.find({ role: 'ROLE_ADMIN' }).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion' });
        } else {
            if (!users) {
                res.status(404).send({ message: 'No hay cuidadores' });
            } else {
                res.status(200).send({ users });
            }
        }
    });

}

module.exports = {
    pruebas,
    SaveUser,
    login,
    updateUser,
    uploadImage,
    getImageFile,
    getKeppers
};