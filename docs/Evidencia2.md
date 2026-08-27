# app.js
``` js
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

```
# server.js
``` js
import {app} from './app.js';
import {env} from './config/env.js';
import { logger } from './config/logger.js';

const server=app.listen(env.PORT,()=>{
    logger.info({
        port:env.PORT,
        enviroment: env.NODE_ENV
    },`Proyecto NodeJS running:${env.PORT}`)
})

let shuttingDown=false
function shutdown(signal){
    if(shuttingDown){
        return
    }
    shuttingDown=true
    logger.info({
        signal
    },'Inicia proceso de apagado')

    server.close((error)=>{
        if(error){
            logger.error({
                err:error
            },'error cuando se apagaba el servidor')
            process.exit(1)
        }
        logger.info('Servidor HTTP cerrado')
        process.exit(0)
    })

    setTimeout(()=>{
        logger.error('Forzado a apagar despues de cierto tiempo')
        process.exit(1)
    },1000).unref()
}

process.on('SIGINT',()=>{
    shutdown('SIGINT')
})
process.on('SIGTERM',()=>{
    shutdown('SIGTERM')
})
```

# eslint.config.js
``` js
import js from '@eslint/js'
import globals from 'globals'
export default [
    {
        ignores:[
            'node_modules/**',
            'coverage/**'
        ]
    },
    js.configs.recommended,
    {
        files:['src/**/*.js'],
        languageOptions:{
            ecmaVersion:'latest',
            sourceType:'module',
            globals:{
                ...globals.node
            }
        },
        rules:{
            'no-unused-vars':[
                'error',{
                    argsIgnorePattern:'^_'
                }
            ]
        }
    }
]
```
# .editorconfig

```
root=true
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 4
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```
