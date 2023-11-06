'use strict';
const {
	BedrockRuntimeClient,
	InvokeModelWithResponseStreamCommand} = require('@aws-sdk/client-bedrock-runtime'); // ES Modules import

const client = new BedrockRuntimeClient();

const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const Readable = stream.Readable;
const { Transform } = require("stream");


exports.handler = awslambda.streamifyResponse(async (event, responseStream, context) => {

    const requestBody = JSON.parse(event.body);
    console.log(requestBody);
    const metadata = {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "X-Custom-Header": "Example-Custom-Header"
            }
    };

    //const prompt="Rewrite the sentence : "+requestBody.prompt;

    const prompt= requestBody.prompt;
    console.log(prompt);

    const input = {
        body: `{"prompt": "Human: ${prompt}\\nAssistant:","max_tokens_to_sample": 300 ,"temperature": 1,"top_k": 250,"top_p": 0.999,"stop_sequences":["\\n\\nHuman:"],"anthropic_version": "bedrock-2023-05-31" }`,
        modelId: 'anthropic.claude-v2',
        accept: '*/*',
        contentType: 'application/json'
    };

    console.log(input);

    const command = new InvokeModelWithResponseStreamCommand(input);

      let data, completion;
      data = await client.send(command);
      const decodedData = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        console.log("This is chunk "+JSON.stringify(chunk));
        callback(null, JSON.parse(new TextDecoder().decode(chunk.chunk.bytes)).completion);
      },
    });

    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

    var requestStream = require('stream').Readable;
    var streamInput = new Readable();
    streamInput.push(JSON.stringify(input));
    streamInput.push(null);


    await pipeline(data.body, decodedData,responseStream);

});