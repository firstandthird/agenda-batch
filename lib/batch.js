/*
  AgendaBatch
*/

var Agenda = require('agenda');

var AgendaBatch = module.exports = function(dbConnection) {
  var self = this;

  self.agendaModule = new Agenda({ db: { address: dbConnection }});
  self.agendaModule.on('complete', self.cleanBatch.bind(self) );

  self.batchHash = {};
}

AgendaBatch.prototype.define = function(jobName, options, processor) {
  if (!processor) {
    processor = options;
    options = {};
  }

  this.agendaModule.define(jobName, options, processor);
}

AgendaBatch.prototype.batch = function(batchKey, data, processTime, jobName) {
  if ( this.batchHash[batchKey] !== undefined ) {
    // The key / job exists
    console.log('Job Exists');
    var job = this.batchHash[ batchKey ];
    job.attrs.data.jobData.push( data );
    this.agendaModule.saveJob(job);
  } else {
    // The key / job has not been spawned yet.
    console.log('There is no job like this yet');
    var batchData = { key: batchKey, jobData: [] };
    batchData.jobData.push( data );
    this.batchHash[ batchKey ] = this.agendaModule.schedule(processTime, jobName, batchData );
  }
}

AgendaBatch.prototype.cleanBatch = function( job ) {
  delete this.batchHash[ job.attrs.data.key ];
}

AgendaBatch.prototype.batchEvery = function() {
  // Future stub, in case agenda.every is required for some reason.
}

