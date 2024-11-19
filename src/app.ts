/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import httpStatus from 'http-status'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import router from './app/routes'
import globalErrorHandler from './app/middlewares/globalErrorHandler'
import './path/to/passport-config'

const app: Application = express()

app.use(
  cors({ origin: 'https://event-hive-client.vercel.app', credentials: true }),
)

// app.use(cors({ origin: 'http://localhost:3001', credentials: true }))

// const allowedOrigins = [
//   'https://event-hive-client.vercel.app',
//   'http://localhost:3001', // Include localhost for development
// ]

// const corsOptions = {
//   origin: function (origin: any, callback: any) {
//     if (!origin) return callback(null, true) // Allow requests with no origin (like mobile apps)

//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200,
// }

// app.use(cors(corsOptions))

app.use(cookieParser())

app.use(
  session({
    secret: 'event_hive_secret_key',
    resave: false,
    saveUninitialized: true,
  }),
)
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req: Request, res: Response) => {
  res.send({
    message: 'Health Care Server',
  })
})

app.use('/api/v1', router)

app.use(globalErrorHandler)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    error: [{ path: req.originalUrl, message: 'Route Not Found' }],
  })
})

export default app
