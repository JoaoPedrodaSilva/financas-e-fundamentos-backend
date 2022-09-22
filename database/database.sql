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
    company VARCHAR(255) NOT NULL UNIQUE
);

-- create stocks_profit table
CREATE TABLE stocks_profit (
	id BIGSERIAL NOT NULL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    year BIGINT NOT NULL,
	net_profit BIGINT NOT NULL,
    UNIQUE (company_id, year)
);

-- get all companies from database ordered alphabetically by code
SELECT * FROM companies ORDER BY code ASC

-- get general data of an individual company
SELECT * FROM companies WHERE id = $1

-- get the profit history of an individual company ordered by year
SELECT year, net_profit FROM stocks_profit WHERE company_id = $1 ORDER BY year ASC






