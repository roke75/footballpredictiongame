import json
import boto3
import os
import time
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
predictions_table = dynamodb.Table('euro2024_predictions')
matches_table = dynamodb.Table('euro2024_matches')


def lambda_handler(event, context):
    print(event)

    if event['requestContext']['http']['method'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': ''
        }

    try:
        body = json.loads(event['body'])
        action = body.get('action')

        if action == 'submit_prediction':
            return submit_prediction(body)
        elif action == 'get_scores':
            return get_scores()
        elif action == 'get_predictions':
            return get_predictions()
        elif action == 'get_matches':
            return get_matches()
        elif action == 'set_match_result':
            return set_match_result(body)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid action')
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }


def submit_prediction(body):
    user_id = body['user_id']
    match_id = body['match_id']
    home_score = body['home_score']
    away_score = body['away_score']

    predictions_table.put_item(
        Item={
            'user_id': user_id,
            'match_id': match_id,
            'home_score': home_score,
            'away_score': away_score,
            'created_at': int(time.time())
        }
    )

    return create_response(200, 'Prediction submitted successfully')


def get_scores():
    response = predictions_table.scan()
    predictions = response['Items']
    print(predictions)
    match_results = matches_table.scan()['Items']

    users_scores = {}
    for prediction in predictions:
        user_id = prediction['user_id']
        match_id = prediction['match_id']
        predicted_home_score = prediction['home_score']
        predicted_away_score = prediction['away_score']

        match = next(
            (match for match in match_results if match['match_id'] == match_id), None)
        if not match:
            continue

        actual_home_score = match.get('home_score')
        actual_away_score = match.get('away_score')

        if actual_home_score is None or actual_away_score is None:
            continue

        points = 0
        if predicted_home_score == actual_home_score:
            points += 1
        if predicted_away_score == actual_away_score:
            points += 1
        if (predicted_home_score > predicted_away_score and actual_home_score > actual_away_score) or \
           (predicted_home_score < predicted_away_score and actual_home_score < actual_away_score) or \
           (predicted_home_score == predicted_away_score and actual_home_score == actual_away_score):
            points += 2

        if user_id not in users_scores:
            users_scores[user_id] = 0
        users_scores[user_id] += points

    scores = [{'user_id': user_id, 'points': points}
              for user_id, points in users_scores.items()]
    scores.sort(key=lambda x: x['points'], reverse=True)

    return create_response(200, scores)


def get_predictions():
    try:
        response = predictions_table.scan()
        predictions = response.get('Items', [])
        matches_response = matches_table.scan()
        matches = {match['match_id']: match for match in matches_response.get('Items', [])}

        # Format matches and group predictions
        for match_id, match in matches.items():
            match['match_date'] = format_date(match['match_date'])
            match['predictions'] = [
                p for p in predictions if p['match_id'] == match_id]
            for prediction in match['predictions']:
                prediction['points'] = calculate_points(prediction, match)

        results = list(matches.values())
        results.sort(key=lambda x: datetime.strptime(
            x['match_date'], '%d.%m.%Y %H:%M'))
        results = json.loads(json.dumps(results, default=decimal_default))
        return create_response(200, results)
    except Exception as e:
        return create_response(500, f'Error retrieving predictions: {str(e)}')


def calculate_points(prediction, match):
    points = 0
    if 'home_score' in match and 'away_score' in match:
        if prediction['home_score'] == match['home_score']:
            points += 1
        if prediction['away_score'] == match['away_score']:
            points += 1
        if (prediction['home_score'] > prediction['away_score'] and match['home_score'] > match['away_score']) or \
           (prediction['home_score'] < prediction['away_score'] and match['home_score'] < match['away_score']) or \
           (prediction['home_score'] == prediction['away_score'] and match['home_score'] == match['away_score']):
            points += 2
    return points


def get_matches():
    try:
        response = matches_table.scan()
        matches = response.get('Items', [])
        matches = sorted(matches, key=lambda x: x['match_date'])
        for match in matches:
            match['match_date'] = format_date(match['match_date'])
        matches = json.loads(json.dumps(matches, default=decimal_default))
        return create_response(200, matches)
    except Exception as e:
        return create_response(500, f'Error retrieving matches: {str(e)}')


def set_match_result(body):
    try:
        match_id = body['match_id']
        home_score = body['home_score']
        away_score = body['away_score']

        response = matches_table.update_item(
            Key={'match_id': match_id},
            UpdateExpression='SET home_score = :home_score, away_score = :away_score',
            ExpressionAttributeValues={
                ':home_score': Decimal(home_score),
                ':away_score': Decimal(away_score)
            },
            ReturnValues='UPDATED_NEW'
        )
        return create_response(200, 'Match result set successfully')
    except Exception as e:
        return create_response(500, f'Error setting match result: {str(e)}')


def format_date(date_str):
    dt = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    return dt.strftime('%d.%m.%Y %H:%M')


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def create_response(status_code, message):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Headers': 'Content-Type',  # Allow Content-Type header
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'  # Allow necessary methods
        },
        'body': json.dumps(message)
    }
