const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, setupDatabase, userTwo, taskOne, taskTwo } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create a task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()

    expect(task.completed).toEqual(false)
})

// Cuando setea la Authorization, la API devuelve el usuario que es usado por moongose para devolver solo los registros asociados a el.
test('Should fetch user task', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

test('Should not the second User delete the first task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})


// OTROS TESTS PARA REALIZAR. userOne -> taskOne y taskTwo. userTwo -> taskThree

test('Should not create task with invalid description/completed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)
})

test('Should not update task with invalid description/completed', async () => {
    await request(app)
        .patch('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: 'Error debe ser booleano este valor'
        })
        .expect(500)

})

test('Should delete user task', async () => {
    await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(await Task.findById(taskOne._id)).toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete('/tasks/' + taskOne._id)
        .send()
        .expect(401)

    expect(await Task.findById(taskOne._id)).not.toBeNull()
})

test('Should not update other users task', async () => {
    await request(app)
        .patch('/tasks/' + taskTwo._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: "No encontrará la tarea"
        })
        .expect(404)
})

test('Should fetch user task by id', async () => {
    await request(app)
        .get('/tasks/' + taskTwo._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get('/tasks/' + taskTwo._id)
        .send()
        .expect(401)
})


test('Should not fetch other users task by id', async () => {
    const response = await request(app)
        .get('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    response.body.forEach(task => {
        expect(task.completed).toBe(true)
    })
})

test('Should fetch only incomplete tasks', async () => {
    // DESTRUCTURACION DE OBJETO response.body, y le asigno el nombre tasks
    // const response =  = await request(app)
    const { body: tasks } = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // response.body.forEach(task => {
    tasks.forEach(task => {
        expect(task.completed).toBe(false)
    });
})

test('Should sort tasks by description/completed/createdAt/updatedAt', async () => {
    const { body: tasks } = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // Comparo la fecha createdAt del actual contra el que sigue
    for (i = 0; i < tasks.length - 1; i++) {
        const currentTask = tasks[i]
        const nextTask = tasks[i + 1]
        //getTime devuelve la cantidad de milisegundos desde el 01/1970 como NUMBER para poder compararlos.
        expect(new Date(currentTask.createdAt).getTime()).toBeGreaterThanOrEqual(new Date(nextTask.createdAt).getTime())
    }
})

test('Should fetch page of tasks', async () => {
    const { body: tasks } = await request(app)
        .get('/tasks?skip=1&limit=2')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(tasks.length).toBe(1)    //siempre sera uno ya que encuentra solo 2 tareas en la BD asignada a ese user, pero skipea 1
})
