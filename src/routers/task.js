const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()



router.post('/tasks', auth, async (req, res) => { // this is the router responsible for creating the task
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,  //this is ES6 spread operator
        owner: req.user._id
    })

    try {
        task.save()
          res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }

    // task.save().then(() => {
    //     res.status(201).send(task)

    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

// GET /tasks?completed=false
// GET /tasks?limit=10&skip=20
// GET /tasks?sortedBy=createdAt:asc(or _asc) or _desc(:desc) =>(ascending or descending)
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortedBy) {
        const parts = req.query.sortedBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id })
        // res.send(tasks) or
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limits: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
//                 sort: {
//                     createdAt: 1 // 1 is ascending and descending is -1
// //                    completed: 1
//                 }
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) { 
        res.status(500).send()
    }

    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((error) => {
    //     res.status(500).send()
    // })
})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id

    try{
      //  const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
       
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }

   // Task.findById(_id).then((task) => {
    //     if (!task) {
    //         return res.status(404).send()
    //     }

    //     res.send(task)
    // }).catch((error) => {
    //     res.status(500).send()
    // })
 })

 router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(404).send({ error: 'Invalid updates!' })
    }

    try {//Criteria for searching is by ID and OWNER
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id }) //for updating only our task and not someone else's task'
//        const task = await Task.findById(req.params.id)


        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(404).send(error)
    }
})



router.delete('/tasks/:id', auth, async (req, res) => {
    try{
//        const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findByOneAndDelete({ _id: req.params.id, owner: req.user._id}) //AUTHENTICATION

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})


module.exports = router 