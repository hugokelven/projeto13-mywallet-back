import joi from 'joi'

import db from '../db.js'

export async function adicionarRegistro(req, res) {
    console.log(req.body)
    const {valor, descricao, tipo} = req.body
    const {token} = req.headers

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
        console.log(token)
        const sessao = await db.collection("sessoes").findOne({token})

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
}

export async function obterRegistros(req, res) {
    const {token} = req.headers
    try {
        const sessao = await db.collection("sessoes").findOne({token})

        const {usuarioId} = sessao

        const registros = await db.collection("registros").find({usuarioId}).toArray()
        res.status(200).send(registros)
    } catch (e) {
        res.sendStatus(404)
    }
}