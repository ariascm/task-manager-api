const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()


// Without MIDDLEWARE ->  new request -> run Route handler
// With MIDDLEWARE ->     new request -> do something -> run Route handler 
// configuramos EXPRESS MIDDLEWARE llamando a una funcion flecha ANTES de los APP USE ROUTES (Ultimo: Se agrego carpeta middleware y se seteó en las rutas. Ver "auth")
// app.use((req, res, next) => {
//     return res.status(503).send('This site is under maintenance, please try again later')
// })

// Automaticamente parsea el JSON del REQUEST enviado por POST => a un OBJETO java, para poder accederlo desde las REQUEST HANDLERS (req.body)
app.use(express.json())      // FRAMEWORK DE EXPRESS

app.use(userRouter)
app.use(taskRouter)

module.exports = app