import joi from 'joi'
import bcrypt from 'bcrypt'

import db from "../db.js"

export default async function postCadastro(req, res) {
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
}