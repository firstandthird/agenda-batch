/*
  AgendaBatch
*/

var Agenda = require('agenda');

var AgendaBatch = function(agendaModule) {

  var selfObj = {};

  var init = function(agendaMod) {
    selfObj.agendaModule = agendaMod;
    selfObj.agendaModule.on('complete', selfObj.cleanBatch.bind(selfObj) );

    return selfObj;
  }

  var spawnNewJob = function(batchKey, data, processTime, jobName) {
    var batchData = { key: batchKey, jobData: [] };
    batchData.jobData.push( data );
    return selfObj.agendaModule.schedule(processTime, jobName, batchData );
  }

  var updateExistingJob = function( job, data ) {
    job.attrs.data.jobData.push( data );
    selfObj.agendaModule.saveJob(job);
  }

  selfObj.batch = function(batchKey, data, processTime, jobName, cb) {

    if ( cb == undefined ) {
      cb = function(err, job) {};
    }

    // REFACTOR
    selfObj.agendaModule.jobs( { 'data.key': batchKey }, function(err, jobs) {
      if ( err !== null ) {
        cb(err, null);
        return;
      }

      if ( jobs.length == 0 ) {
        // No Jobs we're found... better make one up!
        newJob = spawnNewJob(batchKey, data, processTime, jobName);
        cb(null, newJob);

        return;
      }

      if ( jobs.length > 1 ) {
        // There is more than one job with this key in the system. wtf?
        // Let's append the data to the last job that is not running.
        var job = null;

        for ( var i = (jobs.length - 1); i == 0; i--) {
          var proxJob = jobs[i];
          if ( proxJob.isRunning() !== false ) {
            job = proxJob;
            updateExistingJob( job, batchData );
          }
        }

        if ( job === null ) {
          // No Non Running Job was found. Double wtf? Oh Well, let's spawn a new one.
          job = spawnNewJob(batchKey, data, processTime, jobName);
        }

        cb(null, job);
        return;
      }
      var job = jobs[0];
      if ( job.isRunning() === false ) {
        updateExistingJob( job, data );
      } else {
        // Job be running, time to spawn a new one!
        job = spawnNewJob(batchKey, data, processTime, jobName);
      }

      cb( null, job );

    });
  }

  selfObj.cleanBatch = function( job ) {
    job.remove(function(err, count) {});
  }

  return init(agendaModule);
}

module.exports = function(dbConn) {
  return AgendaBatch(dbConn);
}