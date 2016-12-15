.PHONY: app watch serve template prod all

all: app templates

app:
	./node_modules/.bin/rollup -c rollup.config.js -o routes.js src/routes.js

templates:
	./node_modules/.bin/rollup src/templates.js -c rollup.config.js -o server/templates.js -f cjs

serve:
	node server/index.js

release:
	BABEL_ENV=production make all
	node scripts/sw.js

watch:
	find src -name "*.js" | entr make app

dev:
	make serve & make watch
