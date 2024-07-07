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
//busca todas as empresas e seus dados cadastrais
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


//get only the selected company and its financial data
//busca apenas a empresa selecionada e seus dados financeiros
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


//get all companies from the selected sector and selected year/period
//busca todas as empresas do setor selecionado e do ano/período selecionado
app.get("/api/rankings/:anoParametro/:setorParametro", async (req, res) => {
    try {
        let dadosRanking

        if (req.params.anoParametro !== "MediaDosTresUltimosAnos" && req.params.setorParametro === "Todos") {

            dadosRanking = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                [req.params.anoParametro])

            dadosRanking = dadosRanking.rows

        } else if (req.params.anoParametro !== "MediaDosTresUltimosAnos" && req.params.setorParametro !== "Todos") {

            dadosRanking = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                [req.params.anoParametro, req.params.setorParametro])

            dadosRanking = dadosRanking.rows

        } else if (req.params.anoParametro === "MediaDosTresUltimosAnos" && req.params.setorParametro === "Todos") {
            const anoMaisRecente = 2023

            const dadosRankingPrimeiroAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                [anoMaisRecente])

            const dadosRankingSegundoAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                [anoMaisRecente - 1])

            const dadosRankingTerceiroAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                [anoMaisRecente - 2])

            let arrayComTodasEmpresasComMediaCalculadaTemp = []
            const todosOsAnosConsolidados = [...dadosRankingPrimeiroAno.rows, ...dadosRankingSegundoAno.rows, ...dadosRankingTerceiroAno.rows]

            todosOsAnosConsolidados.map(cadaEmpresa => {
                if (arrayComTodasEmpresasComMediaCalculadaTemp.length === 0) {
                    arrayComTodasEmpresasComMediaCalculadaTemp.push(cadaEmpresa.codigo_base)
                } else if (!arrayComTodasEmpresasComMediaCalculadaTemp.includes(cadaEmpresa.codigo_base)) {
                    arrayComTodasEmpresasComMediaCalculadaTemp.push(cadaEmpresa.codigo_base)
                }
            })

            arrayComTodasEmpresasComMediaCalculadaTemp = arrayComTodasEmpresasComMediaCalculadaTemp.map(cadaCodigoBase => ({ codigo_base: cadaCodigoBase, quantas_vezes_apareceu: 0 }))


            todosOsAnosConsolidados.map(cadaAnoCompletoDeCadaEmpresaCompleta => {
                arrayComTodasEmpresasComMediaCalculadaTemp.map((cadaMediaDeCadaEmpresa, index) => {

                    if (cadaAnoCompletoDeCadaEmpresaCompleta.codigo_base === cadaMediaDeCadaEmpresa.codigo_base) {
                        arrayComTodasEmpresasComMediaCalculadaTemp[index].quantas_vezes_apareceu = arrayComTodasEmpresasComMediaCalculadaTemp[index].quantas_vezes_apareceu + 1
                        if (arrayComTodasEmpresasComMediaCalculadaTemp[index].quantas_vezes_apareceu === 1) {
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].nome_empresarial = cadaAnoCompletoDeCadaEmpresaCompleta.nome_empresarial
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].ano = "Média dos últimos 3 anos"
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].classificacao_setorial = cadaAnoCompletoDeCadaEmpresaCompleta.classificacao_setorial
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].holding = cadaAnoCompletoDeCadaEmpresaCompleta.holding

                            arrayComTodasEmpresasComMediaCalculadaTemp[index].receita_liquida = Number(cadaAnoCompletoDeCadaEmpresaCompleta.receita_liquida)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_operacional = Number(cadaAnoCompletoDeCadaEmpresaCompleta.lucro_operacional)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_liquido = Number(cadaAnoCompletoDeCadaEmpresaCompleta.lucro_liquido)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonio_liquido = Number(cadaAnoCompletoDeCadaEmpresaCompleta.patrimonio_liquido)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].caixa_liquido_operacional = Number(cadaAnoCompletoDeCadaEmpresaCompleta.caixa_liquido_operacional)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].despesas_capital = Number(cadaAnoCompletoDeCadaEmpresaCompleta.despesas_capital)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].proventos_distribuidos = Number(cadaAnoCompletoDeCadaEmpresaCompleta.proventos_distribuidos)
                        } else {
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].receita_liquida = arrayComTodasEmpresasComMediaCalculadaTemp[index].receita_liquida + Number(cadaAnoCompletoDeCadaEmpresaCompleta.receita_liquida)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_operacional = arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_operacional + Number(cadaAnoCompletoDeCadaEmpresaCompleta.lucro_operacional)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_liquido = arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_liquido + Number(cadaAnoCompletoDeCadaEmpresaCompleta.lucro_liquido)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonio_liquido = arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonio_liquido + Number(cadaAnoCompletoDeCadaEmpresaCompleta.patrimonio_liquido)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].caixa_liquido_operacional = arrayComTodasEmpresasComMediaCalculadaTemp[index].caixa_liquido_operacional + Number(cadaAnoCompletoDeCadaEmpresaCompleta.caixa_liquido_operacional)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].despesas_capital = arrayComTodasEmpresasComMediaCalculadaTemp[index].despesas_capital + Number(cadaAnoCompletoDeCadaEmpresaCompleta.despesas_capital)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].proventos_distribuidos = arrayComTodasEmpresasComMediaCalculadaTemp[index].proventos_distribuidos + Number(cadaAnoCompletoDeCadaEmpresaCompleta.proventos_distribuidos)
                        }
                    }
                })
            })

            arrayComTodasEmpresasComMediaCalculadaTemp = arrayComTodasEmpresasComMediaCalculadaTemp.map(cadaEmpresa => {
                return {
                    codigo_base: cadaEmpresa.codigo_base,
                    nome_empresarial: cadaEmpresa.nome_empresarial,
                    ano: cadaEmpresa.ano,
                    classificacao_setorial: cadaEmpresa.classificacao_setorial,
                    holding: cadaEmpresa.holding,
                    receita_liquida: Math.round(cadaEmpresa.receita_liquida / cadaEmpresa.quantas_vezes_apareceu),
                    lucro_operacional: Math.round(cadaEmpresa.lucro_operacional / cadaEmpresa.quantas_vezes_apareceu),
                    lucro_liquido: Math.round(cadaEmpresa.lucro_liquido / cadaEmpresa.quantas_vezes_apareceu),
                    patrimonio_liquido: Math.round(cadaEmpresa.patrimonio_liquido / cadaEmpresa.quantas_vezes_apareceu),
                    caixa_liquido_operacional: Math.round(cadaEmpresa.caixa_liquido_operacional / cadaEmpresa.quantas_vezes_apareceu),
                    despesas_capital: Math.round(cadaEmpresa.despesas_capital / cadaEmpresa.quantas_vezes_apareceu),
                    proventos_distribuidos: Math.round(cadaEmpresa.proventos_distribuidos / cadaEmpresa.quantas_vezes_apareceu)
                }
            })

            console.log(arrayComTodasEmpresasComMediaCalculadaTemp)

            dadosRanking = arrayComTodasEmpresasComMediaCalculadaTemp
        } else if (req.params.anoParametro === "MediaDosTresUltimosAnos" && req.params.setorParametro !== "Todos") {

            const anoMaisRecente = 2023

            const dadosRankingPrimeiroAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                [anoMaisRecente, req.params.setorParametro])

            const dadosRankingSegundoAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                [anoMaisRecente - 1, req.params.setorParametro])

            const dadosRankingTerceiroAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                [anoMaisRecente - 2, req.params.setorParametro])

            let arrayComTodasEmpresasComMediaCalculadaTemp = []
            const todosOsAnosConsolidados = [...dadosRankingPrimeiroAno.rows, ...dadosRankingSegundoAno.rows, ...dadosRankingTerceiroAno.rows]

            todosOsAnosConsolidados.map(cadaEmpresa => {
                if (arrayComTodasEmpresasComMediaCalculadaTemp.length === 0) {
                    arrayComTodasEmpresasComMediaCalculadaTemp.push(cadaEmpresa.codigo_base)
                } else if (!arrayComTodasEmpresasComMediaCalculadaTemp.includes(cadaEmpresa.codigo_base)) {
                    arrayComTodasEmpresasComMediaCalculadaTemp.push(cadaEmpresa.codigo_base)
                }
            })

            arrayComTodasEmpresasComMediaCalculadaTemp = arrayComTodasEmpresasComMediaCalculadaTemp.map(cadaCodigoBase => ({ codigo_base: cadaCodigoBase, quantas_vezes_apareceu: 0 }))


            todosOsAnosConsolidados.map(cadaAnoCompletoDeCadaEmpresaCompleta => {
                arrayComTodasEmpresasComMediaCalculadaTemp.map((cadaMediaDeCadaEmpresa, index) => {

                    if (cadaAnoCompletoDeCadaEmpresaCompleta.codigo_base === cadaMediaDeCadaEmpresa.codigo_base) {
                        arrayComTodasEmpresasComMediaCalculadaTemp[index].quantas_vezes_apareceu = arrayComTodasEmpresasComMediaCalculadaTemp[index].quantas_vezes_apareceu + 1
                        if (arrayComTodasEmpresasComMediaCalculadaTemp[index].quantas_vezes_apareceu === 1) {
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].nome_empresarial = cadaAnoCompletoDeCadaEmpresaCompleta.nome_empresarial
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].ano = "Média dos últimos 3 anos"
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].classificacao_setorial = cadaAnoCompletoDeCadaEmpresaCompleta.classificacao_setorial

                            arrayComTodasEmpresasComMediaCalculadaTemp[index].receita_liquida = Number(cadaAnoCompletoDeCadaEmpresaCompleta.receita_liquida)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_operacional = Number(cadaAnoCompletoDeCadaEmpresaCompleta.lucro_operacional)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_liquido = Number(cadaAnoCompletoDeCadaEmpresaCompleta.lucro_liquido)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonio_liquido = Number(cadaAnoCompletoDeCadaEmpresaCompleta.patrimonio_liquido)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].caixa_liquido_operacional = Number(cadaAnoCompletoDeCadaEmpresaCompleta.caixa_liquido_operacional)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].despesas_capital = Number(cadaAnoCompletoDeCadaEmpresaCompleta.despesas_capital)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].proventos_distribuidos = Number(cadaAnoCompletoDeCadaEmpresaCompleta.proventos_distribuidos)
                        } else {
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].receita_liquida = arrayComTodasEmpresasComMediaCalculadaTemp[index].receita_liquida + Number(cadaAnoCompletoDeCadaEmpresaCompleta.receita_liquida)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_operacional = arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_operacional + Number(cadaAnoCompletoDeCadaEmpresaCompleta.lucro_operacional)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_liquido = arrayComTodasEmpresasComMediaCalculadaTemp[index].lucro_liquido + Number(cadaAnoCompletoDeCadaEmpresaCompleta.lucro_liquido)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonio_liquido = arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonio_liquido + Number(cadaAnoCompletoDeCadaEmpresaCompleta.patrimonio_liquido)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].caixa_liquido_operacional = arrayComTodasEmpresasComMediaCalculadaTemp[index].caixa_liquido_operacional + Number(cadaAnoCompletoDeCadaEmpresaCompleta.caixa_liquido_operacional)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].despesas_capital = arrayComTodasEmpresasComMediaCalculadaTemp[index].despesas_capital + Number(cadaAnoCompletoDeCadaEmpresaCompleta.despesas_capital)
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].proventos_distribuidos = arrayComTodasEmpresasComMediaCalculadaTemp[index].proventos_distribuidos + Number(cadaAnoCompletoDeCadaEmpresaCompleta.proventos_distribuidos)
                        }
                    }
                })
            })

            arrayComTodasEmpresasComMediaCalculadaTemp = arrayComTodasEmpresasComMediaCalculadaTemp.map(cadaEmpresa => {
                return {
                    codigo_base: cadaEmpresa.codigo_base,
                    nome_empresarial: cadaEmpresa.nome_empresarial,
                    ano: cadaEmpresa.ano,
                    classificacao_setorial: cadaEmpresa.classificacao_setorial,
                    receita_liquida: Math.round(cadaEmpresa.receita_liquida / cadaEmpresa.quantas_vezes_apareceu),
                    lucro_operacional: Math.round(cadaEmpresa.lucro_operacional / cadaEmpresa.quantas_vezes_apareceu),
                    lucro_liquido: Math.round(cadaEmpresa.lucro_liquido / cadaEmpresa.quantas_vezes_apareceu),
                    patrimonio_liquido: Math.round(cadaEmpresa.patrimonio_liquido / cadaEmpresa.quantas_vezes_apareceu),
                    caixa_liquido_operacional: Math.round(cadaEmpresa.caixa_liquido_operacional / cadaEmpresa.quantas_vezes_apareceu),
                    despesas_capital: Math.round(cadaEmpresa.despesas_capital / cadaEmpresa.quantas_vezes_apareceu),
                    proventos_distribuidos: Math.round(cadaEmpresa.proventos_distribuidos / cadaEmpresa.quantas_vezes_apareceu)
                }
            })

            dadosRanking = arrayComTodasEmpresasComMediaCalculadaTemp
        }

        res.json({
            dadosRanking
        })

    } catch (error) {
        console.error(error)
    }
})


//get macroeconomic metrics and its historical values
//busca os indicadores macroeconomicos e seus históricos de valores
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
