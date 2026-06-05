import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true,
}))
app.use(cookieParser());

const port = process.env.PORT;

app.listen(port,()=>{
    console.log(`server is running at port ${port}`)
})