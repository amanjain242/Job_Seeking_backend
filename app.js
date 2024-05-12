import express from "express"
import dotenv from 'dotenv'
import cors from "cors"   //connects the frontend and backend
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouter.js"
import applicationRouter from "./routes/applicationRouter.js"
import jobRouter from "./routes/jobRouter.js"
import { dbConnection } from "./database/dbConnection.js"
import { errorMiddleware } from "./middlewares/error.js"
import nodemailer from "nodemailer"



const app = express();
dotenv.config({ path: './config/config.env' })

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
}))

app.use(cookieParser());  //implements authorization
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}))

app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);

dbConnection();

const transporter = nodemailer.createTransport({
    port : 587,
    secure: false, 
    service:'Gmail',
  auth: {
    user: process.env.SMTP_MAIL, 
    pass: process.env.SMTP_PASSWORD,
  },
});

// Define a route for sending emails
app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, text } = req.body;

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to,
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to the jobseeker:', info.response);
        res.send('Email sent');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});



app.use(errorMiddleware)

export default app