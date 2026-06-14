'use strict';

const request = require('supertest');
const app = require('../src/app');

/**
 * Helper para loguear un usuario semilla y devolver su token.
 */
async function loginComo(email, password = '123456') {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

const USUARIOS = {
  admin: 'admin@dds.com',
  lucia: 'lucia@dds.com', // usr-002, colaborador
  colaborador: 'mica@dds.com', // usr-003, integra proy-001 y proy-002
  colaboradorJuan: 'juan@dds.com', // usr-004
};

module.exports = { app, request, loginComo, USUARIOS };
