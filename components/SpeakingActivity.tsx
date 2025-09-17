import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSpeakingQuestion, evaluateSpokenAnswer } from '../services/geminiService';
import type { SpeakingFeedback } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

// Fix for missing SpeechRecognition types
// These interfaces are based on the Web Speech API specification
// and are necessary because they are not included in standard TypeScript DOM typings.
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ActivityProps {
  incrementScore: () => void;
  goToMenu: () => void;
}

const SpeakingActivity: React.FC<ActivityProps> = ({ incrementScore, goToMenu }) => {
  const [question, setQuestion] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    setQuestion('');
    setTranscript('');
    setFeedback(null);
    setError(null);
    try {
      const newQuestion = await generateSpeakingQuestion();
      setQuestion(newQuestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
    } else {
        setError("Your browser doesn't support speech recognition. Try Chrome or Firefox.");
    }
  }, [fetchQuestion]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setFeedback(null);
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };
  
  const handleSubmit = async () => {
    if (!transcript) return;
    setIsEvaluating(true);
    setFeedback(null);
    try {
        const result = await evaluateSpokenAnswer(question, transcript);
        setFeedback(result);
        if(!result.correction || result.correction.trim() === '') {
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
      <h2 className="text-2xl font-bold mb-4 text-center">Speaking 🎙️</h2>
      <p className="text-slate-600 mb-6 text-center">Answer the following question out loud.</p>
      <div className="bg-slate-100 p-4 rounded-lg mb-6">
        <p className="font-semibold text-lg text-center">{question}</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button onClick={toggleListening} variant={isListening ? 'danger' : 'primary'}>
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </Button>
        {isListening && <p className="text-indigo-600 animate-pulse">Listening...</p>}
        {transcript && <p className="mt-4 text-center text-slate-700">You said: "{transcript}"</p>}
        {transcript && !isEvaluating && <Button onClick={handleSubmit} disabled={isEvaluating}>Get Feedback</Button>}
      </div>
      
      {isEvaluating && <Spinner />}

      {feedback && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="font-semibold text-green-800">{feedback.praise} 🚀</p>
            {feedback.correction && feedback.correction.trim() !== '' && (
                <div className="mt-2">
                    <p>💡 A better way to say it:</p>
                    <p className="font-bold text-green-900">"{feedback.correction}"</p>
                    <p className="text-sm text-slate-600 mt-1">{feedback.explanation}</p>
                </div>
            )}
            {(!feedback.correction || feedback.correction.trim() === '') && (
                <p className="mt-2 font-semibold text-green-800">+1 point for you 🎯</p>
            )}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={goToMenu} variant="secondary">Back to Menu</Button>
        {feedback && <Button onClick={fetchQuestion}>Next Question</Button>}
      </div>
    </Card>
  );
};

export default SpeakingActivity;