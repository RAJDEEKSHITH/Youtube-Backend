/*
STEP 1: DEFINE THE HELPER FUNCTION
We define a function called `asyncHandler`.
It accepts one argument, which we will call `requestHandler`.
This `requestHandler` will be our actual logic (like the `registerUser` logic, but WITHOUT the try/catch).
*/
const asyncHandler = (requestHandler) => {

    /*
    STEP 2: RETURN A NEW FUNCTION
    This helper function immediately returns a different, new function.
    This new function is what we will actually give to Express.
    Notice its arguments are `(req, res, next)`. This is the format Express always expects for a route handler.
    */
    return (req, res, next) => {
        
        /*
        STEP 3: EXECUTE THE LOGIC WITH ERROR HANDLING
        This is where our single `try/catch` logic lives.
        `Promise.resolve().catch()` is just a modern way to write a try/catch for asynchronous code.

        It means: "Try to execute the code inside `resolve()`. If anything goes wrong, the `catch()` block will automatically run."
        */
        Promise.resolve(
            
            // This is the code it will "try":
            // It calls the original function (`registerUser` or `loginUser`) that was passed in.
            // It also passes along the `req`, `res`, and `next` objects that it received from Express.
            requestHandler(req, res, next)

        ).catch((err) => {

            // This is the code that runs if an error happens:
            // It takes the error (`err`) and sends it to Express's final error middleware.
            next(err)

        });
    }
}

export { asyncHandler }

/*
    
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