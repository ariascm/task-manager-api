const mongoose = require('mongoose')

// en ./config/dev.env SETEMOS el valor por defecto para todas las KEYS que queremos ocultar y NO enviarlas a través de GIT
mongoose.connect(process.env.MONGODB_URL)




// const firstTask = new Task({
//     description: '      Pot plants     '
// })

// firstTask.save().then(() => {
//     console.log(firstTask)
// }).catch((error) => {
//     console.log(error)
// }).finally(() => {
//     mongoose.connection.close()
// })