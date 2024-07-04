const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const Task = require('./task')


// DATA SANITIZED Adding TRIM, DEFAULT and LOWERCASE validations. https://mongoosejs.com/docs/schematypes.html
// Para aprovechar el MIDDLEWARE de Mongoose que se ejecuta PRE o POST al envio de los objetos por HTTP, Usamos los SCHEMAS()
// mongoose automaticamente "detras de escena" crea los schemas si aun no lo hacemos nostros antes de que se haga el SAVE() a Mongo.
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        // unique create an index in the database Mongo para garantizar que sea UNICO. (Drop database para que funcione si existieran datos)
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password must not contain password word!');
            }
        }
    },
    // generamos un array de objetos, que tendrá tokens para los distintos inico de sesión del usuario (notebook, telefono) y asi poder
    // administrarlos, caducarlos, etc.
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar:
    {
        type: Buffer        // para almacenar los datos binarios de la imagen. Multer manejar los errores
    }
}, { // se agregan como tercer argumento al SCHEMA, DB -> createdAt / updatedAt
    timestamps: true
})
// VIRTUALS -> para crear relaciones entre tablas, sin tener que crear fisicamente la relacion en la BD.
// en el document TASK esta creado fisicamente el campo "owner" quien tiene el ID del user (N a 1 / TASK a USER)
// en esta relacion (1 a N / USER a TASK) Para navegar del USER a las TASK's sin tener que crear la relacion en la BD, usamos el VIRTUAL.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// STATICS methods son accesibles en los modelos. --> User.myStaticMethod()
// METHODS methods son accesibles en las INSTANCIAS de los modelos. --> const user = new User --> user.myMethod()

// Creamos una nueva funcion, para luego poder utilizarla en el router de TASK
userSchema.statics.findByCredentials = async (email, password) => {

    // buscamos si existe el usuario
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }

    // comparamos el password ingresado con el almacenado en la base de datos (la funcion aplica hash al primer paramtro para compararlos)
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// 1. Just as what the lecturer said, when we run res.send(obj), Express will automatically run JSON.stringify(obj) for you.
// 2. Remember, as Adam said, "every object comes with a .toJSON method". When you run JSON.stringify(obj), .toJSON() is used to do the stringifying. This is as proven by the lecturer's pet example.
// 3. We can override (overwrite / replace) this in-built .toJSON method with our own custom method to behave the way we want. In our app, this means to delete the password and tokens properties.
// 4. In summary: when we run our code res.send(obj), it will automatically run JSON.stringify(obj), which in turns uses obj.toJSON() to convert it into JSON, but as we have customised the method, it will also remove the password and tokens.

userSchema.methods.toJSON = function () {
    const user = this
    // convertimos a (POJO Plain Old Java Object) la instancia de mongoose.document para limpiar muchos metodos que mongoose agrega automaticamente
    const userObject = user.toObject()
    // QUITAMOS las PROPIEDADES que NO queremos que sean visibles en la RESPUESTA al cliente.
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {

    const user = this
    // Aplicamos _id.toString() ya que el _id devuelto por Mongo es un "ObjectId" y queremos el String.
    // jwt.sign() -> crea un nuevo token
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    // Concatenamos el objeto { token: token} a el array de TOKENS de la instancia del user y lo guardamos.
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// MIDDLEWARE funciones PRE Y POST al guardado SAVE(). Se debe utilizar funciones ESTANDAR, ya que las funciones FLECHA evitan el uso
// del bindeo THIS (aqui utilizado para tener acceso al Documento (en esta caso User) que será enviado por http antes de ser guardado)
userSchema.pre('save', async function (next) {

    const user = this
    // isModified() return TRUE si al hacer user.save() tiene modificacion en el campo "password" la instancia de "user", sino false.
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }


    // invocando next(), el programa continua con la ejecucion, sino se quedaria el Middleware "colgado" sin ejecturar el SAVE()
    next()
})

// Al eliminarse el user, se eliminan todas las tareas asociadas a el (owner id)
userSchema.pre('deleteOne', { document: true }, async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

// moongoose.model acepta como segundo parametro o bien el objecto User en este caso (y luego lo convierte automaticamente a schema) Ó
// le mandamos el schema y aprovechamos el middleware
const User = mongoose.model('User', userSchema)

module.exports = User