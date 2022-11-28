require("dotenv").config()
const cors = require("cors")
const database = require("./database/database")
const express = require("express")


const app = express() //instance of the express server
app.use(cors()) //middleware that prevents CORS error due the different ports of server and client (security)
app.use(express.json()) //buitin express middleware that attaches the posted object to the body of the request (req.body)


//get all articles from the database
app.get("/api/artigos", async (_, res) => {
    try {
        const results = await database.query("SELECT * FROM artigos")
        
        res.json({
            artigos: results.rows
        })
    } catch (error) {
        console.error(error)
    }
})

//get individual article and all its contents from the database
app.get("/api/artigos/:id", async (req, res) => {
    try {
        const article = await database.query("SELECT * FROM artigos WHERE id = $1", [req.params.id])
        const contents = await database.query("SELECT * FROM conteudos_artigo WHERE id_artigo = $1 ORDER BY ordem_conteudo ASC", [req.params.id])

        res.json({
            artigo: article.rows[0],
            conteudos: contents.rows
        })
    } catch (error) {
        console.error(error)
    }
})

//get companies and its financial data from the database
app.get("/api/acoes/:codigo_base", async (req, res) => {
    
    try {
        const allCompanies = await database.query("SELECT * FROM empresas ORDER BY codigo_base ASC")
        const selectedCompanyRegistrationData = await database.query("SELECT * FROM empresas WHERE codigo_base = $1", [req.params.codigo_base])
        const selectedCompanyFinancialData = await database.query("SELECT * FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE empresas.codigo_base = $1 ORDER BY ano ASC", [req.params.codigo_base])
        
        res.json({
            empresas: allCompanies.rows,
            dadosCadastraisEmpresa: selectedCompanyRegistrationData.rows[0],        
            dadosFinanceirosEmpresa: selectedCompanyFinancialData.rows
        })
    } catch (error) {
        console.error(error)
    }
    
})


//run server
app.listen(process.env.PORT || 8000, () => {
    console.log(`server has started on port ${process.env.PORT}`)
})


