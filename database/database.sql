---------------------------------------------------- COMPANIES -------------------------------------------------------

CREATE TABLE empresas (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    codigo_base VARCHAR(4) NOT NULL UNIQUE,
    codigos_negociacao VARCHAR(50) NOT NULL,
    nome_empresarial VARCHAR(255) NOT NULL,
    segmento_listagem VARCHAR(50) NOT NULL,
    escriturador VARCHAR(50) NOT NULL,
    classificacao_setorial VARCHAR(50) NOT NULL,
    atividade_principal VARCHAR(255) NOT NULL,
    instituicao_financeira BOOLEAN NOT NULL,
    holding BOOLEAN NOT NULL,
)

INSERT INTO empresas (nome_empresarial, cnpj, classificacao_setorial, atividade_principal, segmento_listagem, codigo_base, codigos_negociacao, escriturador, instituicao_financeira, holding) VALUES ()
SELECT * FROM empresas ORDER BY codigo_base ASC
SELECT * FROM empresas WHERE codigo_base = $1


----------------------------------------------- COMPANY FINANCIAL DATA -----------------------------------------------


CREATE TABLE dados_financeiros_empresa (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES empresas(id),
    ano BIGINT NOT NULL,

    ativo_total BIGINT,
    ativo_circulante BIGINT,
    caixa_e_equivalentes BIGINT,
    estoques BIGINT,
    ativo_nao_circulante BIGINT,
    ativo_realizavel_longo_prazo BIGINT,
    passivo_circulante BIGINT,
    emprestimos_curto_prazo BIGINT,
    passivo_nao_circulante BIGINT,
    emprestimos_longo_prazo BIGINT,
    patrimonio_liquido BIGINT,

    receita_liquida BIGINT,
    lucro_bruto BIGINT,
    lucro_operacional BIGINT,
    lucro_antes_tributos BIGINT,
    lucro_liquido BIGINT,

    caixa_liquido_operacional BIGINT,
    depreciacao_e_amortizacao BIGINT,
    despesas_capital BIGINT,
    proventos_distribuidos BIGINT,

    UNIQUE (id_empresa, ano)
)


-- for companies which are no financial institutions nor holdings
INSERT INTO dados_financeiros_empresa (
id_empresa, ano,
ativo_circulante, caixa_e_equivalentes, estoques, ativo_nao_circulante, ativo_realizavel_longo_prazo,
passivo_circulante, emprestimos_curto_prazo, passivo_nao_circulante, emprestimos_longo_prazo,
receita_liquida, lucro_bruto, lucro_operacional, lucro_antes_tributos, lucro_liquido,
caixa_liquido_operacional, depreciacao_e_amortizacao, despesas_capital, proventos_distribuidos)
VALUES ()

SELECT id, id_empresa, ano,
ativo_circulante, caixa_e_equivalentes, estoques, ativo_nao_circulante, ativo_realizavel_longo_prazo,
passivo_circulante, emprestimos_curto_prazo, passivo_nao_circulante, emprestimos_longo_prazo,
receita_liquida, lucro_bruto, lucro_operacional, lucro_antes_tributos, lucro_liquido,
caixa_liquido_operacional, depreciacao_e_amortizacao, despesas_capital, proventos_distribuidos
FROM dados_financeiros_empresa WHERE id_empresa=3 ORDER BY ano DESC


-- for financial institutions which are no holdings
INSERT INTO dados_financeiros_empresa (
id_empresa, ano,
ativo_total, patrimonio_liquido,
receita_liquida, lucro_bruto, lucro_antes_tributos, lucro_liquido,
caixa_liquido_operacional, depreciacao_e_amortizacao, despesas_capital, proventos_distribuidos)
VALUES ()

SELECT id, id_empresa, ano,
ativo_total, patrimonio_liquido,
receita_liquida, lucro_bruto, lucro_antes_tributos, lucro_liquido,
caixa_liquido_operacional, depreciacao_e_amortizacao, despesas_capital, proventos_distribuidos
FROM dados_financeiros_empresa WHERE id_empresa=3 ORDER BY ano DESC


-- for holdings, financial institutions or not (BBSE, BRAP)
INSERT INTO dados_financeiros_empresa (
id_empresa, ano,
ativo_total, patrimonio_liquido,
lucro_operacional, lucro_antes_tributos, lucro_liquido,
proventos_distribuidos)
VALUES ()

SELECT id, id_empresa, ano,
ativo_total, patrimonio_liquido,
lucro_operacional, lucro_antes_tributos, lucro_liquido,
proventos_distribuidos
FROM dados_financeiros_empresa WHERE id_empresa=3 ORDER BY ano DESC


SELECT * FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE empresas.codigo_base = $1 ORDER BY ano ASC



----------------------------------------------- MACROECONOMICS -----------------------------------------------

CREATE TABLE indicadores_macroeconomicos (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    indicador VARCHAR(10) NOT NULL UNIQUE,
    descricao_curta VARCHAR(50),
    descricao_longa TEXT
)
INSERT INTO indicadores_macroeconomicos(indicador, descricao_curta, descricao_longa) VALUES()
SELECT * FROM indicadores_macroeconomicos ORDER BY indicador ASC



CREATE TABLE historico_valores_indicadores_macroeconomicos (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    id_indicador_macroeconomico BIGINT NOT NULL REFERENCES indicadores_macroeconomicos(id),
    ano BIGINT NOT NULL,
    valor DOUBLE PRECISION NOT NULL,
    UNIQUE (id_indicador_macroeconomico, ano)
)
INSERT INTO historico_valores_indicadores_macroeconomicos(id_indicador_macroeconomico, ano, valor) VALUES ()
SELECT historico_valores_indicadores_macroeconomicos.id, ano, valor, id_indicador_macroeconomico FROM historico_valores_indicadores_macroeconomicos JOIN indicadores_macroeconomicos ON historico_valores_indicadores_macroeconomicos.id_indicador_macroeconomico = indicadores_macroeconomicos.id WHERE indicadores_macroeconomicos.indicador = $1 ORDER BY ano ASC

