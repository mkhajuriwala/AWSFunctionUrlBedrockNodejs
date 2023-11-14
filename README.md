# AWSFunctionUrlBedrockNodejs
Streaming generative AI application in NodeJs

curl -X POST -H "Content-Type: application/json" -d '{"prompt":"write a paragraph on humanity?"}'  https://6uezyyf6wnznbla3ulr5r3mive0dnbei.lambda-url.us-east-1.on.aws/ --user <<credentials>> --aws-sigv4 'aws:amz:us-east-1:lambda' --no-buffer
