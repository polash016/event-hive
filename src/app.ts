import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import httpStatus from 'http-status'
import cookieParser from 'cookie-parser'
import session from 'express-session'
// import serverLess from 'serverless-http'
import passport from 'passport'
import router from './app/routes'
import globalErrorHandler from './app/middlewares/globalErrorHandler'
import './path/to/passport-config'

const app: Application = express()

app.use(cors({ origin: 'http://localhost:3001', credentials: true }))
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

app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    error: [{ path: req.originalUrl, message: 'Route Not Found' }],
  })
})

export default app

// export const handler = serverLess(app)
