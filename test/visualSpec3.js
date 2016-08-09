var assert = require('assert'),
test = require('selenium-webdriver/testing'),
webdriver = require('selenium-webdriver');

// test.describe('Google Search', function() {
//   test.it('should work', function() {
//     var driver = new webdriver.Builder().
//     withCapabilities(webdriver.Capabilities.chrome()).
//     build();
// driver.get('http://www.google.com');
//     var searchBox = driver.findElement(webdriver.By.name('q'));
//     searchBox.sendKeys('simple programmer');
//     searchBox.getAttribute('value').then(function(value) {
//       assert.equal(value, 'simple programmer');
//     });
//     driver.quit();
//   });
// });

test.describe('VAMPS Search', function() {
  test.it('should work', function() {
    var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();
driver.get('http://localhost:3000/visuals/unit_selection');
    var nextButton = driver.findElement(webdriver.By.name('get_graphics'));

    nextButton.click()
    //searchBox.sendKeys('simple programmer');
    //searchBox.getAttribute('value').then(function(value) {
    //  assert.equal(value, 'simple programmer');
    //});
    driver.quit();
  });
});

