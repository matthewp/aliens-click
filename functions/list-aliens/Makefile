COMPILE=../../node_modules/.bin/compile

main.js:
	$(COMPILE) --format cjs src/index.js
.PHONY: main.js

main.zip: main.js
	zip $@ $^

clean:
	@rm -f main.js main.zip
.PHONY: clean

deploy: main.zip
	aws lambda update-function-code --function-name aliens_list-aliens --zip-file fileb://./$^
.PHONY: deploy
