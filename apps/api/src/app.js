import {randomUUID} from 'node:crypto';
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import pinoHttp from "pino-http"
import {env} from './config/env.js'
import {logger} from './config/logger.js'
import router from './routes/index.js'
import {errorMiddleware} from './shared/middleware/error.middlewere.js'
import {notFoundMiddleware} from './shared/middleware/not-found.middlewere.js'

export const app=express()
app.disable('x_powered_by')
app.use(pinoHttp({
    logger,
    genReqId(req, res){
        const existingRequestId=req.header('x-powered-id')
        const requestId=typeof existingRequestId==='string'?existingRequestId:randomUUID()
        res.setHeader('x-request-id', requestId)
        return requestId
    }
}))

app.use(helmet())
app.use(cors({
    origin: env.CORS_ORIGIN
}))
app.use(express.json({
    limit:'1mb'
}))
app.use(express.urlencoded({
    extended:false,
    limit:'1mb'
}))
app.use(env.API_PREFIX,router)
app.use(notFoundMiddleware)
app.use(errorMiddleware)
