const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}

/*
-> const asyncHander = () => {}
-> const asyncHandler = (fun) => () => {}
-> const asyncHandler = (fun) => async () => {}
    
// The Below style is for try and catch blocks

const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req,res,next)        
    } catch (error) {
        res.status(error.code || 500).json({
            success : false,
            message : error.message
        })
    }
}

*/