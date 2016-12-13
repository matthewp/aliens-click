.PHONY: app watch serve template prod all

all: app templates

app:
	./node_modules/.bin/rollup -c rollup.config.js -o routes.js src/routes.js

templates:
	./node_modules/.bin/rollup src/server/index.js -c rollup.config.js -o server/templates.js -f cjs

serve:
	node server/index.js

prod:
	 BABEL_ENV=production make app

watch:
	find src -name "*.js" | entr make app

dev:
	make serve & make watch