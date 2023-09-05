import express from 'express'
export const appError = (res:express.Response, errorCode:number, error: Error) => {
    if(error.name === 'SequelizeUniqueConstraintError'){
        res.status(errorCode).json({
            status : "Failure",
            error : `This username has already been taken`
        })
    }
    else if (error.name === 'SequelizeValidationError'){
        res.status(errorCode).json({
            status : "Failure",
            error : error.message.replace(/notNull Violation: /g, ' ').replace(/,\n /g, ' | ').replace(/\./g, ' ')
        })
    }
    else {
        res.status(errorCode).json({
            status : "Failure",
            error : `${error.message}`
        })
    }
}