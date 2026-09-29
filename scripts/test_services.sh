#!/usr/bin/env bash
# ==============================================================================
# Aura Integration Test Suite
# ==============================================================================
# Tests all 12 emulated AWS services and system endpoints
# ==============================================================================

set -e

PORT=${1:-4566}
BASE_URL="http://localhost:${PORT}"

echo "=================================================================="
echo "🧪 RUNNING AURA INTEGRATION TEST SUITE"
echo "Target Endpoint: ${BASE_URL}"
echo "=================================================================="

pass_count=0
fail_count=0

assert_test() {
  local name="$1"
  local expected="$2"
  local actual="$3"

  if [[ "$actual" == *"$expected"* ]]; then
    echo "  [PASS] $name"
    pass_count=$((pass_count + 1))
  else
    echo "  [FAIL] $name"
    echo "         Expected to contain: $expected"
    echo "         Actual output: $actual"
    fail_count=$((fail_count + 1))
  fi
}

echo ""
echo "--- 1. System & Health Endpoints ---"

RES_HEALTH=$(curl -s "${BASE_URL}/_aura/health")
assert_test "Health Endpoint" '"status":"healthy"' "$RES_HEALTH"

RES_INFO=$(curl -s "${BASE_URL}/_aura/info")
assert_test "Info Endpoint" '"name":"Aura"' "$RES_INFO"

RES_STATS=$(curl -s "${BASE_URL}/_aura/stats")
assert_test "Stats Endpoint" '"memoryMb":8.4' "$RES_STATS"

RES_RESOURCES=$(curl -s "${BASE_URL}/_aura/api/resources")
assert_test "Unified Resources Endpoint" '"s3":' "$RES_RESOURCES"

RES_CLEAR_REQ=$(curl -s -X POST "${BASE_URL}/_aura/clear-requests")
assert_test "Clear Requests Endpoint" '"success":true' "$RES_CLEAR_REQ"

RES_UI=$(curl -s "${BASE_URL}/_aura/ui" | head -n 10)
assert_test "Web Console Serving" 'Aura Console' "$RES_UI"

RES_SITE=$(curl -s "${BASE_URL}/site" | head -n 10)
assert_test "Promotional Website Serving" 'Aura · Ultra-Fast Local Cloud Emulator' "$RES_SITE"

echo ""
echo "--- 2. Amazon S3 Storage ---"

# S3 Create Bucket
RES_MB=$(curl -s -X PUT "${BASE_URL}/prod-assets" -w "%{http_code}")
assert_test "S3 Create Bucket" "200" "$RES_MB"

# S3 List Buckets
RES_LS=$(curl -s "${BASE_URL}/")
assert_test "S3 List Buckets XML" '<Name>prod-assets</Name>' "$RES_LS"

# S3 Put Object
RES_PUT_OBJ=$(curl -s -X PUT "${BASE_URL}/prod-assets/config.json" \
  -H "Content-Type: application/json" \
  -d '{"appName":"aura-test","version":"2.0"}' -w "%{http_code}")
assert_test "S3 Put Object" "200" "$RES_PUT_OBJ"

# S3 Get Object
RES_GET_OBJ=$(curl -s "${BASE_URL}/prod-assets/config.json")
assert_test "S3 Get Object Content" '"appName":"aura-test"' "$RES_GET_OBJ"

# S3 List Objects inside Bucket
RES_LIST_OBJS=$(curl -s "${BASE_URL}/prod-assets")
assert_test "S3 List Objects XML" '<Key>config.json</Key>' "$RES_LIST_OBJS"

# S3 Prefix Filtering
RES_LIST_PREFIX=$(curl -s "${BASE_URL}/prod-assets?prefix=conf")
assert_test "S3 Prefix Filtering" '<Key>config.json</Key>' "$RES_LIST_PREFIX"

