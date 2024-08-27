import dotenv from "dotenv"
import mongoose from "mongoose"
import connectDb from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path:"./env"
})

connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port : http://localhost:${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("mongoDb error in src/index",error);
})






/*
;(async() => {
    try {
        mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        App.on("error",(error) => {
            console.log("error",error);
            throw error
        })
        App.listen(process.env.PORT, () => {
            console.log(`App is lidtening on this port${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Error:",error)
        throw error
    }
})()
    */