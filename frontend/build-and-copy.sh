#!/bin/sh

npm run build
cd build
aws s3 cp . s3://**BUCKET-NAME** --recursive
cd ..
