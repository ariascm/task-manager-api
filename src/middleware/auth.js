const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { ObjectId } = require('mongodb')
const mongoose = require('mongoose');

const auth = (async (req, res, next) => {


    try {
        // quitamos "Bearer " del token "Bearer xxxxxxxxx.xxxxxxxxxx.xxxxxxxx" que agregamos previamente al HEADER como "Authorization"  
        const token = req.header('Authorization').replace('Bearer ', '')

        // jwt.sign() CREA el token y lo devuelve. jwt.verifiy() verifica que exista y devuelve el objeto {_id: xxxx.xxxxx.xxx, iat: xxxxxx}
        // verify parametros: token, '(palabra de seguridad)' -> la misma usada con jwt.sign()
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // bucar usuario con el ID y el token especifico en el array user.tokens.token. (lleva comilla simple para buscar la key tokens.token)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        // console.log(user)
        if (!user) {
            throw new Error()
        }
        // guardamos el user dentro de req.xxxx -> para poder accesarlo luego desde la REQUEST cuando "auth" este OK.
        req.user = user
        // tambien guardamos el token para luego usarlo en "users/logout"
        req.token = token

        next()
    } catch (e) {
        // console.log(e)
        res.status(401).send({ error: 'Please authenticate' })
    }

})

module.exports = auth