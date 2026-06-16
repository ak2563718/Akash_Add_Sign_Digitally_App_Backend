import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet'
import user from './routes/user.Routes.js'
import file from './routes/file.Routes.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(cors({
    origin:[process.env.LOCALHOST_URL,'http://192.168.155.104:3000',process.env.FRONTEND_URL],
    credentials:true,
}))
app.use(cookieParser());
app.use(helmet())

app.use('/api/auth',user)
app.use('/api/doc',file)
app.use(errorMiddleware);
const port = process.env.PORT;

app.listen(port,()=>{
    console.log(`server is running at port ${port}`)
})