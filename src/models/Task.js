const mongoose = require('mongoose')
const { model } = require('./User')

const taskSchema = new mongoose.Schema({
        description: {
            required: true,
            type: String
        },
        completed: {
            default: false,
            type: Boolean
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
}, {timestamps: true})

const Task = mongoose.model('Task', taskSchema)
 
module.exports = Task