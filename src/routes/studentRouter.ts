import { SignIn, SignUp, registerCourse, viewStudentProfile, removeCourse, updatePassword, updateProfile, deleteProfile} from '../controllers/studentController'
import { Router } from 'express'
import { Protect } from '../controllers/AuthController'
const router = Router()
router.post('/signin', SignIn)
router.post('/signup', SignUp)
router.get('/profile', Protect, viewStudentProfile)
router.patch('/add-course/:courseID', Protect, registerCourse)
router.patch('/remove-course/:courseID', Protect, removeCourse)
router.patch('/settings/update-password', Protect, updatePassword)
router.patch('/settings/update-profile', Protect, updateProfile)
router.delete('/delete-profile', Protect, deleteProfile)
export default router