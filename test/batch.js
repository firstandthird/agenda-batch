/*
	Tests for batch.js
*/
var expect = require('expect');

var Batch = require('../lib/batch.js');

describe('#()', function(){
  it('should instatiate properly', function(){
    
    var a = Batch('localhost:27017/batch-agenda-tests');

    expect(a).toBeA('AgendaBatch');
  });

});