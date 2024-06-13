import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Card } from 'react-bootstrap';

interface Match {
    match_id: number;
    home_team: string;
    away_team: string;
    match_date: string;
    home_score?: number;
    away_score?: number;
    predictions?: Prediction[];
}

interface Prediction {
    user_id: string;
    match_id: number;
    home_score: number;
    away_score: number;
    points?: number;
}

const PredictionsList: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}`, {
                    action: 'get_predictions'
                });
                setMatches(response.data);
            } catch (error) {
                console.error('Error fetching predictions:', error);
            }
        };

        fetchPredictions();
    }, []);

    return (
        <Container>
            <h1 className="mt-4 mb-4">Match Predictions</h1>
            {matches.length > 0 ? (
                <>
                    <Table responsive className="d-none d-md-table">
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th>Date</th>
                                <th>Result</th>
                                <th>Predictions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) => (
                                <tr key={match.match_id}>
                                    <td>{match.home_team} - {match.away_team}</td>
                                    <td>{match.match_date}</td>
                                    <td>
                                        {match.home_score !== undefined && match.away_score !== undefined ? (
                                            `${match.home_score} - ${match.away_score}`
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td>
                                        {match.predictions?.length ? (
                                            <ul>
                                                {match.predictions.map((prediction, index) => (
                                                    <li key={index}>
                                                        {prediction.user_id}: {prediction.home_score} - {prediction.away_score} (Points: {prediction.points})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            'No predictions'
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <div className="d-block d-md-none">
                        {matches.map((match) => (
                            <Card key={match.match_id} className="mb-3">
                                <Card.Body>
                                    <Card.Title>{match.home_team} - {match.away_team}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{match.match_date}</Card.Subtitle>
                                    <Card.Text>
                                        <strong>Result:</strong> {match.home_score !== undefined && match.away_score !== undefined ? `${match.home_score} - ${match.away_score}` : 'N/A'}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Predictions:</strong>
                                        {match.predictions?.length ? (
                                            <ul>
                                                {match.predictions.map((prediction, index) => (
                                                    <li key={index}>
                                                        {prediction.user_id}: {prediction.home_score} - {prediction.away_score} (Points: {prediction.points})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            'No predictions'
                                        )}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <p>No predictions found.</p>
            )}
        </Container>);
};

export default PredictionsList;
