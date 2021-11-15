const { Client, logger, Variables } = require('camunda-external-task-client-js');

const config = { baseUrl: 'http://localhost:8080/engine-rest', workerId: 'charge-creditcard-worker', use: logger, asyncResponseTimeout: 10000 };

const client = new Client(config);

client.subscribe('charge-creditcard', async function({ task, taskService }) {
   
  const amount = task.variables.get('remainingAmount');
  const resultVars = new Variables(); 
  var newId = task.businessKey.toString().substring(9);
  resultVars.set("transactionId", 'trns-' + newId);
    
  const transactionLimit = 150;
  //check if transaction limit has been exceeded
  if (Math.abs(amount) > transactionLimit) {
    var diff = Math.abs(amount) - transactionLimit
    resultVars.set('transactionLimitExceeded', true);

    await taskService.handleBpmnError(task, "err_transactionLimit", `Transaction limit exceeded by ${diff}`, resultVars);
    console.log(`${config.workerId} - Credit card limit exceeded. Value: ${amount} Transaction limit: ${transactionLimit}`);
  } else {
    try {
      await taskService.complete(task, resultVars);
      console.log(`${config.workerId} - completed for payment ID: ${task.businessKey}. Charged ${Math.abs(amount)}€`);
    } catch (e) {
      console.error(`${config.workerId} - Failed completing, ${e}`);
    }
  }
});