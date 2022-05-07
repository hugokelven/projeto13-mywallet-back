import express, {json} from 'express'
import cors from 'cors'
import chalk from 'chalk'
import dotenv from "dotenv"

import cadastroRouter from './routes/cadastroRouter.js'
import loginRouter from './routes/loginRouter.js'
import registrosRouter from './routes/registrosRouter.js'

const app = express()
app.use(cors())
app.use(json())
dotenv.config()

app.use(cadastroRouter)

app.use(loginRouter)

app.use(registrosRouter)

app.listen(process.env.PORTA || 5000, () => {
    console.log(chalk.bold.green(`Aplicação rodando na porta ${process.env.PORTA || 5000}`))
})