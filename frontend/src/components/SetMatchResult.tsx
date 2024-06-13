import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

interface Match {
    match_id: number;
    home_team: string;
    away_team: string;
    match_date: string;
}

const SetMatchResult: React.FC = () => {
    const [matchId, setMatchId] = useState('');
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [matches, setMatches] = useState<Match[]>([]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}`, {
                    action: 'get_matches',
                });
                setMatches(response.data);
            } catch (error) {
                console.error('Error fetching matches:', error);
            }
        };

        fetchMatches();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}`, {
                action: 'set_match_result',
                match_id: parseInt(matchId),
                home_score: parseInt(homeScore),
                away_score: parseInt(awayScore)
            });
            console.log('Match result set:', response.data);
        } catch (error) {
            console.error('Error setting match result:', error);
        }
    };

    return (
        <Container>
            <Row className="mt-4 mb-4">
                <Col>
                    <h1>Set Match Result</h1>
                </Col>
            </Row>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="match_id">
                            <Form.Label>Select a Match</Form.Label>
                            <Form.Control
                                as="select"
                                value={matchId}
                                onChange={(e) => setMatchId(e.target.value)}
                                required
                            >
                                <option value="">Select a Match</option>
                                {matches.map((match) => (
                                    <option key={match.match_id} value={match.match_id}>
                                        {match.home_team} - {match.away_team} ({match.match_date})
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="home_score">
                            <Form.Label>Home Score</Form.Label>
                            <Form.Control
                                type="number"
                                value={homeScore}
                                onChange={(e) => setHomeScore(e.target.value)}
                                placeholder="Home Score"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="away_score">
                            <Form.Label>Away Score</Form.Label>
                            <Form.Control
                                type="number"
                                value={awayScore}
                                onChange={(e) => setAwayScore(e.target.value)}
                                placeholder="Away Score"
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button variant="primary" type="submit">
                            Set Result
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default SetMatchResult;
