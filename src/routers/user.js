const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, cancelationMail } = require('../emails/account')
const router = new express.Router()

router.post('/users', async (req, res) => { //Signup
    const user = new User(req.body)

    // Async await
    try {
        await user.save() 
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token }) //user.getPublicProfile()
    } catch (error) {
        res.status(400).send()
    }   
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// router.get('/users/me', auth, async (req, res) => {
//     res.send(req.user)
//     // try {
//     //     const users = await User.find({})
//     //         res.send(users)
//     // } catch (error) {
//     //     res.status(500).send()
//     // }
// })
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})




 
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((updates) => allowedUpdates.includes(updates))

    if (!isValidOperation) {
        return res.status(404).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) =>  req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => { // AUTH: it will make it run only if the user is authenticated

    try {
        // const user = await User.findByIdAndDelete(req.user._id) // _id is for the /me : user1 wont delete user2 posts

        // if (!user) {
        //     return res.status(404).send()
        // } // ONE LINE BELOW REPLACED THE LINES ABOVE

        await req.user.remove() // Mongodb method is that REMOVE
        cancelationMail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})


const upload = multer({ 
    // no need of destination again bcos its already saved in models
//    dest: 'avatars',   //dest is short word for destination
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
 
        cb(undefined, true)
    }
})

//POST HTTP METHOD  .single is multer middleware
// 1) PATH 2) AUTHENTICATION, 3) VALIDATION, and upload 4) SUCCESS MESSAGE
router.post('/users/me/avatar', auth, upload.single('avatar' /* this avatar is what will be in postman "KEY" */), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer //contains a buffer of all the binary data for that files 
    await req.user.save()
    res.send()
}, (error, req, res, next) => { // ERROR HANDLING
    res.status(400).send({ error: error.message })
})  

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined 
    await req.user.save()
    res.send() 
})  

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})



module.exports = router

//Bearer $2a$08$CXX6jjE0MXkBRxCdEKJBOuC7Fozoj2ZFQsOYk1DIL.ynUOQfznejG
//  "$2a$08$CXX6jjE0MXkBRxCdEKJBOuC7Fozoj2ZFQsOYk1DIL.ynUOQfznejG"

