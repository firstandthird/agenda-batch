/*
  AgendaBatch
*/

var Agenda = require('agenda');

var AgendaBatch = function(dbConnection) {

  var selfObj = {};

  var init = function(dbConnect) {
    selfObj.agendaModule = new Agenda({ db: { address: dbConnection }});
    selfObj.agendaModule.on('complete', selfObj.cleanBatch.bind(selfObj) );
    selfObj.batchHash = {};
    return selfObj;
  }

  selfObj.batch = function(batchKey, data, processTime, jobName) {
    if ( this.batchHash[batchKey] !== undefined ) {
      // The key / job exists
      var job = this.batchHash[ batchKey ];
      job.attrs.data.jobData.push( data );
      this.agendaModule.saveJob(job);
    } else {
      // The key / job has not been spawned yet.
      var batchData = { key: batchKey, jobData: [] };
      batchData.jobData.push( data );
      this.batchHash[ batchKey ] = this.agendaModule.schedule(processTime, jobName, batchData );
    }
  }

  selfObj.define = function(jobName, options, processor) {
    if (!processor) {
      processor = options;
      options = {};
    }

    selfObj.agendaModule.define(jobName, options, processor);
  }

  selfObj.cleanBatch = function( job ) {
    if( selfObj.batchHash[ job.attrs.data.key ] !== undefined ) {
      delete selfObj.batchHash[ job.attrs.data.key ];
    }
  }

  return init(dbConnection);

}


module.exports = function(dbConn) {
  return AgendaBatch(dbConn);
}