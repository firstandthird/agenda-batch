## batch-agenda

A batching tool for the agenda.js tool that will proxy data to a task that has not been run.

Initialize the library:

```javascript
var Batch = require('batch');
batch = new Batch('db-connection:24717');
```

Define a new job 
```javascript
batch.define('job-name', cb);
```

Batch a process by calling the batch function.
```javascript
batch.batch('batch-key', { data }, 'in 40 minutes', 'job-name');
```

Subsequent calls to the batch function will add data to the original waiting job. Important note. The timing of existing jobs will not be reset. The purpose of the function is to be able to send additional data to jobs in the queue without having to care when they will fire.
```javascript
batch.batch('batch-key', { MORE-data }, 'in 40 minutes', 'job-name');
```

If required, the agenda instance is available for use.
```javascript
batch.agendaModule.every();
```
Take a look at lib/cli, or run it via `npm run cli` to see an example. Requires a mongo instance for agenda to run.