# S3 Multipart Upload Initiation
RES_MP_INIT=$(curl -s -X POST "${BASE_URL}/prod-assets/bundle.tar.gz?uploads")
assert_test "S3 Multipart Upload Init" '<InitiateMultipartUploadResult' "$RES_MP_INIT"

echo ""
echo "--- 3. Amazon DynamoDB ---"

# Create Table
RES_DYN_CREATE=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.CreateTable" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"orders","KeySchema":[{"AttributeName":"id","KeyType":"HASH"}],"AttributeDefinitions":[{"AttributeName":"id","AttributeType":"S"}]}')
assert_test "DynamoDB CreateTable" '"TableName":"orders"' "$RES_DYN_CREATE"

# List Tables
RES_DYN_LIST=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.ListTables" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{}')
assert_test "DynamoDB ListTables" '"orders"' "$RES_DYN_LIST"

# Put Item
RES_DYN_PUT=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.PutItem" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"orders","Item":{"id":{"S":"ord-9988"},"amount":{"N":"150"},"status":{"S":"COMPLETED"}}}')
assert_test "DynamoDB PutItem" '{}' "$RES_DYN_PUT"

# Scan Table
RES_DYN_SCAN=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.Scan" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"orders"}')
assert_test "DynamoDB Scan Items" '"id":{"S":"ord-9988"}' "$RES_DYN_SCAN"

# Update Item
RES_DYN_UPDATE=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.UpdateItem" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"orders","Key":{"id":{"S":"ord-9988"},"status":{"S":"SHIPPED"}}}')
assert_test "DynamoDB UpdateItem" 'Attributes' "$RES_DYN_UPDATE"

# Delete Item
RES_DYN_DEL=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: DynamoDB_20120810.DeleteItem" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"orders","Key":{"id":{"S":"ord-9988"}}}')
assert_test "DynamoDB DeleteItem" '{}' "$RES_DYN_DEL"

echo ""
echo "--- 4. Amazon SQS Queues ---"

# Create Queue
RES_SQS_CREATE=$(curl -s -X POST "${BASE_URL}/?Action=CreateQueue&QueueName=task-queue")
assert_test "SQS CreateQueue XML" 'task-queue' "$RES_SQS_CREATE"

# Get Queue URL
RES_SQS_GET_URL=$(curl -s -X POST "${BASE_URL}/?Action=GetQueueUrl&QueueName=task-queue")
assert_test "SQS GetQueueUrl" 'GetQueueUrlResult' "$RES_SQS_GET_URL"

# Send Message
RES_SQS_SEND=$(curl -s -X POST "${BASE_URL}/?Action=SendMessage&QueueUrl=http://localhost:4566/000000000000/task-queue&MessageBody=process-job-42")
assert_test "SQS SendMessage" 'SendMessageResult' "$RES_SQS_SEND"

# Receive Message
RES_SQS_RECV=$(curl -s -X POST "${BASE_URL}/" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -H "x-amz-target: AmazonSQS.ReceiveMessage" \
  -d '{"QueueUrl":"http://localhost:4566/000000000000/task-queue"}')
assert_test "SQS ReceiveMessage JSON" 'process-job-42' "$RES_SQS_RECV"

# Delete Message
RES_SQS_DEL=$(curl -s -X POST "${BASE_URL}/?Action=DeleteMessage&QueueUrl=http://localhost:4566/000000000000/task-queue&ReceiptHandle=rcpt-any")
assert_test "SQS DeleteMessage" 'DeleteMessageResponse' "$RES_SQS_DEL"

echo ""
echo "--- 5. Amazon SNS & Event Fanout ---"

# Create Topic
RES_SNS_TOPIC=$(curl -s -X POST "${BASE_URL}/?Action=CreateTopic&Name=billing-events")
assert_test "SNS CreateTopic" 'arn:aws:sns:us-east-1:000000000000:billing-events' "$RES_SNS_TOPIC"

