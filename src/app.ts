import express from 'express'
import bodyParser from 'body-parser';
import studentRouter from './routes/studentRouter'
import courseRouter from './routes/courseRouter'
import morgan from 'morgan'

const app = express();
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
app.use(express.json())
app.use(bodyParser.urlencoded({ extended : true}))
app.use('/api/v1/student',studentRouter)
app.use('/api/v1/courses',courseRouter)

export {app}