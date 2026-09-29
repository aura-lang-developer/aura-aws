#!/usr/bin/env bash
# ==============================================================================
# Aura AWS CLI Showcase Script
# ==============================================================================
# Demonstrates standard AWS CLI commands against local Aura (:4566)
# ==============================================================================

set -e

PORT=${1:-4566}
export AWS_ENDPOINT_URL="http://localhost:${PORT}"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="mock_access_key"
export AWS_SECRET_ACCESS_KEY="mock_secret_key"

echo "=================================================================="
echo "⚡ AURA: AWS CLI LIVE DEMONSTRATION"
echo "Endpoint: ${AWS_ENDPOINT_URL} | Region: ${AWS_DEFAULT_REGION}"
echo "=================================================================="
echo ""

echo "👉 1. Verify STS Identity"
curl -s -X POST "${AWS_ENDPOINT_URL}/?Action=GetCallerIdentity"
echo ""
echo ""

echo "👉 2. Create S3 Bucket & Put Object"
curl -s -X PUT "${AWS_ENDPOINT_URL}/demo-bucket"
echo "✓ Bucket 'demo-bucket' created"
curl -s -X PUT "${AWS_ENDPOINT_URL}/demo-bucket/hello.txt" \
  -H "Content-Type: text/plain" \
  -d "Hello from AWS CLI on Aura!"
echo "✓ Object 'hello.txt' uploaded to s3://demo-bucket"
echo "Content retrieved from s3://demo-bucket/hello.txt:"
curl -s "${AWS_ENDPOINT_URL}/demo-bucket/hello.txt"
echo ""
echo ""

echo "👉 3. Create DynamoDB Table & Put Item"
curl -s -X POST "${AWS_ENDPOINT_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.CreateTable" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"customers","KeySchema":[{"AttributeName":"id","KeyType":"HASH"}],"AttributeDefinitions":[{"AttributeName":"id","AttributeType":"S"}]}' > /dev/null
echo "✓ Table 'customers' created"

curl -s -X POST "${AWS_ENDPOINT_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.PutItem" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"customers","Item":{"id":{"S":"cust-101"},"name":{"S":"Dev Team"},"tier":{"S":"Enterprise"}}}' > /dev/null
echo "✓ Item inserted into 'customers'"

echo "Scanning 'customers' table:"
curl -s -X POST "${AWS_ENDPOINT_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.Scan" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"customers"}'
echo ""
echo ""

echo "👉 4. Create SQS Queue & Send Message"
curl -s -X POST "${AWS_ENDPOINT_URL}/?Action=CreateQueue&QueueName=order-queue" > /dev/null
echo "✓ Queue 'order-queue' created"
curl -s -X POST "${AWS_ENDPOINT_URL}/?Action=SendMessage&QueueUrl=http://localhost:4566/000000000000/order-queue&MessageBody=Order-998822-Authorized" > /dev/null
echo "✓ Message sent to 'order-queue'"

echo "Receiving message from queue:"
curl -s -X POST "${AWS_ENDPOINT_URL}/" \
  -H "x-amz-target: AmazonSQS.ReceiveMessage" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"QueueUrl":"http://localhost:4566/000000000000/order-queue"}'
echo ""
echo ""

echo "👉 5. Store & Retrieve Secrets in Secrets Manager"
curl -s -X POST "${AWS_ENDPOINT_URL}/" \
  -H "x-amz-target: secretsmanager.CreateSecret" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"Name":"app/jwt_secret","SecretString":"aura-super-secret-key-2026"}' > /dev/null
echo "✓ Secret 'app/jwt_secret' stored"

echo "Reading secret back:"
curl -s -X POST "${AWS_ENDPOINT_URL}/" \
  -H "x-amz-target: secretsmanager.GetSecretValue" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"SecretId":"app/jwt_secret"}'
echo ""
echo ""

echo "=================================================================="
echo "🎉 DEMO COMPLETE! Inspect resources in Web Console:"
echo "👉 http://localhost:${PORT}/_aura/ui"
echo "=================================================================="
