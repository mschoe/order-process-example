const { Client, logger, Variables } = require('camunda-external-task-client-js');
const got = require('got');

const config = { baseUrl: 'http://localhost:8080/engine-rest', workerId: 'cancel-payment-worker', use: logger, asyncResponseTimeout: 10000 };

const client = new Client(config);

client.subscribe('cancel-payment', async function({ task, taskService }) {

  try {
    const {body} = await got.post('http://localhost:8080/engine-rest/engine/default/message', {
      json: {
        "messageName" : "cancelOrderMessage",
        "businessKey" : task.businessKey,
        "processVariables" : {
          "transactionLimitExceeded" : {"value" : task.variables.get('transactionLimitExceeded')}
        }
      },
      responseType: 'json'
    });
    try {
      await taskService.complete(task);
      console.log(`${config.workerId} - Payment canceled for payment ID: ${task.businessKey}`);
    } catch (e) {
      console.error(`${config.workerId} - Failed completing, ${e}`);
    }
  } catch (rest_err) {
    console.error(`Failed to send paymentMessage, ${rest_err}`);
    await taskService.handleFailure(task, {
      errorMessage: rest_err.toString(),
      errorDetails: `${config.workerId} - Unable to send cancel payment for orderId: ${task.businessKey}`,
      retries: 0,
      retryTimeout: 1000
    });
  }
});