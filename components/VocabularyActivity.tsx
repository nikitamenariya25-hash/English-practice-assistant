
import React, { useState, useEffect, useCallback } from 'react';
import { generateVocabularyWord, evaluateVocabularySentence } from '../services/geminiService';
import type { VocabularyData } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

interface ActivityProps {
  incrementScore: () => void;
  goToMenu: () => void;
}

const VocabularyActivity: React.FC<ActivityProps> = ({ incrementScore, goToMenu }) => {
  const [data, setData] = useState<VocabularyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSentence, setUserSentence] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchWord = useCallback(async () => {
    setIsLoading(true);
    setData(null);
    setUserSentence('');
    setFeedback(null);
    setError(null);
    try {
      const wordData = await generateVocabularyWord();
      setData(wordData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);
  
  const handleSubmit = async () => {
    if (!userSentence.trim() || !data) return;
    setIsEvaluating(true);
    setFeedback(null);
    setError(null);
    try {
      const result = await evaluateVocabularySentence(data.word, userSentence);
      setFeedback(result);
      incrementScore();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get feedback.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) return <Card><Spinner /></Card>;
  if (error) return <Card><p className="text-red-500 text-center">{error}</p><Button onClick={goToMenu} className="mt-4">Back to Menu</Button></Card>;
  if (!data) return null;

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-center">Vocabulary 📖</h2>
      <div className="bg-slate-100 p-6 rounded-lg mb-6 space-y-3">
        <h3 className="text-3xl font-bold text-indigo-600 text-center capitalize">{data.word}</h3>
        <p><strong className="font-semibold">Meaning:</strong> {data.meaning}</p>
        <p><strong className="font-semibold">Example:</strong> <em>"{data.example}"</em></p>
        <p><strong className="font-semibold">Synonym:</strong> {data.synonym}</p>
      </div>

      <p className="text-center mb-4">Now, try to use "<strong>{data.word}</strong>" in your own sentence:</p>
      <textarea
        value={userSentence}
        onChange={(e) => setUserSentence(e.target.value)}
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        rows={3}
        placeholder={`e.g., The view from the mountain was ${data.word}.`}
        disabled={isEvaluating || !!feedback}
      />
      <div className="flex justify-center mt-4">
        {!feedback && <Button onClick={handleSubmit} disabled={isEvaluating || !userSentence.trim()}>
          {isEvaluating ? 'Checking...' : 'Check My Sentence'}
        </Button>}
      </div>

      {isEvaluating && <Spinner />}

      {feedback && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="font-semibold text-green-800">{feedback}</p>
          <p className="mt-2 font-semibold text-green-800">+1 point for you 🎯</p>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={goToMenu} variant="secondary">Back to Menu</Button>
        {feedback && <Button onClick={fetchWord}>Learn New Word</Button>}
      </div>
    </Card>
  );
};

export default VocabularyActivity;
