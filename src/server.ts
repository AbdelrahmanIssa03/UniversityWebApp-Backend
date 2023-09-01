import db from '../models'
import {app} from './app'


db.sequelize.sync({ alter : true }).then(() => {
    app.listen(process.env.PORT, ()=> {
        console.log(`Listening to port ${process.env.PORT}...`)
    })
}).catch((err :any) => {
    console.log(`There was an error connecting to the database :(`)
    console.log(`${err}`)
})

