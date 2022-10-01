----------------------------------------------- ARTICLES -----------------------------------------------

-- create articles table
CREATE TABLE articles (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	title VARCHAR(30) NOT NULL UNIQUE,
	description VARCHAR(255) NOT NULL
);

-- create article_contents table
CREATE TABLE article_contents (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	article_id BIGINT NOT NULL REFERENCES articles(id),
	content_order BIGINT NOT NULL,
    content_type BIGINT NOT NULL REFERENCES content_types(id),
    image_alt TEXT,
	content TEXT NOT NULL
    UNIQUE (article_id, content_order)
);

-- create content_types lookup table
CREATE TABLE content_types (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	type VARCHAR(255) NOT NULL UNIQUE
);

-- get individual article
SELECT * FROM articles;

-- get all the contents of an individual article ordered
SELECT * FROM article_contents WHERE article_id = $1 ORDER BY content_order ASC;




----------------------------------------------- STOCKS PROFIT -----------------------------------------------

-- create companies table
CREATE TABLE companies (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    code VARCHAR(255) NOT NULL UNIQUE,
    company VARCHAR(255) NOT NULL UNIQUE,
    listing_segment VARCHAR(50) NOT NULL,
    bookkeeper VARCHAR(50) NOT NULL,
    sectoral_classification VARCHAR(50) NOT NULL,
    main_activity VARCHAR(50) NOT NULL,
);

-- create companies_financial_data table
CREATE TABLE companies_financial_data (
	id BIGSERIAL NOT NULL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    year BIGINT NOT NULL,	
    cash_and_cash_equivalents BIGINT NOT NULL,
    short_term_loans_and_financings BIGINT NOT NULL,
    long_term_loans_and_financings BIGINT NOT NULL,
    equity BIGINT NOT NULL,
    assets BIGINT NOT NULL,
    net_revenue BIGINT NOT NULL,
    operating_income BIGINT NOT NULL,
    net_income BIGINT NOT NULL,
    depreciation_and_amortization BIGINT NOT NULL,
    UNIQUE (company_id, year)
);

-- get all companies from database ordered alphabetically by code
SELECT * FROM companies ORDER BY code ASC

-- get general data of an individual company
SELECT * FROM companies WHERE code = $1

-- get the financial data of an individual company ordered by year
SELECT * FROM companies_financial_data JOIN companies ON companies_financial_data.company_id = companies.id WHERE companies.code = $1 ORDER BY year ASC






