import course from '../../models/course'
import { appError } from '../utils/AppError'
import db from './../../models'
import {Request, Response} from 'express'
import { filterObj } from './studentController'

const userModel = db.sequelize.models.User
const courseModel = db.sequelize.models.Course

export const viewAllCourses = async(req: Request, res:Response) => {
    try {
        let result = await courseModel.findAll()
        res.status(200).json({
            status : "Success",
            result
        })
    }catch(err) {
        appError(res, 400, err as Error)
    }
}

export const viewCourseDetails = async (req: Request, res: Response) => {
    try {
        const {courseID} = req.params
        const course = await courseModel.findOne({
            where : {
                id : courseID
            }
        })
        if(course === null) {
            throw new Error ('No course with such ID :(')
        }
        const Users = await course.getUsers({
            attributes : ['name'],
            joinTableAttributes : []
        })
        course.dataValues.users = Users
        res.status(200).json({
            status : "Success",
            data : {
                courseDetails : course
            }
        })
    }
    catch(err) {
        appError(res,400, err as Error)
    }
}

export const createCourse = async(req: Request, res: Response) => {
    try{
        const {name, tutor, classroom, Time, capacity} = req.body
        if(capacity < 10) {
            throw new Error ('The capacity must be at least 10')
        }
        let compareCourses = await courseModel.findAll()
        if(compareCourses){
            for (var i = 0; i < compareCourses.length;i++){
                if(compareCourses[i].name === name && compareCourses[i].Time === Time && compareCourses[i].tutor === tutor){
                    throw new Error(`${name} course already exists at ${Time} with ${tutor}`)
                }
                if(compareCourses[i].classroom === classroom && compareCourses[i].Time === Time){
                    throw new Error(`Classroom ${classroom} is busy at ${Time}`)
                }
                if(compareCourses[i].tutor === tutor && compareCourses[i].Time === Time){
                    throw new Error(`${tutor} has a lecture at ${Time}`)
                }
            }
        }
        const course = await courseModel.create({
            name,
            tutor,
            classroom,
            Time,
            capacity
        })
        res.status(201).json({
            status : "Success",
            course
        })
        
    }
    catch(err) {
        appError(res, 400, err as Error)
    }
}

export const addStudentToCourse = async(req: Request, res: Response) => {
    try {
        const {userID, courseID} = req.body
        if(!userID || !courseID) {
            throw new Error ('Please enter the ID of both the student and the course')
        }
        let user = await userModel.findOne({
            where : {
                id : userID
            }
        })
        if(user === null) {
            throw new Error ('No user with such ID')
        }
        let course = await courseModel.findOne({
            where : {
                id : courseID
            }
        })
        if(course === null) {
            throw new Error ('No course with such ID')
        }
        if(await user.hasCourse(course)){
            throw new Error ('This user is already enrolled in this course')
        }
        await user.addCourses(course)
        course.enrolledNum++;
        if (course.capacity < course.enrolledNum){
            course.capacity++
        } 
        await course.save()
        res.status(200).json({
            status :"Success",
            course,
            user
        })
    }
    catch(err) {
        appError(res, 400, err as Error)
    }
}

export const removeFromCourse = async(req: Request, res: Response) => {
    try {
        const {courseID, userID} = req.body
        if(!courseID || !userID) {
            throw new Error('Please enter the ID of both the user and the course you would like to remove him from')
        }
        const user = await userModel.findOne({
            where : {
                id : userID
            }
        })
        if(user === null){
            throw new Error('No user with such ID')
        }
        const course = await courseModel.findOne({
            where : {
                id : courseID
            }
        })
        if(course === null) {
            throw new Error('No course with such ID')
        }
        if(!(await user.hasCourse(course))){
            throw new Error(`${user.name} is not enrolled in ${course.name}`)
        }
        await user.removeCourse(course)
        course.enrolledNum--
        await course.save()
        res.status(200).json({
            status : "Success",
            course
        })
   }
   catch(err) {
    appError(res, 400, err as Error)
   }    
}

export const updateCourse = async(req: Request, res: Response) => {
    try{
        if(req.body.enrolledNum) {
            throw new Error ('You can add students to a course using the route /add-to-course. you can remove a student from a course using the route /remove-from-course')
        }
        const {courseID} = req.body
        if(!courseID) {
            throw new Error ('Please enter the ID of the course you would like to update')
        }
        const course = await courseModel.findOne({
            where : {
                id : courseID
            }
        })
        if(course === null){
            throw new Error('No course with such ID')
        }
        const filteredObj = filterObj(req.body, 'name', 'tutor', 'classroom', 'Time', 'capacity')
        if(Object.keys(filteredObj).length === 0) {
            throw new Error ('Enter new data in the fields you would like to update')
        }
        await courseModel.update(filteredObj, {
            where : {
                id : courseID
            }
        })
        const updatedCourse = await courseModel.findOne({
            where : {
                id : courseID
            }
        })
        res.status(200).json({
            status : "Success",
            updatedCourse
        })
    }
    catch(err) {
        appError(res,400,err as Error)
    }
}

export const deleteCourse = async (req: Request, res: Response) => {
    try{
        const {courseID} = req.body
        if (!courseID) {
            throw new Error ('Please enter the ID of the course you would like to delete')
        }
        const course = await courseModel.findOne({
            where : {
                id : courseID
            }
        })
        if(course === null) {
            throw new Error('No course with such ID')
        }
        await course.destroy()
        res.status(204).json({
            status : "Success"
        })
    }
    catch(err) {
        appError(res, 400, err as Error)
    }
    

}