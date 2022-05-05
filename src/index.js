import express, {json} from 'express'
import cors from 'cors'
import chalk from 'chalk'
import dotenv from "dotenv"

import postCadastro from './controllers/cadastroController.js'
import postLogin from './controllers/loginController.js'
import { adicionarRegistro, obterRegistros } from './controllers/registrosController.js'

const app = express()
app.use(cors())
app.use(json())
dotenv.config()

app.post("/cadastro", postCadastro)

app.post("/login", postLogin)

app.post("/registros", adicionarRegistro)
app.get("/registros", obterRegistros)

app.listen(process.env.PORTA, () => {
    console.log(chalk.bold.green(`Aplicação rodando na porta ${process.env.PORTA}`))
})