import joi from 'joi'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid';

import db from "../db.js"

export default async function postLogin(req, res) {
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
}