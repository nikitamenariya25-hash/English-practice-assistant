
import React from 'react';
import { Activity } from '../types';
import { Card } from './common/Card';

interface MainMenuProps {
  onSelectActivity: (activity: Activity) => void;
}

const menuItems = [
  { activity: Activity.Listening, label: 'Listening', icon: '🎧' },
  { activity: Activity.Speaking, label: 'Speaking', icon: '🎙️' },
  { activity: Activity.Writing, label: 'Writing', icon: '✍️' },
  { activity: Activity.Vocabulary, label: 'Vocabulary', icon: '📖' },
  { activity: Activity.Grammar, label: 'Grammar', icon: '📝' },
];

const MainMenu: React.FC<MainMenuProps> = ({ onSelectActivity }) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-center mb-6">Choose an activity</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelectActivity(item.activity)}
            className="flex items-center justify-center text-lg p-6 bg-slate-100 rounded-lg hover:bg-indigo-100 hover:shadow-lg transition-all duration-300"
          >
            <span className="text-3xl mr-4">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default MainMenu;
