const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account')
const multer = require('multer')
const sharp = require('sharp')


const router = new express.Router
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image!'))
        }
        cb(undefined, true)
    }
})

router.get('/users/me', auth, async (req,res) => {
    res.status(201).send(req.user)
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(404).send()
    }
})

router.get('/users', async (request, response) => {
    // User.find({}).then((users) => {
    //     return res.status(201).send(users)
    // }).catch((error) =>{
    //     return res.status(500)
    // })
    try {
        const users = await User.find({})
        response.status(201).send(users)
    } catch (error) {
        response.status(400).send()
    }
})
router.post('/users', async (request, response) => {
    console.log(request.body)

    const user = new User(request.body)
    

    // user.save().then(() => {
    //     return response.send(user)
    // }).catch((error) => {
    //     return response.status(400).send(error)
    // })
    try {
        await user.save()
        const token = await user.generateAuthToken()

        sendWelcomeEmail(user.email, user.name)
        response.status(201).send({user, token})
    } catch (e) {
        response.status(400).send(e)
    }
})


router.post('/users/me/avatar', auth, upload.single('upload'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize(
        {width: 300, height: 400}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()

    try {
        res.status(200).send()
    } catch(e) {
        res.status(500).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
        res.send({user, token})
    } catch(e) {
        res.status(400).send() 
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token!==req.token
        })
        await req.user.save()
        res.status(200).send()
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})


router.delete('/users/me', auth, async (req, res) => {

    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) return res.status(404).send()
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
})


router.patch('/users/me',auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const  isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({'error': 'Invalid updates'})
    }

    try {
        //const user = await User.findByIdAndUpdate(id, req.body, {new: true, runValidators: true})
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        if (!user) return res.status(404).send()
        res.status(200).send(user)

    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router