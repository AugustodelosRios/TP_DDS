'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AppError = require('../utils/AppError');
const { collection, persist } = require('../data/store');
const { nextId } = require('../utils/id');
const { ROLES } = require('../config/constants');

/**
 * Genera el JWT del usuario. El payload NO incluye contraseña ni datos sensibles,
 * solo lo necesario para autorizar (id, rol, nombre).
 */
function generarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function aPublico(usuario) {
  const { passwordHash, ...safe } = usuario;
  return safe;
}

/**
 * Registra un nuevo usuario. Email único, contraseña hasheada con bcrypt.
 * Por defecto el rol es colaborador (no se permite autoasignarse admin/lider
 * desde el registro público).
 */
function registrar({ nombre, email, password, rol }) {
  const usuarios = collection('usuarios');
  const emailNormalizado = email.trim().toLowerCase();

  if (usuarios.some((u) => u.email.toLowerCase() === emailNormalizado)) {
    throw new AppError('Ya existe un usuario con ese email', 409);
  }

  const nuevo = {
    id: nextId(usuarios, 'usr', 1),
    nombre: nombre.trim(),
    email: emailNormalizado,
    passwordHash: bcrypt.hashSync(password, 10),
    // Solo se respeta un rol elevado si explícitamente lo permitimos; el registro
    // público crea colaboradores. (Documentado en el README).
    rol: rol === ROLES.LIDER || rol === ROLES.ADMIN ? rol : ROLES.COLABORADOR,
    activo: true,
  };

  usuarios.push(nuevo);
  persist();

  return { usuario: aPublico(nuevo), token: generarToken(nuevo) };
}

/**
 * Valida credenciales y devuelve usuario + token.
 * 401 si el email no existe o la contraseña es incorrecta.
 */
function login({ email, password }) {
  const usuarios = collection('usuarios');
  const usuario = usuarios.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!usuario || !bcrypt.compareSync(password, usuario.passwordHash)) {
    throw new AppError('Credenciales inválidas', 401);
  }
  if (!usuario.activo) {
    throw new AppError('El usuario está inactivo', 403);
  }

  return { usuario: aPublico(usuario), token: generarToken(usuario) };
}

module.exports = { registrar, login, generarToken, aPublico };
