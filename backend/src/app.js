'use strict';

const express = require('express');
const cors = require('cors');

const config = require('./config/config');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const { load } = require('./data/store');

// Aseguramos que la base esté cargada (o seedeada) al iniciar.
load();

const app = express();

// CORS: permitimos el origen del frontend Vite.
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
    credentials: true,
  })
);

app.use(express.json());

// Rutas de la API bajo /api
app.use('/api', apiRoutes);

// 404 para rutas no encontradas + manejador central de errores.
// IMPORTANTE: el errorHandler con firma (err, req, res, next) va al final.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
