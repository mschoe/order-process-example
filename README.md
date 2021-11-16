# Order Process
A simple order process for the Camunda Automation Platform using the camunda-external-task-client-js 

## What is required?
* NodeJS >= v10  
* Developed and tested against [camunda-external-task-client-js](https://github.com/camunda/camunda-external-task-client-js) v2.1.1 and 
* [camunda automation platform run](https://camunda.com/download/) v7.16  

## How to run it
* start the [Camunda engine](https://camunda.com/download/)
* deploy the [bpmn/dmn models](src/assets)
* Create a node project:
```sh
npm init -y
```
* Install dependencies:
```sh
npm install camunda-external-task-client-js
npm install got
```
* Start the external task worker
```sh
node ./worker-name.js
```

## Show me the interesting stuff
The example consists of two processes, the [order process](src/assets/order-process.bpmn) and the [payment process](src/assets/payment-process.bpmn). The order process creates all order relevant data like order ID, items, item price, item quantity, discount calculation and triggers the payment process via message. The payment process will acknowledge the payment or will be canceled in case of exceeding a transaction limit if credit card payment is needed.  
All service tasks are implemented as external tasks and use the [camunda-external-task-client-js](https://github.com/camunda/camunda-external-task-client-js) to communicate with the engine.  
The following topics are covered in this example: [external task pattern](https://docs.camunda.org/manual/7.16/user-guide/process-engine/external-tasks/), error handling with external tasks, [message correlation](https://docs.camunda.org/manual/7.16/reference/bpmn20/events/message-events/), [compensation events](https://docs.camunda.org/manual/7.16/reference/bpmn20/events/cancel-and-compensation-events/#compensation-events), [dmn tables](https://docs.camunda.org/manual/7.16/reference/dmn/).

## What about testing?
The happy path of the payment process s tested with a Postman Collection. Proceed the following steps to run the test suit:  
* Import the prepared [Postman collection](src/test/order-process-tests.postman_collection.json) into your Postman
* Select the [payment.bpmn](src/assets/payment-process.bpmn) process model in the deploy request
* Run the collection.
