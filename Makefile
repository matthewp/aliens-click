.PHONY: app watch serve template prod win all

all: app main

app:
	./node_modules/.bin/rollup -c rollup.config.js -o app.js src/routes.js

main:
	./node_modules/.bin/rollup -c rollup.config.js -o main.js src/window/main.js

templates:
	./node_modules/.bin/rollup src/templates.js -c rollup.config.js -o server/templates.js -f cjs

serve:
	node server/index.js

release:
	BABEL_ENV=production make all
	node scripts/sw.js

watch:
	find src -name "*.js" | entr make all

dev:
	make serve & make watch
