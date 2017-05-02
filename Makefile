.PHONY: app watch serve prod main release all

all: app main

app:
	./node_modules/.bin/rollup -c rollup.config.js -o app.js src/IndexPage.js

main:
	./node_modules/.bin/rollup -c rollup.config.js -o main.js src/window/main.js

serve:
	node lib/index.js

release:
	BABEL_ENV=production make all
	node scripts/sw.js

watch:
	find src -name "*.js" | entr make all

dev:
	make serve & make watch
