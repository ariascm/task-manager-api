// https://www.npmjs.com/package/supertest
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

// En PACKAGE.JSON agregamos en SCRIPT -> TEST -> "--runInBand" para que se ejecuten los test en grupo y no interfieran entre ellos

// Ejecuta código antes de cada TEST.. Tambien hay beforeAll, afterEach, etc... En este caso lo utilizamos para BORRAR la BD, sino daría
// error al intentar registrar dos veces al mismo correo de Usuario.
beforeEach(setupDatabase)

// Como es asyncronico se puede usar ASYNC/AWAIT ó pasar como parametro DONE y luego llamarlo al final de la operación asyncronica DONE()
test('Should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({     //SEND, define un objeto para enviar en el REQUEST
            name: 'Joker',
            email: 'joker@gmail.com',
            password: 'joker123!'
        }).expect(201)

    // Assert that the database was changed correctly
    // console.log('RESPONSE BODYYY', response.body)
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response

    expect(response.body).toMatchObject({
        user: {
            name: 'Joker',
            email: 'joker@gmail.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('joker123!')
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        }).expect(200)
    const user = await User.findById(userOneId)
    //El body del response del login devuelve dos objetos (user, token)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not loging nonexistant user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'nonexistant@example.com',
            password: 'Mypass123!'
        }).expect(400)
})

// Template String -> ``
// syntax for injecting a value inside of Template String -> ${value}

test('Should get the profile for user', async () => {
    request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get the profile for unauthenticate user', async () => {
    request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete an account for unauthenticate user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)

    // toBe ( === ) da error al comparar objetos (ya que son distintos en memoria y la comparación es mas primitiva)
    // toEqual utiliza un algoritmo para comparar los atributos internos, haciendo una comparación profunda
    // expect({}).toBe({})
    expect({}).toEqual({})
    // asegura que la variable user es un Buffer, independientemente del contenido que pueda tener ese Buffer.
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {

    await request(app)
        .patch('/users/me')
        .send({
            name: 'Robin'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Robin')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            location: 'Argentina'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)
})







test('Should not signup user with invalid name/email/password', async () => {
    await request(app)
        .post('/users')
        .send({
            name: '',
            email: 'pepe@noexiste.com',
            password: '1234567!'
        })
        .expect(400)

    await request(app)
        .post('/users')
        .send({
            name: 'Pepe',
            email: 'pepeatnoexiste.com',
            password: '1234567!'
        })
        .expect(400)

    await request(app)
        .post('/users')
        .send({
            name: 'Pepe',
            email: 'pepe@noexiste.com',
            password: '123456'
        })
        .expect(400)
})

test('Should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send()
        .expect(401)
})

test('Should not update user with invalid name/email/password', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: '',
            email: 'pepe@argento.com',
            password: '1234567'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)

    await request(app)
        .patch('/users/me')
        .send({
            name: 'Pepe',
            email: 'pepeatargento.com',
            password: '1234567'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)

    await request(app)
        .patch('/users/me')
        .send({
            name: 'Pepe',
            email: 'pepe@argento.com',
            password: '123456'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)
})

test('Should not delete user if unauthenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})
