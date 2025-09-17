
import React, { useState, useEffect, useCallback } from 'react';
import { generateWritingTopic, evaluateWriting } from '../services/geminiService';
import type { WritingFeedback } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

interface ActivityProps {
  incrementScore: () => void;
  goToMenu: () => void;
}

const WritingActivity: React.FC<ActivityProps> = ({ incrementScore, goToMenu }) => {
  const [topic, setTopic] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopic = useCallback(async () => {
    setIsLoading(true);
    setTopic('');
    setText('');
    setFeedback(null);
    setError(null);
    try {
      const newTopic = await generateWritingTopic();
      setTopic(newTopic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsEvaluating(true);
    setFeedback(null);
    setError(null);
    try {
      const result = await evaluateWriting(text);
      setFeedback(result);
      if (result.corrections.length === 0) {
        incrementScore();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get feedback.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) return <Card><Spinner /></Card>;
  if (error) return <Card><p className="text-red-500 text-center">{error}</p><Button onClick={goToMenu} className="mt-4">Back to Menu</Button></Card>;

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-center">Writing ✍️</h2>
      <div className="bg-slate-100 p-4 rounded-lg mb-6">
        <p className="font-semibold text-lg text-center">{topic}</p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        rows={5}
        placeholder="Write your response here..."
        disabled={isEvaluating || !!feedback}
      />
      <div className="flex justify-center mt-4">
        {!feedback && <Button onClick={handleSubmit} disabled={isEvaluating || !text.trim()}>
          {isEvaluating ? 'Evaluating...' : 'Check My Writing'}
        </Button>}
      </div>

      {isEvaluating && <Spinner />}

      {feedback && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-semibold text-blue-800">{feedback.praise} 👍</p>
          {feedback.corrections.length > 0 ? (
            <div className="mt-4 space-y-3">
              <h4 className="font-bold">Here are some suggestions:</h4>
              {feedback.corrections.map((corr, index) => (
                <div key={index} className="p-2 bg-white rounded">
                  <p><span className="text-red-500 line-through">{corr.original}</span> → <span className="text-green-600 font-semibold">{corr.corrected}</span></p>
                  <p className="text-sm text-slate-600 mt-1">💡 {corr.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 font-semibold text-green-700">No mistakes found! Great job! 🎉 +1 point for you 🎯</p>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={goToMenu} variant="secondary">Back to Menu</Button>
        {feedback && <Button onClick={fetchTopic}>New Topic</Button>}
      </div>
    </Card>
  );
};

export default WritingActivity;
