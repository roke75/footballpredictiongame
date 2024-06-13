# Project Setup Instructions

## Modify Environment Variables

Create a `.env` file in your project and add the Lambda URL:
```
REACT_APP_API_URL=https://your-lambda-url
```

## Build the Application

Build the React application for production:
```bash
npm run build
```

## Create a New S3 Bucket

1. Go to the AWS Management Console and select S3.
2. Click "Create bucket".
3. Give your bucket a name (e.g., `euro2024-frontend`) and choose the appropriate settings.

## Configure Bucket Settings

1. Go to the "Properties" tab of your bucket and scroll down to "Static website hosting".
2. Enable "Static website hosting" and set the index document to `index.html`.
3. You will get the bucket's endpoint URL, which will be the frontend URL.

## Modify Bucket Permissions

1. Go to the "Permissions" tab and ensure that the bucket's files are public. You can use a bucket policy or change the file ACL settings.

### Add Bucket Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET-NAME/*"
        }
    ]
}
```
### Upload the Built Application to S3
Go inside your S3 bucket and select "Upload".
Upload the build directory created by the React build process.
Ensure all files and folders are in the correct paths in S3.