const mongoose = require('mongoose')
//const validator = require('validator')

// THIS MAKES SURE THAT MONGOOSE CONNECT TO THE DATABASE
mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api'/*process.env.MONGODB_URL*/, {
    useNewUrlParser: true,
 //   useCreateIndex: true
 //   useFindAndModify: false
})



// TO BE DELETED
// const me = new User({
//     name: '   Aphomer    ',
//     email: '     Aphomer@gmail.com  ',
//     password: 'PeopleofGod     ',
//     age: 20
// })

// //__.save is method use for saving files in mongoose database
// me.save().then(() => {
//         console.log(me)
//     }).catch((error) => {
//         console.log('Error!', error)
//     })


// TO BE DELETED
// const files = new Task({
//     description: "tall and dark",
// //    completed: true
// })

// files.save().then(() => {
//     console.log(files)
// }).catch((error) => {
//     console.log('Error!', error)
// })



//   /users/user/desktop/coded/mongodbzip/bin/mongod.exe --dbpath=/users/user/desktop/coded/mongodb-data
 

