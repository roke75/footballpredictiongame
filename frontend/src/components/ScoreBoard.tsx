import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table } from 'react-bootstrap';

interface Score {
    user_id: string;
    points: number;
}

const ScoreBoard: React.FC = () => {
    const [scores, setScores] = useState<Score[]>([]);

    const fetchScores = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}`, {
                action: 'get_scores'
            });
            setScores(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchScores();
    }, []);

    return (
        <Container>
            <h1 className="mt-4 mb-4">Scoreboard</h1>
            {scores.length > 0 ? (
                <Table responsive>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((score) => (
                            <tr key={score.user_id}>
                                <td>{score.user_id}</td>
                                <td>{score.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No scores found.</p>
            )}
        </Container>
    );
};

export default ScoreBoard;
