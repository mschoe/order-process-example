const { Client, logger, Variables } = require('camunda-external-task-client-js');
const got = require('got');

const config = { baseUrl: 'http://localhost:8080/engine-rest', workerId: 'confirm-payment-worker', use: logger, asyncResponseTimeout: 10000 };

const client = new Client(config);

client.subscribe('confirm-payment', async function({ task, taskService }) {
  
  const orderId = task.businessKey;

  try {
    const {body} = await got.post('http://localhost:8080/engine-rest/engine/default/message', {
      json: {
        "messageName" : "paymentConfirmationMessage",
        "businessKey" : task.businessKey  
      },
      responseType: 'json'
    });
    try {
      await taskService.complete(task);
      console.log(`${config.workerId} - Payment fulfilled: ${task.businessKey}.`);
    } catch (e) {
      console.error(`${config.workerId} - Failed completing, ${e}`);
    }
  } catch (rest_err) {
    console.error(`Failed to send paymentConfirmationMessage, ${rest_err}`);
    await taskService.handleFailure(task, {
      errorMessage: rest_err.toString(),
      errorDetails: `${config.workerId} - Unable to send paymentConfirmationMessage for orderId: ${orderId}`,
      retries: 0,
      retryTimeout: 1000
    });
  }
});