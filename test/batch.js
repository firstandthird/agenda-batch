/*
	Tests for batch.js
*/
var expect = require('expect.js');

var Agenda = require('agenda');
var Batch = require('../lib/batch.js');

agnd = new Agenda({db: {address: 'localhost:27017/batch-tests'}});

describe('#()', function(){

  it('should instatiate properly', function(){

    var a = new Batch(agnd);
    expect(a).to.be.a('object');

    var objKeys = Object.keys( a );
    expect(objKeys).to.eql(["batch"]);

  });

});

describe('#batch()',function() {
  beforeEach(function(done) {
    agnd.purge(function(e,n){
      done();
    });
  });

  it('should initiate a new batch job on the first round', function(done) {

    this.timeout(5000);

    var a = new Batch(agnd);

    agnd.define('test-job-a', function(e, j) {});

    a.batch('job-key', { email: 'test@example.com'}, 'in 1 second', 'test-job-a', function(e, job) {
      expect(e).to.be(null);
      expect(job.attrs.data.jobData).to.eql([{ email: 'test@example.com'}]);

      done();
    });
  });

  it('should batch data together on multiple calls', function(done) {
    var a = new Batch(agnd);

    agnd.define('test-job-b', function(e, j) {});

    a.batch('job-key-b', { email: 'len@example.com'}, 'in 1 second', 'test-job-b');

    var to = setTimeout(function() {
      a.batch('job-key-b', { email: 'jen@example.com'}, 'in 1 second', 'test-job-b', function(e, j) {
        expect(e).to.be(null);
        expect(j.attrs.data.jobData).to.eql([{email: 'len@example.com'},{email: 'jen@example.com'}])
        done();
      });
    }, 400);

  });

  it('should not collide with other keys');
});