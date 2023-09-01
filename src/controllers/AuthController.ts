import { jwtVerifyPro } from "../utils/jwtVerifyPromise";
import { Request ,Response, NextFunction} from 'express'
import { appError } from "../utils/AppError";
import db from './../../models'

const userModel = db.sequelize.models.User

export const Protect = async (req: Request, res:Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')){
            throw new Error ('You must be sign in to access this feature')
        }
        const token = req.headers.authorization.split(' ')[1]
        const decoded = await jwtVerifyPro(token, process.env.JWT_SECRET)
        let currentUser = await userModel.findOne({
            where : {
                id : decoded.id
            }
        })
        if(currentUser === null) {
            throw new Error ('The user no longer exists')
        }
        if(currentUser.passwordChangedAt !== null){
            const time = currentUser.passwordChangedAt.getTime()/1000;
            if(time > decoded.iat){
                throw new Error ('Password has been changed please re log-in')
            }
        }
        req.user = currentUser
        next();
    }
    catch (err) {
        appError(res, 401, err as Error)
    }
}

export const adminProtect = (req: Request, res: Response, next: NextFunction) => {
    
}