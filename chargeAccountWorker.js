const { Client, logger, Variables } = require('camunda-external-task-client-js');

const config = { baseUrl: 'http://localhost:8080/engine-rest', workerId: 'charge-account-worker', use: logger, asyncResponseTimeout: 10000 };

const client = new Client(config);

client.subscribe('charge-account', async function({ task, taskService }) {

  var accountBalance = 67.32;
  const amount = task.variables.get('amount');
  const resultVars = new Variables();

  var difference = accountBalance - amount;
  // round discount price to 2 decimal places
  var m = Number((Math.abs(difference) * 100).toPrecision(15));
  difference =  Math.round(m) / 100 * Math.sign(difference);

  if( typeof amount == 'undefined') {

    await taskService.handleFailure(task, {
      errorMessage: "Variable amount is undefined",
      errorDetails: "the process variable amount is missing or undefined",
      retries: 0,
      retryTimeout: 1000
    });
  } else {
    if (difference >= 0) {
      accountBalance = difference
      resultVars.set("creditSufficient", true);
    } else {
      accountBalance = 0
      resultVars.set("remainingAmount", difference);
      resultVars.set("creditSufficient", false);
    }
  
    try {
      await taskService.complete(task, resultVars);
      console.log(`${config.workerId} - completed for payment ID: ${task.businessKey}. New blance: ${accountBalance}€`);
    } catch (e) {
      console.error(`${config.workerId} - Failed completing, ${e}`);
    }
  }
});