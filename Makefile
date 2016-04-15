# Be careful to keep \t instead of spaces in this file!
REPORTER = nyan
#REPORTER = dot

TESTS = test/*.js
VISUALS_TESTS = test/visuals/*.js
PERMISSIONS_TESTS = test/permissions/*.js


test:
	./node_modules/.bin/mocha \
		--timeout 5000 --reporter $(REPORTER) $(TESTS)

test-visuals:
	./node_modules/.bin/mocha \
		--timeout 5000 --reporter $(REPORTER) $(VISUALS_TESTS)

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	--growl \
	--watch \
	$(TESTS)

.PHONY: test test-w

