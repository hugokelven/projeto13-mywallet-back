import { MongoClient } from "mongodb"
import dotenv from "dotenv"
dotenv.config()

let db
const mongoClient = new MongoClient(process.env.MONGO_URI)

try {
    await mongoClient.connect()
    db = mongoClient.db(process.env.DB)
    console.log("Conexão com o banco de dados MongoDB estabelecida")
} catch (e) {
    console.log("Erro ao conectar com o banco de dados", err)
}

export default db