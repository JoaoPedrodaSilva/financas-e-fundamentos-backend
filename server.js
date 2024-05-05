require("dotenv").config()
const cors = require("cors")
const database = require("./database/database")
const express = require("express")
const argon2 = require('argon2')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')


const app = express()


//middlewares
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())


//create JWT
const criaJwt = (usuario) => {
    return jwt.sign({ usuario }, process.env.JWTSECRET)
}

//Verify Authenticity
const verificaAutenticidade = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.JWTSECRET, (erro) => {
            if (!erro) {
                next()
            } else {
                //console.log("erro na verificação do segredo do jwt")
                res.json({ token: null })
            }
        })
    } else {
        //console.log("não encontrou o cookie jwt")
        res.json({ token: null })
    }
}


// app.post("/api/cadastrese/", async (req, res) => {
//     try {
//         const usuarioNovo = await database.query(
//             'INSERT INTO usuarios(usuario, senha) VALUES($1, $2) RETURNING *',
//             [req.body.usuario, await argon2.hash(req.body.senha)]
//         )

//         const token = criaJwt(usuarioNovo.usuario)
//         res.cookie("jwt", token, { httpOnly: true })

//         res.json({
//             usuarioNovo: usuarioNovo.rows[0]
//         })
//     } catch (error) {
//         console.error(error)
//     }
// })

app.post("/api/entrar/", async (req, res) => {
    try {
        const usuarioLogado = await database.query(
            'SELECT * FROM usuarios WHERE usuario = $1',
            [req.body.usuario]
        )

        if (usuarioLogado.rows.length > 0) {
            const senhaCorreta = await argon2.verify(usuarioLogado.rows[0].senha, req.body.senha)

            if (senhaCorreta) {
                const token = criaJwt(usuarioLogado.rows[0].usuario)
                res.cookie("jwt", token, { httpOnly: true })
                res.json({
                    usuarioAutenticado: true
                })
            } else {
                res.json({
                    erro: "Usuário ou senha inválidos",
                    usuarioAutenticado: false
                })
            }
        } else {
            res.json({
                erro: ["Usuário ou senha inválidos"],
                usuarioAutenticado: false
            })
        }
    } catch (error) {
        console.error(error)
    }
})

app.get("/api/rotaProtegida/", verificaAutenticidade, async (req, res) => {
    try {
        res.json({
            usuarioAutenticado: true
        })
    } catch (error) {
        console.error(error)
    }
})

app.get("/api/sair/", async (_, res) => {
    res.clearCookie('jwt')
    try {
        res.json({
            usuarioAutenticado: false
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

        const historicoValoresEmbi = await database.query("SELECT * FROM historico_valores_indicadores_macroeconomicos WHERE id_indicador_macroeconomico = 3 ORDER BY competencia")

        const historicoValoresDolarEua = await database.query("SELECT * FROM historico_valores_indicadores_macroeconomicos WHERE id_indicador_macroeconomico = 5 ORDER BY competencia")



        res.json({
            todosIndicadores: todosIndicadores.rows,
            historicoValoresIpcaDozeMeses: historicoValoresIpcaDozeMeses.rows,
            historicoValoresSelicMeta: historicoValoresSelicMeta.rows,
            historicoValoresEmbi: historicoValoresEmbi.rows,
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
