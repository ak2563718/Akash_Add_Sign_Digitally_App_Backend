import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import user from './routes/user.Routes.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(cors({
    origin:['http://localhost:3000','http://192.168.155.104:3000'],
    credentials:true,
}))
app.use(cookieParser());

app.use('/api/auth',user)
app.use(errorMiddleware);
const port = process.env.PORT;

app.listen(port,()=>{
    console.log(`server is running at port ${port}`)
})