# Subscribe Queue to Topic
RES_SNS_SUB=$(curl -s -X POST "${BASE_URL}/?Action=Subscribe&TopicArn=arn:aws:sns:us-east-1:000000000000:billing-events&Protocol=sqs&Endpoint=http://localhost:4566/000000000000/task-queue")
assert_test "SNS Subscribe" 'SubscriptionArn' "$RES_SNS_SUB"

# List Subscriptions
RES_SNS_LIST_SUBS=$(curl -s -X POST "${BASE_URL}/?Action=ListSubscriptions")
assert_test "SNS ListSubscriptions" 'ListSubscriptionsResult' "$RES_SNS_LIST_SUBS"

# Publish Notification
RES_SNS_PUB=$(curl -s -X POST "${BASE_URL}/?Action=Publish&TopicArn=arn:aws:sns:us-east-1:000000000000:billing-events&Message=invoice-created-99")
assert_test "SNS Publish" 'PublishResult' "$RES_SNS_PUB"

# Delete Topic
RES_SNS_DEL=$(curl -s -X POST "${BASE_URL}/?Action=DeleteTopic&TopicArn=arn:aws:sns:us-east-1:000000000000:billing-events")
assert_test "SNS DeleteTopic" 'DeleteTopicResponse' "$RES_SNS_DEL"

echo ""
echo "--- 6. AWS STS & IAM ---"

# STS GetCallerIdentity
RES_STS=$(curl -s -X POST "${BASE_URL}/?Action=GetCallerIdentity")
assert_test "STS GetCallerIdentity" 'arn:aws:iam::000000000000:root' "$RES_STS"

# STS AssumeRole
RES_STS_ASSUME=$(curl -s -X POST "${BASE_URL}/?Action=AssumeRole&RoleArn=arn:aws:iam::000000000000:role/deploy-role&RoleSessionName=deploy-session")
assert_test "STS AssumeRole" 'AccessKeyId' "$RES_STS_ASSUME"

# IAM CreateUser
RES_IAM=$(curl -s -X POST "${BASE_URL}/?Action=CreateUser&UserName=ci-pipeline")
assert_test "IAM CreateUser" 'ci-pipeline' "$RES_IAM"

# IAM CreateRole
RES_IAM_ROLE=$(curl -s -X POST "${BASE_URL}/?Action=CreateRole&RoleName=deploy-role")
assert_test "IAM CreateRole" 'deploy-role' "$RES_IAM_ROLE"

# IAM ListRoles
RES_IAM_LIST_ROLES=$(curl -s -X POST "${BASE_URL}/?Action=ListRoles")
assert_test "IAM ListRoles" 'deploy-role' "$RES_IAM_LIST_ROLES"

echo ""
echo "--- 7. AWS KMS ---"

# Create Key
RES_KMS_CREATE=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: TrentService.CreateKey" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"Description":"App Key"}')
assert_test "KMS CreateKey" 'KeyMetadata' "$RES_KMS_CREATE"

# Encrypt
RES_KMS_ENC=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: TrentService.Encrypt" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"KeyId":"default","Plaintext":"secret-token"}')
assert_test "KMS Encrypt" 'CiphertextBlob' "$RES_KMS_ENC"

# DescribeKey
RES_KMS_DESC=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: TrentService.DescribeKey" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"KeyId":"default"}')
assert_test "KMS DescribeKey" 'KeyMetadata' "$RES_KMS_DESC"

echo ""
echo "--- 8. AWS Secrets Manager & SSM ---"

# Create Secret
RES_SEC_CREATE=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: secretsmanager.CreateSecret" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"Name":"app/database","SecretString":"pg://usr:pwd@localhost/db"}')
assert_test "SecretsManager CreateSecret" 'app/database' "$RES_SEC_CREATE"

# Get Secret
RES_SEC_GET=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: secretsmanager.GetSecretValue" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"SecretId":"app/database"}')
assert_test "SecretsManager GetSecretValue" 'pg://usr:pwd@localhost/db' "$RES_SEC_GET"

