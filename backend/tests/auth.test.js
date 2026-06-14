'use strict';

const { app, request, USUARIOS } = require('./helpers');
const { resetDatabase } = require('../src/data/store');

// Cada suite parte de datos previsibles.
beforeEach(() => resetDatabase());

describe('Autenticación', () => {
  test('Login correcto devuelve 200, token y usuario sin passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USUARIOS.admin, password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.usuario.email).toBe(USUARIOS.admin);
    expect(res.body.usuario.passwordHash).toBeUndefined();
  });

  test('Login inválido (password incorrecta) devuelve 401 con error JSON', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USUARIOS.admin, password: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });

  test('Login con email inexistente devuelve 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@dds.com', password: '123456' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('Registro crea colaborador y devuelve 201 con token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Nuevo User', email: 'nuevo@dds.com', password: 'secreto123' });

    expect(res.status).toBe(201);
    expect(res.body.usuario.rol).toBe('colaborador');
    expect(res.body.token).toEqual(expect.any(String));
  });

  test('Registro con email duplicado devuelve 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Dup', email: USUARIOS.admin, password: 'secreto123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  test('Registro con datos inválidos devuelve 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: '', email: 'mal', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
