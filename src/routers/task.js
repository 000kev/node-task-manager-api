const express = require('express')
const Task = require('../models/Task')
const auth = require('../middleware/auth')

const router = new express.Router


router.post('/tasks', auth, async (request, response) => {
    //const task = new Task(request.body)

    // task.save().then(() => {
    //     return response.status(201).send(task)
    // }).catch((error) => {
    //     return response.status(400).send(error)
    // })
    const task = new Task({
        ...request.body,
        owner: request.user._id
    })
    try {
        await task.save()
        return response.status(201).send(task)
    } catch (e) {
        response.status(400).send()
    }
})

router.get('/tasks', auth, async (request, response) => {
    // Task.find({}).then((tasks) => {
    //     return res.status(201).send(tasks)
    // }).catch((error) => {
    //     return res.status(500).send()
    // })
    const match = {}
    const sort = {}

    if (request.query.completed) match.completed = request.query.completed === 'true'
    if (request.query.sortBy) {
        const parts = req.query.sortBy.split('-')
        sort[parts[0]] = parts[1]==='desc' ? -1 : 1
    }
    try {
        const user = request.user
        await user.populate({path: 'tasks',
         match,
        options: {
            limit: parseInt(req.query.limit),
            skip: pareseInt(req.query.skip)
        }}).execPopulate()

        response.status(200).send(user.tasks)
    } catch (e) {
        response.status(500).send()
    }

})

router.get('/tasks/:id', auth, async (request, response) =>{
   

    // Task.findById(id).then((task) => {
    //     if (!task) return res.status(404).send()
    //     else return res.status(201).send(task)
    // }).catch((error) => {
    //     return res.status(500).send()
    // })
    try {
       //const task = await Task.findById(id)
        const task = await Task.findOne({_id: request.params.id, owner: request.user._id})
        if (!task) throw new Error()

        response.status(200).send(task)
    } catch (e) {
        response.status(400).send('Error! Task not found')
    } 
})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) return res.status(400).send({'error': 'Invalid updates'})
    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) return res.status(400).send()

        updates.forEach((update) => task[update]=req.body[update])
        await task.save()

        res.status(201).send(task)
    } catch (e) {
        res.status(404).send(e)
    }
})


router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task) return res.status(404).send()
        res.status(200).send(task)
    } catch (e) {
        res.status(404).send(e)
    }
})

module.exports = router