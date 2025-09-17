
import React, { useState, useEffect, useCallback } from 'react';
import { generateListeningActivity } from '../services/geminiService';
import type { ListeningData } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

interface ActivityProps {
  incrementScore: () => void;
  goToMenu: () => void;
}

const ListeningActivity: React.FC<ActivityProps> = ({ incrementScore, goToMenu }) => {
  const [data, setData] = useState<ListeningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    setAnswered(false);
    setFeedback(null);
    setData(null);
    setError(null);
    try {
      const activityData = await generateListeningActivity();
      setData(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleSpeak = () => {
    if (data?.sentence) {
      const utterance = new SpeechSynthesisUtterance(data.sentence);
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (option: string) => {
    if (!data) return;
    setAnswered(true);
    if (option === data.answer) {
      setFeedback('Correct! 🎉 +1 point for you 🎯');
      incrementScore();
    } else {
      setFeedback(`Not quite! The correct answer was "${data.answer}". 💡`);
    }
  };
  
  if (isLoading) return <Card><Spinner /></Card>;
  if (error) return <Card><p className="text-red-500 text-center">{error}</p><Button onClick={goToMenu} className="mt-4">Back to Menu</Button></Card>;
  if (!data) return null;

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-center">Listening 🎧</h2>
      <p className="text-slate-600 mb-6 text-center">Click the button to hear a sentence, then answer the question.</p>
      <div className="flex justify-center mb-6">
        <Button onClick={handleSpeak} disabled={!data}>
          Speak Sentence
        </Button>
      </div>
      <div className="bg-slate-100 p-4 rounded-lg mb-6">
        <p className="font-semibold text-lg text-center">{data.question}</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {data.options.map((option) => (
          <Button 
            key={option} 
            onClick={() => handleAnswer(option)} 
            disabled={answered}
            variant={answered ? (option === data.answer ? 'success' : 'danger') : 'primary'}
          >
            {option}
          </Button>
        ))}
      </div>
      {feedback && <p className="mt-6 text-center font-semibold text-lg">{feedback}</p>}
      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={goToMenu} variant="secondary">Back to Menu</Button>
        {answered && <Button onClick={fetchActivity}>Next Question</Button>}
      </div>
    </Card>
  );
};

export default ListeningActivity;
