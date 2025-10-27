import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './DB/db.js'

const app = express();
dotenv.config()
const PORT = process.env.PORT || 9000

//middlewares
app.use(express.json())
app.use(urlencoded({extended:true}))
app.use(cookieParser())
const corsOptions ={
    origin:'http:localhost:5173',
    credentials:true
}
app.use(cors(corsOptions))


app.get('/',(req,res)=>{
    res.send('ok chal gaya kam')
})

app.listen(PORT,()=>{
    connectDB()
    console.log(`server is runing on http://localhost:${PORT}`)
});