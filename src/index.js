const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000
 
// make sure MIDDLEWARE is above app.use..... TO BE DELETED
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })
    
    // app.use((req, res, next) => { // Middleware that runs for every single route handler  ............
    //     res.status(503).send('Site is currently down. Check back soon')
    // }) // if you are trying to update onsite........

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('Server is up on  port ' + port)
});





