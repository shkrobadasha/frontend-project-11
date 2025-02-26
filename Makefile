develop:
	npx webpack serve -- --stats-error-details

install:
	npm ci

build:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .
fix-lint:
	npx eslint --fix .
.PHONY: test