'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3789;

mongoose.Promise = global.Promise;

//local
mongoose.connect('mongodb://localhost:27017/zoologico', { useMongoClient: true })
    .then(() => {
        app.listen(port, () => {
            console.log('servidor local con node y express esta corriendo');
        });
        console.log('Se realizo la conexion');
    });


//externo
/*
mongoose.connect('mongodb://tdarkps:tdps1988@ds231228.mlab.com:31228/publiface', { useMongoClient: true })
    .then(() => {
        app.listen(port, () => {
            console.log('servidor local con node y express esta corriendo');
        });
        console.log('Se realizo la conexion');
    });*/