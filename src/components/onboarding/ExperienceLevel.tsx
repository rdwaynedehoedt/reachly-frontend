import React, { useState } from 'react';
import { motion } from 'framer-motion';

type ExperienceLevel = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const experienceLevels: ExperienceLevel[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: "I'm new to email marketing tools",
    icon: '🌱'
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: "I've used similar tools before",
    icon: '🌿'
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: "I'm experienced with email marketing platforms",
    icon: '🌳'
  }
];

interface ExperienceLevelProps {
  onExperienceSelect: (levelId: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const ExperienceLevel: React.FC<ExperienceLevelProps> = ({
  onExperienceSelect,
  onContinue,
  onBack,
  onSkip
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>('intermediate');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const handleLevelSelect = (levelId: string, position: number) => {
    setSelectedLevel(levelId);
    setSliderPosition(position);
    onExperienceSelect(levelId);
  };

  const handleContinue = () => {
    // Always call onExperienceSelect with the current selection (defaults to 'intermediate')
    const levelToSelect = selectedLevel || 'intermediate';
    onExperienceSelect(levelToSelect);
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          What's your level of experience with email marketing tools?
        </h1>
        <p className="text-lg text-gray-600">
          Reachly has features for all skill levels. We'll suggest the right ones for you.
        </p>
      </div>

      <div className="mb-12">
        <div className="relative mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${sliderPosition}%` }}
              className="h-full bg-blue-600 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {experienceLevels.map((level, index) => {
              const position = index * 50;
              return (
                <div
                  key={level.id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleLevelSelect(level.id, position)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      selectedLevel === level.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-500'
                    }`}
                  >
                    {level.icon}
                  </motion.div>
                  <span
                    className={`mt-2 font-medium ${
                      selectedLevel === level.id
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {level.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {selectedLevel ? (
            <motion.div
              key={selectedLevel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {experienceLevels.find(level => level.id === selectedLevel)?.title}
              </h3>
              <p className="text-gray-600">
                {experienceLevels.find(level => level.id === selectedLevel)?.description}
              </p>
              {selectedLevel === 'beginner' && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>We'll provide extra guidance and tutorials to help you get started.</p>
                  <ul className="list-disc list-inside mt-2 ml-4">
                    <li>Step-by-step campaign creation wizards</li>
                    <li>Template recommendations for your industry</li>
                    <li>Best practice guides for email marketing</li>
                  </ul>
                </div>
              )}
              {selectedLevel === 'intermediate' && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>We'll balance guidance with advanced features to enhance your workflow.</p>
                </div>
              )}
              {selectedLevel === 'advanced' && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>We'll focus on advanced features and customization options.</p>
                  <ul className="list-disc list-inside mt-2 ml-4">
                    <li>API access and custom integrations</li>
                    <li>Advanced segmentation and automation rules</li>
                    <li>Detailed analytics and custom reporting</li>
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <p className="text-gray-600">Select your experience level to see personalized recommendations.</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
        </div>
        <button
          type="button"
          onClick={handleContinue}
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default ExperienceLevel;