const express = require('express')
const router = express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const { ObjectId } = require('mongodb')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

router.post('/users', async (req, res) => {

    // CODIGO PARA CONVERTIR A OBJETO JAVA EL REQ ENVIADO EN EL POST, SIN EL FRAMEWORK DE EXPRESS
    // req.on('data', function(chunk) {
    //     var bodydata = chunk.toString('utf8');
    //     console.log(bodydata)
    // });

    // STATUS AVAILABLES: https://http.dev/status

    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        // en User Model -> declaramos este METHOD que se ejecuta para instancias. El token devuelto consta de 3 partes: xxxx.xxxxx.xxxx
        // si decodificamos la parte del medio en https://www.base64decode.org/ veremos el objeto con el _id y el iat (issued at) -> fecha cuando fue creado
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        // console.log(e)
        res.status(400).send()
    }

})

router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Agregamos el middleware AUTH como segundo argumento para que primero se ejecute el REQUEST, luego el middleware y luego el route handler
router.get('/users/me', auth, async (req, res) => {

    // req.user fue creado dentro de la funcion "auth" (ej req.xxxx)
    res.send(req.user)
})


// Update
router.patch('/users/me', auth, async (req, res) => {

    // Object.keys() obtiene todos los valores claves (propiedades) de los objetos, dentro de un Array de STRINGS
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    // Every recorre todos los elementos de un array, en este caso los campos que enviamos a actualizar, si cada uno no esta incluido
    // en el array de allowedUpdates, devuelve falso. Solo si todos estan incluidos devuelve TRUE.
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates" })
    }

    try {

        const user = req.user
        updates.forEach(update => user[update] = req.body[update]);
        await user.save()

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    // OLD CODE, antes obteniamos el ID desde los PARAMETROS /users/:id  // Ahora el middleware AUTH lo guarda en la REQUEST "req.user"
    // const _id = req.params.id
    // if (!ObjectId.isValid(_id)) {
    //     return res.status(400).send({ error: 'Id is invalid' })
    // }

    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        // console.log(req.user)
        await req.user.deleteOne()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// SUBIR Y GUARDAR IMAGENES CON MULTER (datos binarios)
// en POSTMAN -> new POST url: /users/me/avatar  body->form.data  key->uploadFileName  type->file  value->(select file from PC)
// Instanciamos el objeto y definimos la ruta donde se guardaran los datos binarios
const upload = multer({
    //Al desactivar el guardado aquí, multer envía el objeto (FILE) atraves del REQ, para ser usado en el siguiente argumento del ROUTER.
    // dest: 'avatars',         // Destino de la carpeta
    limits: {
        fileSize: 1000000 //1000000 bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) { //https://regex101.com/
            // si hay un error, seteamos el CallBack con new Error
            cb(new Error('Please upload an image'))
        }
        //si todo sale bien, devolvemos el CallBack true
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // utilizamos SHARP para convertir el nuevo buffer con las propiedades por defecto que queramos.
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    // req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {       // ultimo argumento podemos MANEJAR ERRORES para que NO aparezca todo el HTML proveído por express.
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// Obtener la imagen por URL a traves de los datos binarios almacenados en el usuario
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        } else {
            //seteamos el Header de la RESPONSE para que los datos binarios enviados al cliente los parsee a IMAGEN
            res.set('Content-Type', 'image/png')
            res.send(user.avatar)
        }
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router