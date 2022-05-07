import {Router} from 'express'

import postCadastro from './../controllers/cadastroController.js'

const cadastroRouter = Router()

cadastroRouter.post("/cadastro", postCadastro)

export default cadastroRouter