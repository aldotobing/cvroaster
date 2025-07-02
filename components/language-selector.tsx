"use client";

import { Languages } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

// SVG Flags
const FlagUK = () => (
  <svg viewBox="0 0 60 30" width="24" height="18">
    <clipPath id="a">
      <path d="M0 0v30h60V0z"/>
    </clipPath>
    <clipPath id="b">
      <path d="M30 15h30v15zv15H0zH0V0z"/>
    </clipPath>
    <g clipPath="url(#a)">
      <path d="M0 0v30h60V0z" fill="#012169"/>
      <path stroke="#fff" strokeWidth="6" d="m0 0 60 30m0-30L0 30"/>
      <path stroke="#C8102E" strokeWidth="4" d="m0 0 60 30m0-30L0 30" clipPath="url(#b)"/>
      <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60"/>
      <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60"/>
    </g>
  </svg>
);

const FlagID = () => (
  <svg viewBox="0 0 60 30" width="24" height="18">
    <path d="M0 0h60v30H0z" fill="#e70011"/>
    <path d="M0 0h60v15H0z" fill="#fff"/>
  </svg>
);

interface LanguageSelectorProps {
  language: 'english' | 'indonesian';
  onLanguageChange: (lang: 'english' | 'indonesian') => void;
  className?: string;
}

export function LanguageSelector({ 
  language, 
  onLanguageChange, 
  className = '' 
}: LanguageSelectorProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Output Language</Label>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={language === 'english' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('english')}
          className={`gap-2 transition-colors ${
            language === 'english' 
              ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600' 
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
        >
          <FlagUK />
          <span>EN</span>
        </Button>
        <Button
          type="button"
          variant={language === 'indonesian' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('indonesian')}
          className={`gap-2 transition-colors ${
            language === 'indonesian' 
              ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600' 
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
        >
          <FlagID />
          <span>ID</span>
        </Button>
      </div>
    </div>
  );
}
