import React from 'react';
import PredictionForm from './components/PredictionForm';
import ScoreBoard from './components/ScoreBoard';
import PredictionsList from './components/PredictionsList';
import SetMatchResult from './components/SetMatchResult';

const App: React.FC = () => {
    return (
        <div>
            <h1>Euro 2024</h1>
            <PredictionForm />
            <SetMatchResult />
            <ScoreBoard />
            <PredictionsList />
        </div>
    );
};

export default App;
