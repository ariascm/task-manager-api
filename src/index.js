const app = require('./app')

// Utilizará el puerto proveído por la app de Produccion (Heroku, Render), si no encuentra nada usa el 3000 que es para desa en LOCALHOST
const port = process.env.PORT

app.listen(port, () => {
    console.log("Server is up on port " + port)
})


// // MULTER, para procesar archivos (pdf, jpg, png, jpeg, doc)
// const multer = require('multer')
// const upload = multer({
//     // Se puede setear una carpeta por defecto, o no setear nada y multer envia el objeto FILE através del REQ
//     dest: 'images',
//     limits: {
//         fileSize: 1000000 // (bytes) -> 1Millon bytes === 1MB
//     },
//     fileFilter(req, file, cb) {

//         // if (!file.originalname.endsWith('.pdf')) {
//         if (!file.originalname.match(/\.(doc|docx)$/)) {    //https://regex101.com/
//             // si hay un error, seteamos el CallBack con new Error
//             return cb(new Error('Please upload a Word document'))
//         }
//         //si todo sale bien, devolvemos el CallBack true
//         cb(undefined, true)
//     }
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(200).send({ error: error.message })
// })



// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('6673417ffed0fe9f6fa7054b')
//     // await task.populate('owner')
//     // console.log(task.owner)

//     const user = await User.findById('66734174fed0fe9f6fa70543')
//     console.log({ user })
//     await user.populate('tasks')
//     console.log(user.tasks)
// }

// main()