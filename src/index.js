import express, {json} from 'express'
import { MongoClient } from "mongodb"
import cors from 'cors'
import chalk from 'chalk'
import joi from 'joi'
import dotenv from "dotenv"
import bcrypt from 'bcrypt';

const app = express()
app.use(cors())
app.use(json())
dotenv.config()

let db
const mongoClient = new MongoClient(process.env.MONGO_URI)

mongoClient.connect()
    .then(() => {db = mongoClient.db(process.env.DB)})
    .catch(err => {console.log("Erro ao conectar com o banco de dados", err)})

app.post("/cadastro", async (req, res) => {
    console.log(req.body)
    const {nome, email, senha} = req.body

    // FIXME: fazer o campo confirmacaoSenha ser requerido
    // FIXME: criar um pattern para a senha
    const cadastroSchema = joi.object({
        nome: joi.string().required(),
        email: joi.string().email().required(),
        senha: joi.string().required(),
        confirmacaoSenha: joi.ref('senha')
    })

    const validacao = cadastroSchema.validate(req.body)

    if(validacao.error) {
        res.status(500).send(validacao.error)
        return
    }
    
    const senhaHash = bcrypt.hashSync(senha, 10)

    try {
        const usuario = await db.collection("usuariosCadastrados").findOne({email})

        if (usuario) {
            res.sendStatus(409)
            return
        }

        await db.collection("usuariosCadastrados").insertOne(
            {nome, email, senha: senhaHash}
        )
        res.sendStatus(201)
    } catch (e) {
        res.sendStatus(500)
    }
})

app.post("/login", async (req, res) => {
    console.log(req.body)

    const {email, senha} = req.body

    const loginSchema = joi.object({
        email: joi.string().email().required(),
        senha: joi.string().required()
    })

    const validacao = loginSchema.validate(req.body)

    if(validacao.error) {
        res.status(500).send(validacao.error)
        return
    }

    try {
        const usuario = await db.collection("usuariosCadastrados").findOne({email})

        if (usuario && bcrypt.compareSync(senha, usuario.senha)) {
            res.sendStatus(200);
        } else {
            // FIXME: Talvez precise de um throw error
            res.sendStatus(401);
        }
    } catch (e) {
        res.sendStatus(500)
    }
})

app.post("/transacoes", async (req, res) => {
    console.log(req.body)
    const {valor, descricao, tipo} = req.body
    const {email} = req.headers

    console.log(email)

    const transacaoSchema = joi.object({
        valor: joi.string().required(),
        descricao: joi.string().required(),
        tipo: joi.string().valid("entrada", "saida").required()
    })

    const validacao = transacaoSchema.validate(req.body)

    if(validacao.error) {
        res.status(500).send(validacao.error)
        return
    }

    try {
        await db.collection("transacoes").insertOne({
            valor,
            descricao,
            tipo,
            email
        })

        res.sendStatus(200)
    } catch (e) {
        res.sendStatus(500)
    }
})

app.get("/transacoes", async (req, res) => {
    const {email} = req.headers
    console.log(email)
    try {
        const transacoes = await db.collection("transacoes").find({email}).toArray()
        res.status(200).send(transacoes)
    } catch (e) {
        res.sendStatus(404)
    }
})

app.listen(process.env.PORTA, () => {
    console.log(chalk.bold.green(`Aplicação rodando na porta ${process.env.PORTA}`))
})