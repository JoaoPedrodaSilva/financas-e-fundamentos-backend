require("dotenv").config()
const cors = require("cors")
const database = require("./database/database")
const express = require("express")

//instance of the express server
const app = express()

//midlleware that prevents CORS error due the different ports of server and client (security)
app.use(cors())

//buitin express middleware that attaches the posted object to the body of the request (req.body)
app.use(express.json())

//get all articles from the database
app.get("/api/artigos", async (req, res) => {
    try {
        const results = await database.query("SELECT * FROM articles")
        
        res.json({
            status: "success",
            results: results.rows.length,
            articles: results.rows
        })
    } catch (error) {
        console.log(error)
    }
})

//get individual article and all its contents from the database
app.get("/api/artigos/:id", async (req, res) => {
    try {
        const article = await database.query("SELECT * FROM articles WHERE id = $1", [req.params.id])
        const contents = await database.query("SELECT * FROM article_contents WHERE article_id = $1 ORDER BY content_order ASC", [req.params.id])

        res.json({
            status: "success",
            article: article.rows[0],
            contents: contents.rows
        })
    } catch (error) {
        console.log(error)
    }
})


//get companies and its financial data from the database
app.get("/api/acoes/:id", async (req, res) => {
    try {
        const allCompanies = await database.query("SELECT * FROM companies ORDER BY code ASC")
        const selectedCompany = await database.query("SELECT * FROM companies WHERE id = $1", [req.params.id])
        const selectedCompanyfinancialData = await database.query("SELECT * FROM companies_financial_data WHERE company_id = $1 ORDER BY year ASC", [req.params.id])

        res.json({
            status: "success",
            allCompanies: allCompanies.rows,
            companyData: selectedCompany.rows[0],        
            financialData: selectedCompanyfinancialData.rows
        })
    } catch (error) {
        console.log(error)
    }
})


app.listen(process.env.PORT || 8000, () => {
    console.log(`server has started on port ${process.env.PORT}`)
})


