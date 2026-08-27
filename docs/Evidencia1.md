# NodeJS - 17Agosto26
## Gonzalez Mosqueda Rogelio Adrian

Se llevo a cabo la inicializacion de Node y la instalación de las depencias de para el proyecto. Tambien se añadieron las rutas y funcionalidades basicas para la navegacion de la pagina.

## Inicializacion de Node para las carpetas
``` bash
npm init -y      
```

``` bash
npm init -w apps/api -y
```

``` bash
npm init -w packages/contracts -y
```

``` bash
npm init -w packages/config -y 
```

``` bash  
npm init -w packages/shared -y  
```
## Instalacion de las dependencias

``` bash 
npm i express dotenv cors helmet pino pino-http --workspace=@ecommerce/api 
```

``` bash
npm i -D nodemon eslint @eslint/js globals pino-pretty --workspace=@ecommerce/api
```
## Configuración de los archivos package.json

### Raiz
``` json
{
  "name": "nodejs-monorepo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev":"npm run dev --workspace=@ecommerce/api",
    "start":"npm run start --workspace=@ecommerce/api",
    "lint":"npm run lint --workspaces --if-present"
  },
  "private": "true",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "workspaces": [
    "apps/api",
    "packages/contracts",
    "packages/config",
    "packages/shared"
  ],
  "engines": {
    "node":">=24"
  }
}
```
### packages/config
``` json
{
  "name": "@ecommerce/config",
  "version": "1.0.0",
  "private":"true",
  "type": "module"
}
```
### packages/contracts
``` json
{
  "name": "@ecommerce/contracts",
  "version": "1.0.0",
  "private":"true",
  "type": "module"
}
```
### packages/shared
``` json
{
  "name": "@ecommerce/shared",
  "version": "1.0.0",
  "private":"true",
  "type": "module"
}
```
### apps/api
``` json
{
  "name": "@ecommerce/api",
  "version": "1.0.0",
  "description": "Api E-commerce",
  "main": "src/server.js",
  "private": "true",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "lint": "eslint src/"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "engines": {
    "node": ">=24"
  }
```
## Creacion del archivo .gitignore
```
node_modules/
.env
```
## Archivos de apps/api
### .env
``` 
NODE_ENV=development
PORT=4050
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```
#### app.js
``` js
```
### server.js
``` js
```
## /src
### /config/env.js
``` js
import dotenv from 'dotenv'
import path from 'node:path'
import{ fileURLToPath } from 'node:url'

const currentFile=fileURLtoPath(import.meta.url)
const currentDirectory=path.direname(currentFile)
const envPath=path.resolve(currentDirectory,'../../.env')

dotenv.config({
    path: envPath
})

const port=Number(process.env.PORT??4000)

if(!Number.isInteger(port)||port<1||port>65535){
    throw new Error('El puerto debe ser válido')
}

export const env=Object.freeze({
    NNODE_ENV=process.env.NODE_ENV,
    PORT=port,
    API_PREFIX=process.env.API_PREFIX,
    CORS_ORIGIN=process.env.CORS_ORIGIN,
    LOG_LEVEL=process.env.LOG_LEVEL
}) 
```
### /config/logger.js
``` js
import pino from 'pino'
import {env} from './env.js'

const transport =
env.NODE_ENV === 'production' ? undefined : pino. transport
({
    target: 'pino-pretty',
    options: {
        colorize: true,
        translateTime: 'SYS: standard',
        ignore: 'pid, hostname'
    }
})

export const logger = pino({
level: env.LOG_LEVEL
}, transport)
```
### modules/health/health.controller.js
``` js
import {env} from "../..config/env.js"

export function getHealth(req,res){
    return res.status(200).json({
        success: true,
        data:{
            service: 'ecommerce-api',
            status: 'ok',
            environment: env.NODE_ENV,
            uptime: Number(process.uptime().toFixed(2)),
            timestamp: new Date().toISOString()

        },
        meta:{
            requestId: req.id
        }
        
    })
}
```
### modules/health/health.routes.js
``` js
import { Router } from 'express'
import { getHealth } from './health.controller.js'

const healthRoutes = Router()

healthRoutes.get('/', getHealth)

export default healthRoutes
```
### routes/index.js
``` js
import { Router } from 'express'
import { healthRoutes } from '../modules/health/health.routes.js'

const router = Router()

router.get('/', healthRoutes)

export default router
```
### shared/middleware/error.middlewere.js
``` js
import { logger } from "../../config/logger.js";

export function errorMiddleware(err, req, res, _next) {
    logger.error({
        err,
        requestId: req.id,
        method: req.method,
        url: req.originalUrl
    }, 'Unhandled application error')

}

return res.status(500).json({
    success: false,
    error:{
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ?
    'Internal Server Error' : err.message
    },
    meta:{
        requestId:req.id
    }
})
```
### shared/middleware/not-found.middlewere.js
``` js
export function notFoundMiddleware(req,res){
    return res.status(404).json({
    success: false,
    error:{
        code: 'ROUTE_NOT_FOUND',
        message:`Route ${req.method} ${req.originalUrl} not found`
    },
    meta:{
        requestId=req.id
    }
})
}
```