# Put Secret Value (Update)
RES_SEC_PUT=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: secretsmanager.PutSecretValue" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"SecretId":"app/database","SecretString":"pg://usr:newpwd@localhost/db"}')
assert_test "SecretsManager PutSecretValue" 'app/database' "$RES_SEC_PUT"

# Delete Secret
RES_SEC_DEL=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: secretsmanager.DeleteSecret" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"SecretId":"app/database"}')
assert_test "SecretsManager DeleteSecret" 'app/database' "$RES_SEC_DEL"

# Put SSM Parameter
RES_SSM_PUT=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: AmazonSSM.PutParameter" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"Name":"/app/mode","Value":"fast","Type":"String"}')
assert_test "SSM PutParameter" '"Tier":"Standard"' "$RES_SSM_PUT"

# Get SSM Parameter
RES_SSM_GET=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: AmazonSSM.GetParameter" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"Name":"/app/mode"}')
assert_test "SSM GetParameter" '"Value":"fast"' "$RES_SSM_GET"

# Delete SSM Parameter
RES_SSM_DEL=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: AmazonSSM.DeleteParameter" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"Name":"/app/mode"}')
assert_test "SSM DeleteParameter" '{}' "$RES_SSM_DEL"

echo ""
echo "--- 9. AWS Lambda Serverless ---"

# Create Function
RES_LAMBDA_CREATE=$(curl -s -X POST "${BASE_URL}/2015-03-31/functions" \
  -H "Content-Type: application/json" \
  -d '{"FunctionName":"orderWorker","Runtime":"nodejs20.x","Handler":"index.handler"}')
assert_test "Lambda CreateFunction" '"name":"orderWorker"' "$RES_LAMBDA_CREATE"

# Get Function
RES_LAMBDA_GET=$(curl -s "${BASE_URL}/2015-03-31/functions/orderWorker")
assert_test "Lambda GetFunction" '"Configuration"' "$RES_LAMBDA_GET"

# Invoke Function
RES_LAMBDA_INVOKE=$(curl -s -X POST "${BASE_URL}/2015-03-31/functions/orderWorker/invocations" \
  -d '{"orderId": 1234}')
assert_test "Lambda Invoke" 'Execution successful' "$RES_LAMBDA_INVOKE"

echo ""
echo "--- 10. CloudWatch Logs & EventBridge ---"

# Create Log Stream
RES_LOG_STREAM=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: Logs_20140328.CreateLogStream" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"logGroupName":"/app/service","logStreamName":"stream-2026"}')
assert_test "CloudWatch CreateLogStream" '{}' "$RES_LOG_STREAM"

# Describe Log Streams
RES_LOG_STREAMS=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: Logs_20140328.DescribeLogStreams" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"logGroupName":"/app/service"}')
assert_test "CloudWatch DescribeLogStreams" 'logStreams' "$RES_LOG_STREAMS"

# Put Log Events
RES_LOGS=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: Logs_20140328.PutLogEvents" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"logGroupName":"/app/service","logEvents":[{"message":"User logged in"}]}')
assert_test "CloudWatch PutLogEvents" 'nextSequenceToken' "$RES_LOGS"

# EventBridge PutEvents
RES_EVENTS=$(curl -s -X POST "${BASE_URL}/" \
  -H "x-amz-target: AWSEvents.PutEvents" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"Entries":[{"Source":"order.service","DetailType":"OrderPlaced"}]}')
assert_test "EventBridge PutEvents" '"FailedEntryCount":0' "$RES_EVENTS"

echo ""
echo "=================================================================="
echo "SUMMARY: Passed: ${pass_count} | Failed: ${fail_count}"
echo "=================================================================="

if [ $fail_count -eq 0 ]; then
  echo "🎉 ALL ${pass_count} TESTS PASSED FLAWLESSLY ON AURA!"
  exit 0
else
  echo "❌ SOME TESTS FAILED!"
  exit 1
fi
