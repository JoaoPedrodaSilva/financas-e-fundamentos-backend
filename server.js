require("dotenv").config()
const calculaIndicadores = require("./calculaIndicadores")
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
        const dadosCadastraisDeTodasEmpresasConsultaBD = await database.query("SELECT * FROM empresas ORDER BY codigo_base ASC")

        const dadosCadastraisDeTodasEmpresas = dadosCadastraisDeTodasEmpresasConsultaBD.rows.map(cadaEmpresa => {
            return {
                id: cadaEmpresa.id,
                cnpj: cadaEmpresa.cnpj,
                nomeEmpresarial: cadaEmpresa.nome_empresarial,
                codigoBase: cadaEmpresa.codigo_base,
                cogigosNegociacao: cadaEmpresa.codigos_negociacao,
                segmentoListagem: cadaEmpresa.segmento_listagem,
                escriturador: cadaEmpresa.escriturador,
                classificacaoSetorial: cadaEmpresa.classificacao_setorial,
                atividadePrincipal: cadaEmpresa.atividade_principal,
                instituicaoFinanceira: cadaEmpresa.instituicao_financeira,
                holding: cadaEmpresa.holding,
            }
        })

        res.json({
            dadosCadastraisDeTodasEmpresas
        })
    } catch (error) {
        console.error(error)
    }
})


