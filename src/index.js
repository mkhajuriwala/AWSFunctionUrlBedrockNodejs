'use strict';
const {
	BedrockRuntimeClient,
	InvokeModelWithResponseStreamCommand} = require('@aws-sdk/client-bedrock-runtime'); // ES Modules import

const client = new BedrockRuntimeClient();

const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const { Transform } = require("stream");


exports.handler = awslambda.streamifyResponse(async (event, responseStream, context) => {

    const requestBody = JSON.parse(event.body);
    const metadata = {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain"
            }
    };

    const prompt= requestBody.prompt;

    const input = {
        body: `{"prompt": "Human: ${prompt}\\nAssistant:","max_tokens_to_sample": 300 ,"temperature": 1,"top_k": 250,"top_p": 0.999,"stop_sequences":["\\n\\nHuman:"],"anthropic_version": "bedrock-2023-05-31" }`,
        modelId: 'anthropic.claude-v2',
        accept: '*/*',
        contentType: 'application/json'
    };

    console.log(input);

    const command = new InvokeModelWithResponseStreamCommand(input);

    const data = await client.send(command);
    const decodedData = new Transform({
      objectMode: true,
      transform(body, encoding, callback) {
        try{
            const parsedData = JSON.parse(new TextDecoder().decode(body.chunk.bytes));
            //console.log(parsedData.completion);
            this.push(parsedData.completion);
            callback();
        } catch (error) {
            callback(error); // Handle parsing errors
        }
      },
    });

    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

    await pipeline(data.body, decodedData,responseStream)
    .then(() => {
        console.log('Pipeline completed');
      })
      .catch((error) => {
        console.error('Pipeline error:', error);
      });

});