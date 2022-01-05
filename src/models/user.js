const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minLength: 7,
      //      maxLength:16,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('password cannot contain "password" ')
                }
            }
        },
        email: {
            type: String,
            unique: true, //no one will be able to use the same password twice
            required: true,
            trim: true,
            lowercase: true,
            validate(value) { // ES6 definition syntax
                if (!validator.isEmail(value)) {
                    throw new Error('Email is innvalid')
                }
            }
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be a +ve Number')
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
        avatar: {
            type: Buffer // for files upload
        }
    }, {
        timestamps: true
    }
)

//Virtual allows us to set virtual attributes 
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// i need to crossCHECK HERE
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token: token })
    await user.save()

    return token
}

userSchema.methods.toJSON = function () { //Standard Regular Function
    const user = this // this makes our code easier to work with
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findByOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// pre is before and post is after
userSchema.pre('save', async function (next) {//HASH THE PLAIN TEXT PASSWORD BEFORE SAVING 
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next() //always call next in middleware so that it won't run 4ever
})

//DELETE USER TASKS WHEN USER IS REMOVED
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)


module.exports = User