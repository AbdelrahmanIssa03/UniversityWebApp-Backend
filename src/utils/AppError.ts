import express from 'express'
export const appError = (res:express.Response, errorCode:number, error: Error) => {
    if(error.name === 'SequelizeUniqueConstraintError'){
        res.status(errorCode).json({
            status : "Failure",
            error : `This username has already been taken`
        })
    }
    else {
        res.status(errorCode).json({
            status : "Failure",
            error : `${error.message}`
        })
    }
}