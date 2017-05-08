.PHONY: app watch serve prod main release copy all

all: app main

app:
	./node_modules/.bin/rollup -c rollup.config.js -o ./public/app.js src/IndexPage.js

main:
	./node_modules/.bin/rollup -c rollup.config.js -o ./public/main.js src/window/main.js

copy:
	cp ./node_modules/@webcomponents/custom-elements/custom-elements.min.js ./public/ce.js
	cp ./node_modules/cloudydom/cloudydom.min.js ./public/sd.js

serve:
	node lib/index.js

release: copy
	BABEL_ENV=production make all
	node scripts/sw.js

watch:
	find src -name "*.js" | entr make all

dev:
	make serve & make watch
