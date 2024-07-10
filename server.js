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
                ano: cadaAnoDeDados.ano,
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
        let dadosCompletosDoSetorSelecionado = []

        if (req.params.anoParametro !== "MediaDosTresUltimosAnos") {
            let dadosCompletosDoSetorSelecionadoConsultaDB

            if (req.params.setorParametro === "Todos") {
                dadosCompletosDoSetorSelecionadoConsultaDB = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1",
                    [req.params.anoParametro])

            } else if (req.params.setorParametro !== "Todos") {
                dadosCompletosDoSetorSelecionadoConsultaDB = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                    [req.params.anoParametro, req.params.setorParametro])
            }

            dadosCompletosDoSetorSelecionado = dadosCompletosDoSetorSelecionadoConsultaDB.rows.map(cadaAnoDeDados => {
                const { ativoCirculante, ativoNaoCirculante, ativoTotal, passivoCirculante, passivoNaoCirculante, passivoTotal, patrimonioLiquido, receitaLiquida, lucroBruto, lucroOperacional, lucroAntesTributos, lucroLiquido, dividaLiquidaPeloEbitda, dividaBrutaPeloPatrimonioLiquido, retornoPeloPatrimonioLiquido, retornoPelosAtivos, margemBruta, margemOperacional, margemAntesTributos, margemLiquida, capexPeloFCO, capexPelaDA, payout, liquidezImediata, liquidezSeca, liquidezCorrente, liquidezGeral } = calculaIndicadores(cadaAnoDeDados, cadaAnoDeDados)

                return {
                    codigoBase: cadaAnoDeDados.codigo_base,
                    nomeEmpresarial: cadaAnoDeDados.nome_empresarial,
                    ano: cadaAnoDeDados.ano,
                    classificacaoSetorial: cadaAnoDeDados.classificacao_setorial,
                    receitaLiquida: receitaLiquida !== null ? receitaLiquida : null,
                    lucroOperacional: lucroOperacional !== null ? lucroOperacional : null,
                    lucroLiquido: lucroLiquido !== null ? lucroLiquido : null,
                    patrimonioLiquido: patrimonioLiquido !== null ? patrimonioLiquido : null,
                    margemOperacional: margemOperacional !== null ? margemOperacional : null,
                    margemLiquida: margemLiquida !== null ? margemLiquida : null,
                    retornoPeloPatrimonioLiquido: retornoPeloPatrimonioLiquido !== null ? retornoPeloPatrimonioLiquido : null,
                    capexPeloFCO: capexPeloFCO !== null ? capexPeloFCO : null,
                    payout: payout !== null ? payout : null
                }
            })

        } else if (req.params.anoParametro === "MediaDosTresUltimosAnos") {
            const anosUsadosParaCalculoDaMedia = [2023, 2022, 2021]
            let dadosCompletosDosTresAnosConsolidadosConsultaDB           

            if (req.params.setorParametro === "Todos") {
                dadosCompletosDosTresAnosConsolidadosConsultaDB = await Promise.all(anosUsadosParaCalculoDaMedia.map(async cadaAno => {
                    const consultaDeCadaAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1", [cadaAno])
                    return consultaDeCadaAno.rows
                }))

            } else if (req.params.setorParametro !== "Todos") {
                dadosCompletosDosTresAnosConsolidadosConsultaDB = await Promise.all(anosUsadosParaCalculoDaMedia.map(async cadaAno => {
                    const consultaDeCadaAno = await database.query("SELECT codigo_base, nome_empresarial, ano, classificacao_setorial, receita_liquida, lucro_operacional, lucro_liquido, patrimonio_liquido, caixa_liquido_operacional, despesas_capital, proventos_distribuidos FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE ano = $1 AND empresas.classificacao_setorial = $2",
                        [cadaAno, req.params.setorParametro])
                    return consultaDeCadaAno.rows
                }))
            }

            //monta o array "dadosCompletosDoSetorSelecionado" contendo cada empresa apenas uma vez
            dadosCompletosDosTresAnosConsolidadosConsultaDB = dadosCompletosDosTresAnosConsolidadosConsultaDB.flat(1)
            dadosCompletosDosTresAnosConsolidadosConsultaDB.map(cadaEmpresa => {
                dadosCompletosDoSetorSelecionado.length === 0 ? dadosCompletosDoSetorSelecionado.push(cadaEmpresa.codigo_base) :
                    !dadosCompletosDoSetorSelecionado.includes(cadaEmpresa.codigo_base) ? dadosCompletosDoSetorSelecionado.push(cadaEmpresa.codigo_base) : null
            })
            dadosCompletosDoSetorSelecionado = dadosCompletosDoSetorSelecionado.map(cadaCodigoBase => ({ codigoBase: cadaCodigoBase, quantasVezesApareceu: 0 }))

            //complementa cada empresa do array "dadosCompletosDoSetorSelecionado" e soma seus dados financeiros dos três anos
            dadosCompletosDosTresAnosConsolidadosConsultaDB.map(cadaEmpresaConsultaDB => {
                const { ativoCirculante, ativoNaoCirculante, ativoTotal, passivoCirculante, passivoNaoCirculante, passivoTotal, patrimonioLiquido, receitaLiquida, lucroBruto, lucroOperacional, lucroAntesTributos, lucroLiquido, dividaLiquidaPeloEbitda, dividaBrutaPeloPatrimonioLiquido, retornoPeloPatrimonioLiquido, retornoPelosAtivos, margemBruta, margemOperacional, margemAntesTributos, margemLiquida, capexPeloFCO, capexPelaDA, payout, liquidezImediata, liquidezSeca, liquidezCorrente, liquidezGeral } = calculaIndicadores(cadaEmpresaConsultaDB, cadaEmpresaConsultaDB)

                dadosCompletosDoSetorSelecionado.map((cadaEmpresa, index) => {                    
                    if (cadaEmpresaConsultaDB.codigo_base === cadaEmpresa.codigoBase) {
                        dadosCompletosDoSetorSelecionado[index].quantasVezesApareceu++

                        if (dadosCompletosDoSetorSelecionado[index].quantasVezesApareceu === 1) {

                            dadosCompletosDoSetorSelecionado[index].nomeEmpresarial = cadaEmpresaConsultaDB.nome_empresarial
                            dadosCompletosDoSetorSelecionado[index].ano = "Média dos últimos 3 anos"
                            dadosCompletosDoSetorSelecionado[index].classificacaoSetorial = cadaEmpresaConsultaDB.classificacao_setorial

                            dadosCompletosDoSetorSelecionado[index].receitaLiquida = receitaLiquida
                            dadosCompletosDoSetorSelecionado[index].lucroOperacional = lucroOperacional
                            dadosCompletosDoSetorSelecionado[index].lucroLiquido = lucroLiquido
                            dadosCompletosDoSetorSelecionado[index].patrimonioLiquido = patrimonioLiquido
                            dadosCompletosDoSetorSelecionado[index].margemOperacional = margemOperacional
                            dadosCompletosDoSetorSelecionado[index].margemLiquida = margemLiquida
                            dadosCompletosDoSetorSelecionado[index].retornoPeloPatrimonioLiquido = retornoPeloPatrimonioLiquido
                            dadosCompletosDoSetorSelecionado[index].capexPeloFCO = capexPeloFCO
                            dadosCompletosDoSetorSelecionado[index].payout = payout

                        } else {
                            dadosCompletosDoSetorSelecionado[index].receitaLiquida !== null ? dadosCompletosDoSetorSelecionado[index].receitaLiquida += receitaLiquida : null
                            dadosCompletosDoSetorSelecionado[index].lucroOperacional !== null ? dadosCompletosDoSetorSelecionado[index].lucroOperacional += lucroOperacional : null
                            dadosCompletosDoSetorSelecionado[index].lucroLiquido !== null ? dadosCompletosDoSetorSelecionado[index].lucroLiquido += lucroLiquido : null
                            dadosCompletosDoSetorSelecionado[index].patrimonioLiquido !== null ? dadosCompletosDoSetorSelecionado[index].patrimonioLiquido += patrimonioLiquido : null
                            dadosCompletosDoSetorSelecionado[index].margemOperacional !== null ? dadosCompletosDoSetorSelecionado[index].margemOperacional += margemOperacional : null
                            dadosCompletosDoSetorSelecionado[index].margemLiquida !== null ? dadosCompletosDoSetorSelecionado[index].margemLiquida += margemLiquida : null
                            dadosCompletosDoSetorSelecionado[index].retornoPeloPatrimonioLiquido !== null ? dadosCompletosDoSetorSelecionado[index].retornoPeloPatrimonioLiquido += retornoPeloPatrimonioLiquido : null
                            dadosCompletosDoSetorSelecionado[index].capexPeloFCO !== null ? dadosCompletosDoSetorSelecionado[index].capexPeloFCO += capexPeloFCO : null
                            dadosCompletosDoSetorSelecionado[index].payout !== null ? dadosCompletosDoSetorSelecionado[index].payout += payout : null
                        }
                    }
                })
            })


            //calcula a média dos dados financeiros dos três anos de cada empresa e prepara o array "dadosCompletosDoSetorSelecionado" para ser enviado ao frontend
            dadosCompletosDoSetorSelecionado = dadosCompletosDoSetorSelecionado.map(cadaEmpresa => {                
                const { quantasVezesApareceu, codigoBase, nomeEmpresarial, ano, classificacaoSetorial, receitaLiquida, lucroOperacional, lucroLiquido, patrimonioLiquido, margemOperacional, margemLiquida, retornoPeloPatrimonioLiquido, capexPeloFCO, payout } = cadaEmpresa

                return {
                    codigoBase: codigoBase,
                    nomeEmpresarial: nomeEmpresarial,
                    ano: ano,
                    classificacaoSetorial: classificacaoSetorial,
                    receitaLiquida: receitaLiquida !== null ? Math.round(receitaLiquida / quantasVezesApareceu) : null,
                    lucroOperacional: lucroOperacional !== null ? Math.round(lucroOperacional / quantasVezesApareceu) : null,
                    lucroLiquido: lucroLiquido !== null ? Math.round(lucroLiquido / quantasVezesApareceu) : null,
                    patrimonioLiquido: patrimonioLiquido !== null ? Math.round(patrimonioLiquido / quantasVezesApareceu) : null,
                    margemOperacional: margemOperacional !== null ? Number((margemOperacional / quantasVezesApareceu).toFixed(4)) : null,
                    margemLiquida: margemLiquida !== null ? Number((margemLiquida / quantasVezesApareceu).toFixed(4)) : null,
                    retornoPeloPatrimonioLiquido: retornoPeloPatrimonioLiquido !== null ? Number((retornoPeloPatrimonioLiquido / quantasVezesApareceu).toFixed(4)) : null,
                    capexPeloFCO: capexPeloFCO !== null ? Number((capexPeloFCO / quantasVezesApareceu).toFixed(4)) : null,
                    payout: payout !== null ? Number((payout / quantasVezesApareceu).toFixed(4)) : null,
                }
            })
        }

        res.json({
            dadosCompletosDoSetorSelecionado
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
