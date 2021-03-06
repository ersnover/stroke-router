const express = require('express')
const app = express()
const cors = require('cors')
var mongoose = require('mongoose')
require('dotenv').config()

const hospitalModels = require('./models/hospital')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//routes
const userRouter = require('./routes/userRoute')
app.use('/u', userRouter)

const patientRouter = require('./routes/patientRoute')
app.use('/patient', patientRouter)

// middleware
const authenticate = require('./middleware/authMiddleware')
app.all('/*/ems', authenticate.ems)
// app.all('/ed/*', authenticate.ed)

const PORT = process.env.PORT || 8080
//might have to make global
const MONGO_USERNAME = process.env.MONGO_USERNAME
//might have to make global
const MONGO_PASSWORD = process.env.MONGO_PASSWORD
const MONGO_DATABASE = process.env.MONGO_DATABASE
// const MONGO_DATABASE = 'test'

mongoose.connect(`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@stroke-router-bpxfz.gcp.mongodb.net/${MONGO_DATABASE}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true}, (error) => {
    if(!error) {
        console.log('Successfully connected to MongoDB database')
    }
})

const searchRadius = 30
const milesToRadians = miles => {
    return miles / 3959
}

app.get('/', (req, res) => {
    res.send('test')
})

app.get('/hospital', (req,res) => {
    

    let coords = [req.query.lng, req.query.lat]

    let query = {
        'loc': {
            $geoWithin: {
                $centerSphere: [coords, milesToRadians(searchRadius)]
            }
        }
    }
    
    hospitalModels.Hospital.find(query, (error, hospitals) => {
        error ? res.json({error: error}) : res.json({hospitals: hospitals})
    })
})

app.patch('/hospital', (req,res) => {
    let hospitalId = req.body.hospitalId
    let lat = req.body.lat
    let lng = req.body.lng

    hospitalModels.Hospital.findByIdAndUpdate(hospitalId, {
        loc: {
            type: 'Point',
            coordinates: [lng, lat]
        }
    }, (error, result) => {
        error ? res.json({error: error}) : res.json({result: result})
    })
})


app.listen(PORT, () => {
    console.log("Server is running...")
})