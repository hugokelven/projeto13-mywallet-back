import express, {json} from 'express'
import { MongoClient } from "mongodb"
import cors from 'cors'
import chalk from 'chalk'
import joi from 'joi'
import dotenv from "dotenv"
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

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
            const token = uuid()
            console.log(token)
        
            await db.collection("sessoes").insertOne({
                usuarioId: usuario._id,
                token
            })

            res.send(token)
        } else {
            // FIXME: Talvez precise de um throw error
            res.sendStatus(401)
        }
    } catch (e) {
        res.sendStatus(500)
    }
})

app.post("/registros", async (req, res) => {
    console.log(req.body)
    const {valor, descricao, tipo} = req.body
    const {token} = req.headers

    console.log(token)

    const registroSchema = joi.object({
        valor: joi.string().required(),
        descricao: joi.string().required(),
        tipo: joi.string().valid("entrada", "saida").required()
    })

    const validacao = registroSchema.validate(req.body)

    if(validacao.error) {
        res.status(500).send(validacao.error)
        return
    }

    try {
        const sessao = await db.collection("sessoes").findOne({token})
        console.log(sessao)

        const {usuarioId} = sessao

        if (sessao) {
            await db.collection("registros").insertOne({
                valor,
                descricao,
                tipo,
                usuarioId
            })
    
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }

    } catch (e) {
        res.sendStatus(500)
    }
})

app.get("/registros", async (req, res) => {
    const {token} = req.headers
    console.log(token)
    try {
        const sessao = await db.collection("sessoes").findOne({token})

        console.log(sessao)
        const {usuarioId} = sessao

        const registros = await db.collection("registros").find({usuarioId}).toArray()
        res.status(200).send(registros)
    } catch (e) {
        res.sendStatus(404)
    }
})

app.listen(process.env.PORTA, () => {
    console.log(chalk.bold.green(`Aplicação rodando na porta ${process.env.PORTA}`))
})