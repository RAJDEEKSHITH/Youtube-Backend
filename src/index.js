import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({path : './.env'})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, ()=> console.log(`Server is running on port : ${process.env.PORT}`))
})
.catch((err) => {
    console.log("MongoDb Connection Failed! : ",err);
})






















/* This is one approach

import express from express;
const app = express();
(async() => { // NOTE : always use ";" before this IFE sometimes above lines if they ";" then it will be problem.
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("Errror",(errror) => {
            console.log("ERRROR : ", errror)
            throw errror
        })
    } catch(error) {
        console.error("Error : ", error);
        throw error
    }
}) ()

*/