----------------------------------------------- ARTICLES -----------------------------------------------

CREATE TABLE artigos (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	titulo VARCHAR(30) NOT NULL UNIQUE,
	descricao VARCHAR(255) NOT NULL
)

CREATE TABLE conteudos_artigo (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	id_artigo BIGINT NOT NULL REFERENCES artigos(id),
	ordem_conteudo BIGINT NOT NULL,
    tipo_conteudo BIGINT NOT NULL REFERENCES tipos_conteudo(id),
	conteudo TEXT NOT NULL,
    url_imagem TEXT,
    url_link TEXT,
    UNIQUE (id_artigo, ordem_conteudo)
)

CREATE TABLE tipos_conteudo (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	tipo VARCHAR(255) NOT NULL UNIQUE
)

SELECT * FROM artigos
SELECT * FROM conteudos_artigo WHERE id_artigo = $1 ORDER BY ordem_conteudo ASC




----------------------------------------------- COMPANIES -----------------------------------------------

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
)

INSERT INTO empresas (nome_empresarial, cnpj, classificacao_setorial, atividade_principal, segmento_listagem, codigo_base, codigos_negociacao, escriturador, instituicao_financeira) VALUES ()



CREATE TABLE dados_financeiros_empresa (
	id BIGSERIAL NOT NULL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES empresas(id),
    ano BIGINT NOT NULL,

    ativo_total BIGINT,
    ativo_circulante BIGINT,
    caixa_e_equivalentes BIGINT,
    ativo_nao_circulante BIGINT,
    ativo_realizavel_longo_prazo BIGINT,
    passivo_total BIGINT,
    passivo_circulante BIGINT,
    emprestimos_curto_prazo BIGINT,
    passivo_nao_circulante BIGINT,
    emprestimos_longo_prazo BIGINT,
    patrimonio_liquido BIGINT,

    receita_liquida BIGINT NOT NULL,
    lucro_bruto BIGINT NOT NULL,
    lucro_operacional BIGINT NOT NULL,
    lucro_liquido BIGINT NOT NULL,

    depreciacao_e_amortizacao BIGINT NOT NULL,
    provento_distribuido BIGINT NOT NULL,

    UNIQUE (id_empresa, ano)
)

-- for no financial institutions
INSERT INTO dados_financeiros_empresa (id_empresa, ano, ativo_circulante, caixa_e_equivalentes, ativo_nao_circulante, ativo_realizavel_longo_prazo, passivo_circulante, emprestimos_curto_prazo, passivo_nao_circulante, emprestimos_longo_prazo, receita_liquida, lucro_bruto, lucro_operacional, lucro_liquido, depreciacao_e_amortizacao, provento_distribuido) VALUES ()

-- for financial institutions
INSERT INTO dados_financeiros_empresa (id_empresa, ano, ativo_total, caixa_e_equivalentes, passivo_total, patrimonio_liquido, receita_liquida, lucro_bruto, lucro_operacional, lucro_liquido, depreciacao_e_amortizacao, provento_distribuido) VALUES ()



SELECT * FROM empresas ORDER BY codigo_base ASC
SELECT * FROM empresas WHERE codigo_base = $1
SELECT * FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE empresas.codigo_base = $1 ORDER BY ano ASC



----------------------------------------------- MACROECONOMICS -----------------------------------------------

CREATE TABLE indicadores_macroeconomicos (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    indicador VARCHAR(10) NOT NULL UNIQUE,
    descricao_curta VARCHAR(50),
    descricao_longa TEXT
)

INSERT INTO indicadores_macroeconomicos(indicador, descricao_curta, descricao_longa) VALUES()



CREATE TABLE historico_valores_indicadores_macroeconomicos (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    id_indicador_macroeconomico BIGINT NOT NULL REFERENCES indicadores_macroeconomicos(id),
    ano BIGINT NOT NULL,
    valor DOUBLE PRECISION NOT NULL,
    UNIQUE (id_indicador_macroeconomico, ano)
)

INSERT INTO historico_valores_indicadores_macroeconomicos(id_indicador_macroeconomico, ano, valor) VALUES ()
