# Be careful to keep \t instead of spaces in this file!
REPORTER = nyan
TESTS = test/*.js
test:
	./node_modules/.bin/mocha --timeout 5000 --reporter $(REPORTER) $(TESTS)

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	--growl \
	--watch
	$(TESTS)

.PHONY: test test-w