# Installation

## Create a New Lambda Function

1. Go to the AWS Management Console and select Lambda.
2. Click "Create function".
3. Name your function (e.g., `euro2024-backend`) and select Python 3.9 as the runtime.
4. Click "Create function".

## Upload and Configure Lambda Function Code

1. Write the code in the Lambda console.

## Enable Lambda URL Feature

1. Go to the settings of your Lambda function.
2. Select "Configuration" -> "Function URL".
3. Click "Create function URL".
4. Choose "None" for the authentication method (or use AWS IAM if you need authentication).
5. Click "Save".

## Configure IAM Policy

The Lambda function needs an IAM role with access to DynamoDB tables. Create a new IAM policy with the following content and attach it to the Lambda function's role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/euro2024_predictions",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/euro2024_matches"
      ]
    }
  ]
}
```
## Create DynamoDB Tables
Create the following DynamoDB tables:

### Predictions Table
Table name: euro2024_predictions
Primary key: user_id (String)
Sort key: match_id (Number)
### Matches Table
Table name: euro2024_matches
Primary key: match_id (Number)
Import Matches into DynamoDB
Create a matches.json file with the following content:
```json
{
  "euro2024_matches": [
    {
      "PutRequest": {
        "Item": {
          "match_id": { "N": "1" },
          "home_team": { "S": "Germany" },
          "away_team": { "S": "Scotland" },
          "match_date": { "S": "2024-06-14T21:00:00" }
        }
      }
    },
    {
      "PutRequest": {
        "Item": {
          "match_id": { "N": "2" },
          "home_team": { "S": "Hungary" },
          "away_team": { "S": "Switzerland" },
          "match_date": { "S": "2024-06-15T15:00:00" }
        }
      }
    }
    // Add other matches in the same way
  ]
}
```
## Run the following command in your console to import the matches:

```bash
aws dynamodb batch-write-item --request-items file://matches.json
```