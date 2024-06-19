require("dotenv").config()
const cors = require("cors")
const database = require("./database/database")
const express = require("express")


const app = express()


//middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())


//get all companies and its registration data
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


//get selected company and its financial data
app.get("/api/acoes/:codigoBaseParametro", async (req, res) => {
    try {
        const dadosEmpresaSelecionada = await database.query("SELECT * FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE empresas.codigo_base = $1 ORDER BY ano ASC", [req.params.codigoBaseParametro])

        res.json({
            dadosEmpresaSelecionada: dadosEmpresaSelecionada.rows
        })
    } catch (error) {
        console.error(error)
    }
})


//get selected metric for all companies
app.get("/api/rankings/:anoParametro/:setorParametro", async (req, res) => {
    try {
        const dadosRanking = await database.query("SELECT codigo_base, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos  FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
            [req.params.anoParametro, req.params.setorParametro])

        res.json({
            dadosRanking: dadosRanking.rows
        })
    } catch (error) {
        console.error(error)
    }
})



//get macroeconomic metrics and its historical values
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
