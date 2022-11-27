----------------------------------------------- ARTIGOS -----------------------------------------------

CREATE TABLE artigos (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	titulo VARCHAR(30) NOT NULL UNIQUE,
	descricao VARCHAR(255) NOT NULL
);

CREATE TABLE conteudos_artigo (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	id_artigo BIGINT NOT NULL REFERENCES artigos(id),
	ordem_conteudo BIGINT NOT NULL,
    tipo_conteudo BIGINT NOT NULL REFERENCES tipos_conteudo(id),
	conteudo TEXT NOT NULL,
    url_imagem TEXT,
    url_link TEXT,
    UNIQUE (id_artigo, ordem_conteudo)
);

CREATE TABLE tipos_conteudo (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	tipo VARCHAR(255) NOT NULL UNIQUE
);

SELECT * FROM artigos;
SELECT * FROM conteudos_artigo WHERE id_artigo = $1 ORDER BY ordem_conteudo ASC;




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
    tem_grafico_divida BOOLEAN NOT NULL,
);

-- create companies_financial_data table
CREATE TABLE dados_financeiros_empresa (
	id BIGSERIAL NOT NULL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES empresas(id),
    ano BIGINT NOT NULL,

    ativo_circulante BIGINT NOT NULL,
    caixa_e_equivalentes BIGINT NOT NULL,
    ativo_nao_circulante BIGINT NOT NULL,
    ativo_realizavel_longo_prazo BIGINT NOT NULL,
    passivo_circulante BIGINT NOT NULL,
    emprestimos_curto_prazo BIGINT NOT NULL,
    passivo_nao_circulante BIGINT NOT NULL,
    emprestimos_longo_prazo BIGINT NOT NULL,

    receita_liquida BIGINT NOT NULL,
    lucro_bruto BIGINT NOT NULL,
    lucro_operacional BIGINT NOT NULL,
    lucro_liquido BIGINT NOT NULL,

    depreciacao_e_amortizacao BIGINT NOT NULL,
    provento_distribuido BIGINT NOT NULL,

    UNIQUE (id_empresa, ano)
);

SELECT * FROM empresas ORDER BY codigo_base ASC
SELECT * FROM empresas WHERE codigo_base = $1
SELECT * FROM dados_financeiros_empresa JOIN empresas ON dados_financeiros_empresa.id_empresa = empresas.id WHERE empresas.codigo_base = $1 ORDER BY ano ASC






