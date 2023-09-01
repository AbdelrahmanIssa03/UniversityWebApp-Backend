import express from 'express'
import jwt from 'jsonwebtoken'
import { appError } from '../utils/AppError'
import db from '../../models'
import { checkPassword } from '../utils/hashing'
const cookieOptions : any = {
    expires : new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 60 * 1000),
    httpOnly : true,
    secure : true
}

const userModel = db.sequelize.models.User
const courseModel = db.sequelize.models.Course

const filterObj = (object:any, ...chosenFields: string[]): object => {
    let newObj : any = {}
    for(const key in object){
        if(chosenFields.includes(key)){
            newObj[key] = object[key]
        }
    }
    return newObj
}

export const SignUp = async (req: express.Request, res:express.Response) => {
    try {
        const {name, dateOfBirth, password, Courses} = req.body
        if(!name || !dateOfBirth || !password) {
            throw new Error ('Please fill out all the required fields')
        }
        let User = (await userModel.create({
            name,
            dateOfBirth,
            password,
            Courses
        })).toJSON()
        const token = jwt.sign({id : User.id}, process.env.JWT_SECRET!, {expiresIn : `${process.env.JWT_EXPIRES_IN}`})
        res.cookie('jwt', token, cookieOptions)
        res.status(201).json({
            status : "Success",
            token,
            User
        })
    }
    catch(err) {
        appError(res, 400, err as Error)
    }
    
}
export const SignIn = async (req: express.Request, res:express.Response) => {
    try {
        if(!req.body.id || !req.body.password){
            throw new Error('Please enter both your id and password')
        }
        let User = await userModel.findOne({
            where : {
                id : req.body.id,
            }
        })
        if(User === null) {
            throw Error ('Incorrect Credentials')
        }     
        User = User.toJSON()
        if(!await checkPassword(req.body.password, User.password)){
            throw Error ('Incorrent Credentials')
        } 
        const token = jwt.sign({id : User.id}, process.env.JWT_SECRET!, {expiresIn : `${process.env.JWT_EXPIRES_IN}`})
        res.cookie('jwt', token, cookieOptions)
        res.status(200).json({
            status : 'Success',
            token,
            data : User
        })
    }catch(err) {
        appError(res, 400, err as Error)
    }
}

export const viewStudentProfile = async (req: express.Request, res: express.Response) => {
    try {
        let {id, name, dateOfBirth} = req.user
        let courses = await req.user.getCourses()
        courses = courses.map((course:any) => {
            course = course.dataValues
            course.StudentCoursesJunc = undefined
            return course
        })
        res.status(200).json({
            status : "Success",
            data : {
                id,
                name,
                dateOfBirth,
                courses
            }
        })
    }
    catch(err){
        appError(res, 400, err as Error)
    }
}

export const registerCourse = async(req:express.Request, res:express.Response) => {
    try {
        let {courseID} = req.params
        if(!courseID){
            throw new Error ('Please enter the ID of the course you would like to enrol in')
        }
        let course = await courseModel.findOne({
            where : {
                id : courseID
            }
        })
        if(course === null ){
            throw new Error ('No course with such ID :(')
        }
        if(await req.user.hasCourse(course)){
            throw new Error ('You are already registered in this course')
        }
        if(course.enrolledNum === course.capacity) {
            throw new Error ('This section is full')
        }
        await req.user.addCourses(course)
        let courses = await req.user.getCourses()
        courses = courses.map((course:any) => {
            course = course.dataValues
            course.StudentCoursesJunc = undefined
            return course
        })
        course.enrolledNum++;
        await course.save();
        res.status(200).json({
            status : "Success",
            message : `You have successfully been enrolled in (courseName)`,
            course,
            data : {
                courses
            }
        })

    }
    catch(err) {
        appError(res, 400, err as Error)
    }
}

export const removeCourse = async(req: express.Request, res: express.Response) => {
    try {
        const {courseID} = req.params
        const course = await courseModel.findOne({
            where : {
                id : courseID
            }
        })
        if(course === null) {
            throw new Error ('There is no course with such ID')
        }
        if(!(await req.user.hasCourse(course))){
            throw new Error ('You can\'t remove a course you aren\'t enrolled in')
        }
        await req.user.removeCourse(course)
        course.enrolledNum--;
        await course.save();
        res.status(204).json({
            status : "Success"
        })
    }
    catch(err) {
        appError(res, 400, err as Error)
    }
}

export const updatePassword = async(req: express.Request, res: express.Response) => {
    try {
        const {currentPassword, newPassword, confirmNewPassword} = req.body
        if(!currentPassword || !newPassword || !confirmNewPassword) {
            throw new Error('Please fill out all the fields')
        }
        if(!(await checkPassword(currentPassword, req.user.password))){
            throw new Error('Incorrent Current Password')
        }
        if(newPassword !== confirmNewPassword) {
            throw new Error('Passwords don\'t match')
        }
        await userModel.update({password : newPassword, passwordChangedAt : Date.now()}, {
            where : {
                id : req.user.id
            },
            individualHooks : true
        })
        res.status(200).json({
            status : "Success",
            message : "Password successfully changed"
        })
    }
    catch(err) {
        appError(res, 400, err as Error)
    }
}

export const updateProfile = async(req: express.Request, res: express.Response) => {
    try {
        if(req.body.password) {
            throw new Error('this route is not for password updates. Please use /settings/update-password route')
        }
        const filteredObj:object = filterObj(req.body, "name", "dateOfBirth")
        if(Object.keys(filteredObj).length === 0) {
            throw new Error ('Enter new data in the fields you would like to update')
        }
        await userModel.update(filteredObj, {
            returning : true,
            where : {
                id : req.user.id
            }
       })
       const updatedUser = await userModel.findOne({
        where : {
            id : req.user.id
        }
       })
        res.status(200).json({
            status : "Success",
            updatedUser
        })
    }catch(err) {
        appError(res, 400, err as Error)
    }
}

export const deleteProfile = async(req: express.Request, res: express.Response) => {
    try {
        let courses = await req.user.getCourses();
        courses = courses.map((course:any) => {
            course = course.dataValues
            return course
        })
        for (let i = 0; i < courses.length; i++) {
            await courseModel.increment({enrolledNum : -1}, {
                where : {
                    id : courses[i].id
                }
            })
        }
        await userModel.destroy({
            where : {
                id : req.user.id
            }
        })
        res.status(204).json({
            status : "Success"
        })
    }
    catch (err) {
        appError(res, 400, err as Error)
    }
}