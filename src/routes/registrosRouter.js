import {Router} from 'express'

import { adicionarRegistro, obterRegistros } from './../controllers/registrosController.js'

const registrosRouter = Router()

registrosRouter.post("/registros", adicionarRegistro)
registrosRouter.get("/registros", obterRegistros)

export default registrosRouter