//get only the selected company and all its financial and registration data
//busca apenas a empresa selecionada e todos os seus dados financeiros e cadastrais
app.get("/api/acoes/:codigoBaseParametro", async (req, res) => {
    try {
        //BD Queries
        //consultas BD        
        const dadosCadastraisDaEmpresaSelecionadaConsultaBD = await database.query("SELECT * FROM empresas WHERE codigo_base = $1", [req.params.codigoBaseParametro])

        const dadosFinanceirosDaEmpresaSelecionadaConsultaBD = await database.query("SELECT dados_financeiros_empresa.id, id_empresa, ano, ativo_total, ativo_circulante, caixa_e_equivalentes, estoques, ativo_nao_circulante, ativo_realizavel_longo_prazo, passivo_total, passivo_circulante, emprestimos_curto_prazo, passivo_nao_circulante, emprestimos_longo_prazo, patrimonio_liquido, receita_liquida, lucro_bruto, lucro_operacional, lucro_antes_tributos, lucro_liquido, caixa_liquido_operacional, depreciacao_e_amortizacao, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE empresas.codigo_base = $1 ORDER BY ano ASC", [req.params.codigoBaseParametro])


        //object builders
        //construtores do objeto 
        const dadosCadastraisDaEmpresaSelecionada = {
            id: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].id,
            cnpj: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].cnpj,
            nomeEmpresarial: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].nome_empresarial,
            codigoBase: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].codigo_base,
            cogigosNegociacao: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].codigos_negociacao,
            segmentoListagem: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].segmento_listagem,
            escriturador: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].escriturador,
            classificacaoSetorial: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].classificacao_setorial,
            atividadePrincipal: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].atividade_principal,
            instituicaoFinanceira: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].instituicao_financeira,
            holding: dadosCadastraisDaEmpresaSelecionadaConsultaBD.rows[0].holding,
        }

        const dadosFinanceirosDaEmpresaSelecionada = dadosFinanceirosDaEmpresaSelecionadaConsultaBD.rows.map(cadaAnoDeDados => {
            const { ativoCirculante, ativoNaoCirculante, ativoTotal, passivoCirculante, passivoNaoCirculante, passivoTotal, patrimonioLiquido, receitaLiquida, lucroBruto, lucroOperacional, lucroAntesTributos, lucroLiquido, dividaLiquidaPeloEbitda, dividaBrutaPeloPatrimonioLiquido, retornoPeloPatrimonioLiquido, retornoPelosAtivos, margemBruta, margemOperacional, margemAntesTributos, margemLiquida, capexPeloFCO, capexPelaDA, payout, liquidezImediata, liquidezSeca, liquidezCorrente, liquidezGeral } = calculaIndicadores(cadaAnoDeDados, dadosCadastraisDaEmpresaSelecionada)

            return ({
                ano: new Date(`01-01-${cadaAnoDeDados.ano}`).getFullYear(),
                ativoCirculante,
                ativoNaoCirculante,
                ativoTotal,
                passivoCirculante,
                passivoNaoCirculante,
                passivoTotal,
                patrimonioLiquido,
                receitaLiquida,
                lucroBruto,
                lucroOperacional,
                lucroAntesTributos,
                lucroLiquido,
                dividaLiquidaPeloEbitda,
                dividaBrutaPeloPatrimonioLiquido,
                retornoPeloPatrimonioLiquido,
                retornoPelosAtivos,
                margemBruta,
                margemOperacional,
                margemAntesTributos,
                margemLiquida,
                capexPeloFCO,
                capexPelaDA,
                payout,
                liquidezImediata,
                liquidezSeca,
                liquidezCorrente,
                liquidezGeral
            })
        })

        const dadosCompletosDaEmpresaSelecionada = {
            dadosCadastrais: dadosCadastraisDaEmpresaSelecionada,
            dadosFinanceiros: dadosFinanceirosDaEmpresaSelecionada
        }


        //response
        res.json({
            dadosCompletosDaEmpresaSelecionada
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

        if (req.params.anoParametro !== "MediaDosTresUltimosAnos") {
            if (req.params.setorParametro === "Todos") {
                dadosRanking = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                    [req.params.anoParametro])

                dadosRanking = dadosRanking.rows.map(cadaAnoDeDados => {
                    const { ativoCirculante, ativoNaoCirculante, ativoTotal, passivoCirculante, passivoNaoCirculante, passivoTotal, patrimonioLiquido, receitaLiquida, lucroBruto, lucroOperacional, lucroAntesTributos, lucroLiquido, dividaLiquidaPeloEbitda, dividaBrutaPeloPatrimonioLiquido, retornoPeloPatrimonioLiquido, retornoPelosAtivos, margemBruta, margemOperacional, margemAntesTributos, margemLiquida, capexPeloFCO, capexPelaDA, payout, liquidezImediata, liquidezSeca, liquidezCorrente, liquidezGeral } = calculaIndicadores(cadaAnoDeDados, cadaAnoDeDados)

                    return ({
                        ano: new Date(`01-01-${cadaAnoDeDados.ano}`).getFullYear(),
                        ativoCirculante,
                        ativoNaoCirculante,
                        ativoTotal,
                        passivoCirculante,
                        passivoNaoCirculante,
                        passivoTotal,
                        patrimonioLiquido,
                        receitaLiquida,
                        lucroBruto,
                        lucroOperacional,
                        lucroAntesTributos,
                        lucroLiquido,
                        dividaLiquidaPeloEbitda,
                        dividaBrutaPeloPatrimonioLiquido,
                        retornoPeloPatrimonioLiquido,
                        retornoPelosAtivos,
                        margemBruta,
                        margemOperacional,
                        margemAntesTributos,
                        margemLiquida,
                        capexPeloFCO,
                        capexPelaDA,
                        payout,
                        liquidezImediata,
                        liquidezSeca,
                        liquidezCorrente,
                        liquidezGeral
                    })
                })

            } else if (req.params.setorParametro !== "Todos") {
                dadosRanking = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                    [req.params.anoParametro, req.params.setorParametro])

                dadosRanking = dadosRanking.rows.map(cadaAnoDeDados => {
                    const { ativoCirculante, ativoNaoCirculante, ativoTotal, passivoCirculante, passivoNaoCirculante, passivoTotal, patrimonioLiquido, receitaLiquida, lucroBruto, lucroOperacional, lucroAntesTributos, lucroLiquido, dividaLiquidaPeloEbitda, dividaBrutaPeloPatrimonioLiquido, retornoPeloPatrimonioLiquido, retornoPelosAtivos, margemBruta, margemOperacional, margemAntesTributos, margemLiquida, capexPeloFCO, capexPelaDA, payout, liquidezImediata, liquidezSeca, liquidezCorrente, liquidezGeral } = calculaIndicadores(cadaAnoDeDados, cadaAnoDeDados)

                    return ({
                        ano: new Date(`01-01-${cadaAnoDeDados.ano}`).getFullYear(),
                        ativoCirculante,
                        ativoNaoCirculante,
                        ativoTotal,
                        passivoCirculante,
                        passivoNaoCirculante,
                        passivoTotal,
                        patrimonioLiquido,
                        receitaLiquida,
                        lucroBruto,
                        lucroOperacional,
                        lucroAntesTributos,
                        lucroLiquido,
                        dividaLiquidaPeloEbitda,
                        dividaBrutaPeloPatrimonioLiquido,
                        retornoPeloPatrimonioLiquido,
                        retornoPelosAtivos,
                        margemBruta,
                        margemOperacional,
                        margemAntesTributos,
                        margemLiquida,
                        capexPeloFCO,
                        capexPelaDA,
                        payout,
                        liquidezImediata,
                        liquidezSeca,
                        liquidezCorrente,
                        liquidezGeral
                    })
                })
            }

        } else if (req.params.anoParametro === "MediaDosTresUltimosAnos") {
            const anoMaisRecente = 2023
            let dadosRankingPrimeiroAno, dadosRankingSegundoAno, dadosRankingTerceiroAno

            if (req.params.setorParametro === "Todos") {
                dadosRankingPrimeiroAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                    [anoMaisRecente])

                dadosRankingSegundoAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                    [anoMaisRecente - 1])

                dadosRankingTerceiroAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                    [anoMaisRecente - 2])

            } else if (req.params.setorParametro !== "Todos") {
                dadosRankingPrimeiroAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                    [anoMaisRecente, req.params.setorParametro])

                dadosRankingSegundoAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                    [anoMaisRecente - 1, req.params.setorParametro])

                dadosRankingTerceiroAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                    [anoMaisRecente - 2, req.params.setorParametro])
            }

            let arrayComTodasEmpresasComMediaCalculadaTemp = []
            const todosOsAnosConsolidadosPadraoConsultaDB = [...dadosRankingPrimeiroAno.rows, ...dadosRankingSegundoAno.rows, ...dadosRankingTerceiroAno.rows]

            todosOsAnosConsolidadosPadraoConsultaDB.map(cadaEmpresa => {
                if (arrayComTodasEmpresasComMediaCalculadaTemp.length === 0) {
                    arrayComTodasEmpresasComMediaCalculadaTemp.push(cadaEmpresa.codigo_base)
                } else if (!arrayComTodasEmpresasComMediaCalculadaTemp.includes(cadaEmpresa.codigo_base)) {
                    arrayComTodasEmpresasComMediaCalculadaTemp.push(cadaEmpresa.codigo_base)
                }
            })

            arrayComTodasEmpresasComMediaCalculadaTemp = arrayComTodasEmpresasComMediaCalculadaTemp.map(cadaCodigoBase => ({ codigoBase: cadaCodigoBase, quantasVezesApareceu: 0 }))


            todosOsAnosConsolidadosPadraoConsultaDB.map(cadaAnoCompletoDeCadaEmpresaCompleta => {
                // console.log(cadaAnoCompletoDeCadaEmpresaCompleta.codigoBase)

                arrayComTodasEmpresasComMediaCalculadaTemp.map((cadaMediaDeCadaEmpresa, index) => {
                    // console.log(cadaMediaDeCadaEmpresa)

                    if (cadaAnoCompletoDeCadaEmpresaCompleta.codigo_base === cadaMediaDeCadaEmpresa.codigoBase) {
                        arrayComTodasEmpresasComMediaCalculadaTemp[index].quantasVezesApareceu = arrayComTodasEmpresasComMediaCalculadaTemp[index].quantasVezesApareceu + 1
                        if (arrayComTodasEmpresasComMediaCalculadaTemp[index].quantasVezesApareceu === 1) {
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].nomeEmpresarial = cadaAnoCompletoDeCadaEmpresaCompleta.nome_empresarial
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].ano = "Média dos últimos 3 anos"
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].classificacaoSetorial = cadaAnoCompletoDeCadaEmpresaCompleta.classificacao_setorial

                            arrayComTodasEmpresasComMediaCalculadaTemp[index].receitaLiquida = calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).receitaLiquida
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucroOperacional = calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).lucroOperacional
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].lucroLiquido = calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).lucroLiquido
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonioLiquido = calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).patrimonioLiquido
                            arrayComTodasEmpresasComMediaCalculadaTemp[index].retornoPeloPatrimonioLiquido = calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).retornoPeloPatrimonioLiquido


                            // console.log(arrayComTodasEmpresasComMediaCalculadaTemp[index].lucroOperacional)
                        } else {
                            if (arrayComTodasEmpresasComMediaCalculadaTemp[index].receitaLiquida !== null) {
                                arrayComTodasEmpresasComMediaCalculadaTemp[index].receitaLiquida += calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).receitaLiquida
                            }
                            if (arrayComTodasEmpresasComMediaCalculadaTemp[index].lucroOperacional !== null) {
                                arrayComTodasEmpresasComMediaCalculadaTemp[index].lucroOperacional += calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).lucroOperacional
                            }
                            if (arrayComTodasEmpresasComMediaCalculadaTemp[index].lucroLiquido !== null) {
                                arrayComTodasEmpresasComMediaCalculadaTemp[index].lucroLiquido += calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).lucroLiquido
                            }
                            if (arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonioLiquido !== null) {
                                arrayComTodasEmpresasComMediaCalculadaTemp[index].patrimonioLiquido += calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).patrimonioLiquido
                            }
                            if (arrayComTodasEmpresasComMediaCalculadaTemp[index].retornoPeloPatrimonioLiquido !== null) {
                                arrayComTodasEmpresasComMediaCalculadaTemp[index].retornoPeloPatrimonioLiquido += calculaIndicadores(cadaAnoCompletoDeCadaEmpresaCompleta, null).retornoPeloPatrimonioLiquido
                            }

                            // console.log(arrayComTodasEmpresasComMediaCalculadaTemp[index])
                        }
                    }
                })
            })

            arrayComTodasEmpresasComMediaCalculadaTemp = arrayComTodasEmpresasComMediaCalculadaTemp.map(cadaEmpresa => {
                return {
                    codigoBase: cadaEmpresa.codigoBase,
                    nomeEmpresarial: cadaEmpresa.nomeEmpresarial,
                    ano: cadaEmpresa.ano,
                    classificacaoSetorial: cadaEmpresa.classificacaoSetorial,
                    receitaLiquida: Math.round(cadaEmpresa.receitaLiquida / cadaEmpresa.quantasVezesApareceu),
                    lucroOperacional: Math.round(cadaEmpresa.lucroOperacional / cadaEmpresa.quantasVezesApareceu),
                    lucroLiquido: Math.round(cadaEmpresa.lucroLiquido / cadaEmpresa.quantasVezesApareceu),
                    patrimonioLiquido: Math.round(cadaEmpresa.patrimonioLiquido / cadaEmpresa.quantasVezesApareceu),
                    retornoPeloPatrimonioLiquido: Number((cadaEmpresa.retornoPeloPatrimonioLiquido / cadaEmpresa.quantasVezesApareceu).toFixed(2)),
                }
            })

            dadosRanking = arrayComTodasEmpresasComMediaCalculadaTemp

            console.log(dadosRanking)
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
