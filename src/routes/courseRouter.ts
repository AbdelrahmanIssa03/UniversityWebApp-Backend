import { Router } from "express";
import {Protect, adminProtect} from './../controllers/AuthController'
import { addStudentToCourse, createCourse, viewAllCourses, viewCourseDetails, updateCourse, removeFromCourse, deleteCourse } from "../controllers/courseController";
const router = Router()
router.get('/', Protect, viewAllCourses)
router.get('/:courseID', Protect, viewCourseDetails)
router.post('/create-a-course', Protect, adminProtect, createCourse)
router.patch('/add-to-course', Protect, adminProtect, addStudentToCourse)
router.patch('/remove-from-course', Protect, adminProtect, removeFromCourse)
router.patch('/update-course', Protect, adminProtect, updateCourse)
router.delete('/delete-course', Protect, adminProtect, deleteCourse)
export default router