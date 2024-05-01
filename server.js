require("dotenv").config()
const cors = require("cors")
const database = require("./database/database")
const express = require("express")
const argon2 = require('argon2')
const cookieParser = require('cookie-parser')


const app = express()


//middlewares
app.use(cookieParser())
app.use(cors({
    origin: process.env.VITE_API_FRONTEND_URL_PROD ?? process.env.VITE_API_FRONTEND_URL_DEV,
    credentials: true
})) 
app.use(express.json())



app.get("/api/cadastrese/", async (_, res) => {
    try {
        res.cookie("newUser", true, {secure: true, httpOnly: true})

        res.json({
            response: `Get no Cadastre-se.`
        })
    } catch (error) {
        console.error(error)
    }
})

app.get("/api/entrar/", async (req, res) => {
    try {
        res.json({
            cookies: req.cookies
        })
    } catch (error) {
        console.error(error)
    }
})

app.post("/api/cadastrese/", async (req, res) => {
    try {
        const usuarioNovo = await database.query(
            'INSERT INTO usuarios(usuario, senha) VALUES($1, $2) RETURNING *',
            [req.body.usuario, await argon2.hash(req.body.senha)]
        )

        res.json({
            usuarioNovo: usuarioNovo.rows[0]
        })
    } catch (error) {
        console.error(error)
    }
})

app.post("/api/entrar/", async (req, res) => {
    try {
        const usuarioNovo = await database.query(
            'SELECT * FROM usuarios WHERE usuario = $1',
            [req.body.usuario]
        )

        res.json({
            response: "Post no Entrar"
        })
    } catch (error) {
        console.error(error)
    }
})


//get all companies and its registration data from the database
app.get("/api/acoes/", async (_, res) => {
    try {
        const todasEmpresas = await database.query("SELECT * FROM empresas ORDER BY codigo_base ASC")

        res.json({
            empresas: todasEmpresas.rows
        })
    } catch (error) {
        console.error(error)
    }
})


//get selected company and it financial data from the database
app.get("/api/acoes/:codigoBaseParametro", async (req, res) => {
    try {
        const todasEmpresas = await database.query("SELECT * FROM empresas ORDER BY codigo_base ASC")
        const dadosEmpresaSelecionada = await database.query("SELECT * FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE empresas.codigo_base = $1 ORDER BY ano ASC", [req.params.codigoBaseParametro])

        res.json({
            empresas: todasEmpresas.rows,
            dadosEmpresaSelecionada: dadosEmpresaSelecionada.rows
        })
    } catch (error) {
        console.error(error)
    }
})


//get macroeconomic metrics and its historical values from the database
app.get("/api/macroeconomia/", async (_, res) => {

    try {
        const todosIndicadores = await database.query("SELECT * FROM indicadores_macroeconomicos ORDER BY indicador ASC")
        const historicoValoresIpcaDozeMeses = await database.query("SELECT * FROM historico_valores_indicadores_macroeconomicos WHERE id_indicador_macroeconomico = 1 ORDER BY competencia")
        const historicoValoresSelicMeta = await database.query("SELECT * FROM historico_valores_indicadores_macroeconomicos WHERE id_indicador_macroeconomico = 2 ORDER BY competencia")
        const historicoValoresDolarEua = await database.query("SELECT * FROM historico_valores_indicadores_macroeconomicos WHERE id_indicador_macroeconomico = 5 ORDER BY competencia")
        
        

        res.json({
            todosIndicadores: todosIndicadores.rows,
            historicoValoresIpcaDozeMeses: historicoValoresIpcaDozeMeses.rows,
            historicoValoresSelicMeta: historicoValoresSelicMeta.rows,
            historicoValoresDolarEua: historicoValoresDolarEua.rows            
        })
    } catch (error) {
        console.error(error)
    }
})


//run server
app.listen(process.env.PORT || 8000, () => {
    console.log(`server has started on port ${process.env.PORT}`)
})
