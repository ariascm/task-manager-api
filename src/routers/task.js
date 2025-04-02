const express = require('express')
const router = express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')
const { ObjectId } = require('mongodb')

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        // (...) spread function, copiamos las propiedades del body {description, completed} y agregamos owner
        ...req.body,
        owner: req.user._id
    })

    if (typeof req.body.description !== 'string') {
        return res.status(400).send({ error: 'Description must be a string' });
    }

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send()
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=30&skip=10
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    // ¡¡¡¡ HOW TO FILTER DATA !!!!!
    // match es una propiedad de tipo objeto de populate donde agregamos que campos queremos filtrar en la consulta
    const match = {}
    const sort = {}

    //ejemplo {sort: { createdAt: -1}}   // 1 -> ASC   //   -1 -> DESC

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }


    if (req.query.completed) {
        // req.query.completed es string, la propiedad match.completed recibe boolean. Entonces agregamos la sintaxis de comparación
        match.completed = req.query.completed === 'true'    // si completed (string) === 'true'? devuelve true (boolean)
    }

    try {
        // Dos formas diferentes: Buscar las Task que contengan el owner(user) ó con el mismo user traido del req popular las tasks (virtual)
        // const tasks = await Task.find({ 'owner': req.user._id })
        // await req.user.populate('tasks')     // lo cambiamos por un objeto para poder meter propiedades para FILTRAR en la BD
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit) || null,
                skip: parseInt(req.query.skip) || null,
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        // console.log(e)
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, 'owner': req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    if (!ObjectId.isValid(_id)) {
        return res.status(400).send({ error: 'Id is not valid' })
    }
    // convert from Object to an array with properties the BODY from the REQUEST
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update field' })
    }

    try {

        // const task = await Task.findById(_id)        // Cambiado para aprovechar AUTH y las relaciones entre los documents
        const task = await Task.findOne({ _id, 'owner': req.user._id })
        // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })  //eliminado para usar Middleware
        if (!task) {
            return res.status(404).send('ID not found')
        }

        updates.forEach(update => task[update] = req.body[update]);

        await task.save()
        res.send(task)

    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    if (!ObjectId.isValid(_id)) {
        return res.status(404).send()
    }

    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router