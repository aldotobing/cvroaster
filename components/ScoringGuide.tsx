import React from 'react';

interface ScoringCriteria {
  name: string;
  weight: number;
  description: string;
  scoringScale: {
    excellent: { min: number; description: string };
    good: { min: number; description: string };
    fair: { min: number; description: string };
    poor: { min: number; description: string };
  };
}

const SCORING_CRITERIA: ScoringCriteria[] = [
  {
    name: 'Content Relevance',
    weight: 25,
    description: 'How well the CV content matches the job requirements',
    scoringScale: {
      excellent: { min: 85, description: 'Highly relevant content with strong alignment to job requirements' },
      good: { min: 70, description: 'Good relevance but could be more tailored' },
      fair: { min: 50, description: 'Some relevance but significant improvements needed' },
      poor: { min: 0, description: 'Little to no relevance to the job requirements' },
    },
  },
  {
    name: 'ATS Optimization',
    weight: 25,
    description: 'How well the CV is optimized for Applicant Tracking Systems',
    scoringScale: {
      excellent: { min: 85, description: 'Excellent ATS optimization with proper keywords and formatting' },
      good: { min: 70, description: 'Good ATS optimization but some improvements possible' },
      fair: { min: 50, description: 'Basic ATS optimization but needs significant work' },
      poor: { min: 0, description: 'Poor ATS optimization, likely to be filtered out' },
    },
  },
  {
    name: 'Structure & Readability',
    weight: 20,
    description: 'Organization and clarity of the CV content',
    scoringScale: {
      excellent: { min: 85, description: 'Exceptionally well-organized and easy to read' },
      good: { min: 70, description: 'Good structure but could be more polished' },
      fair: { min: 50, description: 'Basic structure but needs improvement' },
      poor: { min: 0, description: 'Poor structure, difficult to read' },
    },
  },
  {
    name: 'Skills & Experience Match',
    weight: 20,
    description: 'Alignment of skills and experience with job requirements',
    scoringScale: {
      excellent: { min: 85, description: 'Exceptional match with required skills and experience' },
      good: { min: 70, description: 'Good match but some skills could be better highlighted' },
      fair: { min: 50, description: 'Some match but significant gaps exist' },
      poor: { min: 0, description: 'Poor match with required skills and experience' },
    },
  },
  {
    name: 'Achievements & Impact',
    weight: 10,
    description: 'Demonstration of achievements and impact in previous roles',
    scoringScale: {
      excellent: { min: 85, description: 'Clear demonstration of impact with measurable results' },
      good: { min: 70, description: 'Good achievements but could be more quantifiable' },
      fair: { min: 50, description: 'Some achievements mentioned but lack impact' },
      poor: { min: 0, description: 'Little to no demonstration of achievements' },
    },
  },
];

export const getScoringGuidePrompt = (): string => {
  let prompt = 'SCORING GUIDE FOR CV REVIEW\n\n';
  
  prompt += 'When reviewing CVs, please use the following scoring criteria and weights:\n\n';
  
  SCORING_CRITERIA.forEach((criteria) => {
    prompt += `**${criteria.name} (${criteria.weight}% Weight)**\n`;
    prompt += `${criteria.description}\n`;
    prompt += 'Scoring Scale:\n';
    prompt += `- 85-100: ${criteria.scoringScale.excellent.description}\n`;
    prompt += `- 70-84: ${criteria.scoringScale.good.description}\n`;
    prompt += `- 50-69: ${criteria.scoringScale.fair.description}\n`;
    prompt += `- 0-49: ${criteria.scoringScale.poor.description}\n\n`;
  });
  
  prompt += '**Overall Score Calculation:**\n';
  prompt += '1. Score each criterion on a scale of 0-100\n';
  prompt += '2. Apply the weight to each score\n';
  prompt += '3. Sum the weighted scores for the final score\n\n';
  
  prompt += '**Additional Guidelines:**\n';
  prompt += '- Be consistent in your scoring across similar CVs\n';
  prompt += '- Provide specific, actionable feedback for each criterion\n';
  prompt += '- Consider both content and presentation aspects\n';
  prompt += '- Be fair and objective in your assessment\n\n';
  
  return prompt;
};

interface ScoringGuideProps {
  className?: string;
}

const ScoringGuide: React.FC<ScoringGuideProps> = ({ className = '' }) => {
  const getScoreColor = (min: number) => {
    if (min >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (min >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (min >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 text-left">Scoring Methodology</h2>
        <p className="mt-1 text-gray-600 text-left">
          Understand how your CV is evaluated across key dimensions to better tailor your application.
        </p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {SCORING_CRITERIA.map((criteria, index) => (
          <div key={index} className="p-6 hover:bg-gray-50 transition-colors text-left">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 m-0 p-0">{criteria.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{criteria.description}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {criteria.weight}% of total score
              </span>
            </div>
            
            <div className="space-y-2.5 mt-4 pl-0 text-left">
              {Object.entries(criteria.scoringScale).map(([key, value]) => (
                <div key={key} className="flex items-start">
                  <span className={`inline-flex items-center justify-center w-16 text-sm font-medium px-2.5 py-1 rounded border ${getScoreColor(value.min)}`}>
                    {value.min}+{value.min === 0 ? '' : ''}
                  </span>
                  <span className="ml-3 text-sm text-gray-700">{value.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50/50 border-t border-blue-100 p-5 text-left">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">How Your Score is Calculated</h3>
        <p className="text-sm text-blue-700">
          Each criterion is scored individually (0-100), then weighted according to its importance. 
          The final score is the sum of all weighted scores, providing a comprehensive evaluation of your CV's effectiveness.
        </p>
      </div>
    </div>
  );
};

export default ScoringGuide;
