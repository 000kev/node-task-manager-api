const express = require('express')
require('./db/mongoose')

const user_router = require('./routers/user')
const task_router = require('./routers/task')

const app = express()
const port = process.env.PORT 

const multer = require('multer')

// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req,file,cb) {
//         // cb(new Error('File must be a PDF'))
//         // cb(undefined, true)
//         // cb(undefined, false)
//         if (!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error('Please upload a word document'))
//         }
//         cb(undefined, true)
//     }
// })

// app.post('/upload', upload.single('upload'), (req,res) => {
//     res.send()
// })


app.use(express.json())
app.use(user_router)
app.use(task_router)


app.listen(port, () => {
    console.log('Server is up on port '+port)
})

