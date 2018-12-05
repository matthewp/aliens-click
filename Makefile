
deploy-s3:
	aws s3 sync public s3://static.aliens.click
.PHONY: deploy-s3

serve:
	NODE_ENV=development node lib/index.js
.PHONY: serve

dev:
	make serve
.PHONY: dev