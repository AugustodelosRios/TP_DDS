'use strict';

const { app, request, loginComo, USUARIOS } = require('./helpers');
const { resetDatabase } = require('../src/data/store');

let tokenAdmin;
let tokenColaborador;

beforeEach(async () => {
  resetDatabase();
  tokenAdmin = await loginComo(USUARIOS.admin);
  tokenColaborador = await loginComo(USUARIOS.colaborador);
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Listado de tareas', () => {
  test('Lista todas las tareas (sin filtros) con paginación', async () => {
    const res = await request(app).get('/api/tareas').set(auth(tokenAdmin));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.paginacion.total).toBe(15);
  });

  test('Lista tareas filtradas por proyectoId y estado', async () => {
    const res = await request(app)
      .get('/api/tareas?proyectoId=proy-001&estado=pendiente')
      .set(auth(tokenAdmin));

    expect(res.status).toBe(200);
    for (const t of res.body.items) {
      expect(t.proyectoId).toBe('proy-001');
      expect(t.estado).toBe('pendiente');
    }
  });

  test('Filtro con estado inválido devuelve 400', async () => {
    const res = await request(app)
      .get('/api/tareas?estado=volando')
      .set(auth(tokenAdmin));

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('Detalle de tarea', () => {
  test('Detalle de tarea existente devuelve 200 y la tarea', async () => {
    const res = await request(app).get('/api/tareas/tar-1001').set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('tar-1001');
    expect(res.body).toHaveProperty('vencida');
  });

  test('Detalle de tarea inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/tareas/tar-9999').set(auth(tokenAdmin));
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Tarea no encontrada');
  });
});

describe('Creación de tareas', () => {
  const tareaValida = {
    proyectoId: 'proy-001',
    titulo: 'Nueva tarea de prueba',
    descripcion: 'Descripción de prueba',
    responsableId: 'usr-003', // integra proy-001
    prioridad: 'alta',
    fechaLimite: '2026-07-01',
  };

  test('Creación válida devuelve 201 con la tarea', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set(auth(tokenAdmin))
      .send(tareaValida);

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^tar-/);
    expect(res.body.estado).toBe('pendiente');
  });

  test('Creación inválida: responsable fuera del proyecto devuelve 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set(auth(tokenAdmin))
      .send({ ...tareaValida, responsableId: 'usr-005' }); // no integra proy-001

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El responsable no pertenece al proyecto');
  });

  test('Creación inválida: prioridad no permitida devuelve 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set(auth(tokenAdmin))
      .send({ ...tareaValida, prioridad: 'urgentisima' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Prioridad inválida/);
  });

  test('Creación inválida: estado inicial no permitido devuelve 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set(auth(tokenAdmin))
      .send({ ...tareaValida, estado: 'finalizada' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('Creación sobre proyecto finalizado devuelve 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set(auth(tokenAdmin))
      .send({ ...tareaValida, proyectoId: 'proy-004', responsableId: 'usr-005' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/finalizado/);
  });

  test('Creación sobre proyecto pausado devuelve 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set(auth(tokenAdmin))
      .send({ ...tareaValida, proyectoId: 'proy-003', responsableId: 'usr-004' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/pausado/);
  });

  test('Proyecto inexistente devuelve 404', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set(auth(tokenAdmin))
      .send({ ...tareaValida, proyectoId: 'proy-999' });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no existe/);
  });
});

describe('Seguridad y permisos', () => {
  test('Acceso sin JWT a ruta protegida devuelve 401', async () => {
    const res = await request(app).get('/api/tareas');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('Colaborador no puede crear tareas (403)', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set(auth(tokenColaborador))
      .send({
        proyectoId: 'proy-001',
        titulo: 'Intento colaborador',
        descripcion: 'No debería poder',
        responsableId: 'usr-003',
        prioridad: 'media',
        fechaLimite: '2026-07-01',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
  });

  test('Colaborador no puede acceder al resumen administrativo (403)', async () => {
    const res = await request(app).get('/api/tareas/resumen').set(auth(tokenColaborador));
    expect(res.status).toBe(403);
  });

  test('Admin sí accede al resumen (200) con agregados', async () => {
    const res = await request(app).get('/api/tareas/resumen').set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tareasPorEstado');
    expect(res.body).toHaveProperty('tareasVencidas');
    expect(res.body).toHaveProperty('cargaPorResponsable');
    expect(res.body).toHaveProperty('tareasCriticas');
  });
});

describe('Transiciones de estado', () => {
  test('Transición no permitida (finalizada -> pendiente) devuelve 400', async () => {
    // tar-1003 está finalizada en la semilla. Intentamos reabrirla vía PUT.
    const res = await request(app)
      .put('/api/tareas/tar-1003')
      .set(auth(tokenAdmin))
      .send({ estado: 'pendiente' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/No se puede editar una tarea finalizada|Transición/);
  });

  test('Iniciar una tarea pendiente la pasa a en_progreso (200)', async () => {
    // tar-1002 está pendiente, responsable usr-004. La inicia un admin.
    const res = await request(app)
      .patch('/api/tareas/tar-1002/iniciar')
      .set(auth(tokenAdmin));

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('en_progreso');
  });

  test('Colaborador no responsable no puede iniciar una tarea ajena (403)', async () => {
    // tar-1002 responsable es usr-004 (Juan). La colaboradora Mica (usr-003) no puede.
    const res = await request(app)
      .patch('/api/tareas/tar-1002/iniciar')
      .set(auth(tokenColaborador));

    expect(res.status).toBe(403);
  });

  test('Colaborador no puede finalizar (solo gestor) (403)', async () => {
    // tar-1001 está en_progreso y su responsable es Mica (usr-003), pero finalizar es solo gestor.
    const res = await request(app)
      .patch('/api/tareas/tar-1001/finalizar')
      .set(auth(tokenColaborador));

    expect(res.status).toBe(403);
  });

  test('Admin finaliza una tarea en_progreso (200) y queda registrado en historial', async () => {
    const res = await request(app)
      .patch('/api/tareas/tar-1001/finalizar')
      .set(auth(tokenAdmin));

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('finalizada');

    const hist = await request(app).get('/api/tareas/tar-1001/historial').set(auth(tokenAdmin));
    expect(hist.status).toBe(200);
    const ultima = hist.body[hist.body.length - 1];
    expect(ultima.valorNuevo.estado).toBe('finalizada');
  });
});

describe('Edición de tareas', () => {
  test('Colaborador responsable puede editar la descripción de su tarea (200)', async () => {
    // tar-1001 responsable Mica (usr-003).
    const res = await request(app)
      .put('/api/tareas/tar-1001')
      .set(auth(tokenColaborador))
      .send({ descripcion: 'Descripción actualizada por la responsable' });

    expect(res.status).toBe(200);
    expect(res.body.descripcion).toBe('Descripción actualizada por la responsable');
  });

  test('Colaborador no puede cambiar la prioridad (403)', async () => {
    const res = await request(app)
      .put('/api/tareas/tar-1001')
      .set(auth(tokenColaborador))
      .send({ prioridad: 'critica' });

    expect(res.status).toBe(403);
  });
});
