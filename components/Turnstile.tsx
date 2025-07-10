'use client';

import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (container: string, options: {
        sitekey: string;
        callback: (token: string) => void;
        appearance?: 'always' | 'execute' | 'interaction-only';
        theme?: 'light' | 'dark' | 'auto';
        language?: string;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

export function Turnstile({ 
  onVerify, 
  onError, 
  onExpire, 
  className = '' 
}: TurnstileProps) {
  const widgetId = useRef<string | null>(null);

  // Track if the widget has been rendered
  const hasRendered = useRef(false);

  // Load the Turnstile script only once
  useEffect(() => {
    // Only proceed if not already rendered and we have a container
    const container = document.getElementById('turnstile-widget');
    if (hasRendered.current || !container) return;

    // Check if script is already loaded
    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    // Check if script is already being loaded
    if (document.getElementById('cf-turnstile-script')) {
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          renderTurnstile();
        }
      }, 100);
      return () => clearInterval(checkTurnstile);
    }

    // Load the script
    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      renderTurnstile();
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup function if component unmounts
      if (widgetId.current) {
        window.turnstile?.reset(widgetId.current);
      }
    };
  }, []);

  // Handle widget rendering - use ref to store the latest callbacks
  const callbacksRef = useRef({ onVerify, onError, onExpire });
  
  // Update ref when callbacks change
  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire };
  }, [onVerify, onError, onExpire]);

  const renderTurnstile = useCallback(() => {
    // Skip if already rendered or no container
    const container = document.getElementById('turnstile-widget');
    if (hasRendered.current || !container) return;
    if (!window.turnstile || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      console.error('Turnstile not loaded or site key not set');
      return;
    }

    // Clean up previous instance if exists
    if (widgetId.current) {
      window.turnstile.reset(widgetId.current);
    }

    // Render new instance with light theme and English language
    const id = window.turnstile.render('#turnstile-widget', {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      appearance: 'always',  // Force light theme
      theme: 'light',       // Explicitly set light theme
      language: 'en',       // Set language to English
      callback: (token: string) => {
        callbacksRef.current.onVerify(token);
      },
      'expired-callback': () => {
        if (widgetId.current) {
          window.turnstile.reset(widgetId.current);
        }
        callbacksRef.current.onExpire?.();
      },
      'error-callback': () => {
        callbacksRef.current.onError?.();
      },
    });
    
    widgetId.current = id.toString();
    hasRendered.current = true;
  }, []); // No dependencies since we're using refs

  // Only render the container if we haven't rendered the widget yet
  if (hasRendered.current) {
    return (
      <div className={`turnstile-container ${className}`}>
        <div id="turnstile-widget" className="w-full flex justify-center" />
      </div>
    );
  }

  // Return a placeholder when not showing the widget
  return (
    <div className={`turnstile-container ${className}`} data-theme="light">
      <div id="turnstile-widget" className="w-full flex justify-center">
        <div className="w-[300px] h-[65px] bg-gray-100 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
