
import React, { useState, useCallback } from 'react';
import { Activity } from './types';
import MainMenu from './components/MainMenu';
import ListeningActivity from './components/ListeningActivity';
import SpeakingActivity from './components/SpeakingActivity';
import WritingActivity from './components/WritingActivity';
import VocabularyActivity from './components/VocabularyActivity';
import GrammarActivity from './components/GrammarActivity';
import { Scoreboard } from './components/Scoreboard';

const App: React.FC = () => {
  const [activity, setActivity] = useState<Activity>(Activity.MainMenu);
  const [score, setScore] = useState(0);

  const incrementScore = useCallback(() => {
    setScore((prevScore) => prevScore + 1);
  }, []);

  const goToMenu = useCallback(() => {
    setActivity(Activity.MainMenu);
  }, []);

  const renderActivity = () => {
    const commonProps = {
      incrementScore,
      goToMenu,
    };

    switch (activity) {
      case Activity.Listening:
        return <ListeningActivity {...commonProps} />;
      case Activity.Speaking:
        return <SpeakingActivity {...commonProps} />;
      case Activity.Writing:
        return <WritingActivity {...commonProps} />;
      case Activity.Vocabulary:
        return <VocabularyActivity {...commonProps} />;
      case Activity.Grammar:
        return <GrammarActivity {...commonProps} />;
      case Activity.MainMenu:
      default:
        return <MainMenu onSelectActivity={setActivity} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="flex justify-between items-center p-4 mb-6 bg-white rounded-xl shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600">English Practice Assistant</h1>
          <Scoreboard score={score} />
        </header>
        <main>
          {renderActivity()}
        </main>
        <footer className="text-center mt-8 text-slate-500">
            <p>Happy Learning!</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
