const { Client, logger, Variables } = require('camunda-external-task-client-js');
const got = require('got');

const config = { baseUrl: 'http://localhost:8080/engine-rest', workerId: 'request-payment-worker', use: logger, asyncResponseTimeout: 10000 };

const client = new Client(config);

client.subscribe('request-payment', async function({ task, taskService }) {
  
  const orderId = task.businessKey;
  const amount = task.variables.get('amount');

  try {
    const {body} = await got.post('http://localhost:8090/engine-rest/engine/default/message', {
      json: {
        "messageName" : "paymentMessage",
        "businessKey" : orderId,
        "processVariables" : {
          "amount" : {"value" : amount}   
        }
      },
      responseType: 'json'
    });
    try {
      await taskService.complete(task);
      console.log(`${config.workerId} - Payment requested: ${orderId}.`);
    } catch (e) {
      console.error(`${config.workerId} - Failed completing, ${e}`);
    }
  } catch (rest_err) {
    console.error(`${config.workerId} - Failed to send paymentMessage, ${rest_err}`);
    await taskService.handleFailure(task, {
      errorMessage: rest_err.toString(),
      errorDetails: `${config.workerId} - Unable to send paymentMessage for orderId: ${orderId}`,
      retries: 0,
      retryTimeout: 1000
    });
  }
});