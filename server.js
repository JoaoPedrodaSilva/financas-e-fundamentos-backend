require("dotenv").config()
const cors = require("cors")
const database = require("./database/database")
const express = require("express")


const app = express() //instance of the express server
app.use(cors()) //middleware that prevents CORS error due the different ports of server and client (security)
app.use(express.json()) //buitin express middleware that attaches the posted object to the body of the request (req.body)


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


//get companies and its financial data from the database
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
app.get("/api/macroeconomia/:indicadorParametro", async (req, res) => {

    try {
        const todosIndicadores = await database.query("SELECT * FROM indicadores_macroeconomicos ORDER BY indicador ASC")
        const historicoValoresIndicadorMacroeconomico = await database.query("SELECT historico_valores_indicadores_macroeconomicos.id, ano, valor, id_indicador_macroeconomico FROM historico_valores_indicadores_macroeconomicos JOIN indicadores_macroeconomicos ON historico_valores_indicadores_macroeconomicos.id_indicador_macroeconomico = indicadores_macroeconomicos.id WHERE indicadores_macroeconomicos.indicador = $1 ORDER BY ano ASC", [req.params.indicadorParametro])

        res.json({
            indicadores: todosIndicadores.rows,
            historicoValoresIndicadorMacroeconomico: historicoValoresIndicadorMacroeconomico.rows
        })
    } catch (error) {
        console.error(error)
    }
})


//run server
app.listen(process.env.PORT || 8000, () => {
    console.log(`server has started on port ${process.env.PORT}`)
})
