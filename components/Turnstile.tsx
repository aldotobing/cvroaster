'use client';

import { useCallback, useEffect, useRef, useMemo } from 'react';

// Simple debounce utility function
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId?: string) => string;
      isExpired: (widgetId?: string) => boolean;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'before-interactive-callback'?: () => void;
  'after-interactive-callback'?: () => void;
  'unsupported-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  tabindex?: number;
  'timeout-callback'?: () => void;
  'response-field'?: boolean;
  'response-field-name'?: string;
  size?: 'normal' | 'compact' | 'flexible';
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  'refresh-timeout'?: number;
  appearance?: 'always' | 'execute' | 'interaction-only';
  'feedback-enabled'?: boolean;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
  isVerified?: boolean;
}

export function Turnstile({ 
  onVerify, 
  onError, 
  onExpire, 
  className = '',
  isVerified = false
}: TurnstileProps) {
  const widgetId = useRef<string | null>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);

  // Always use desktop style

  // Handle widget rendering with proper cleanup
  const renderTurnstile = useCallback(() => {
    if (!window.turnstile || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      return;
    }

    // Clean up previous instance if exists
    if (widgetId.current) {
      window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    }

    if (!widgetContainerRef.current) return;
    
    // Make sure the widget container is visible
    if (widgetContainerRef.current) {
      widgetContainerRef.current.style.opacity = '1';
    }

    // Always use normal size for desktop
    
    try {
      const id = window.turnstile.render(widgetContainerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        size: 'normal',
        theme: 'light',
        language: 'en',
        callback: (token: string) => {
          onVerify(token);
        },
        'expired-callback': () => {
          onExpire?.();
          if (widgetId.current) {
            window.turnstile.reset(widgetId.current);
          }
        },
        'error-callback': () => {
          onError?.();
        },
        'unsupported-callback': () => {
          onError?.();
        },
        appearance: 'always',
        'refresh-expired': 'auto',
        'retry': 'auto',
        'retry-interval': 8000
      });
      
      widgetId.current = id;
      hasRendered.current = true;
      
      // Ensure the widget container is visible after render
      if (widgetContainerRef.current) {
        widgetContainerRef.current.style.opacity = '1';
      }

      // Force center alignment after render
      setTimeout(() => {
        if (widgetContainerRef.current) {
          const iframe = widgetContainerRef.current.querySelector('iframe');
          if (iframe) {
            iframe.style.margin = '0 auto';
            iframe.style.display = 'block';
          }
        }
      }, 100);

    } catch (error) {
      console.error('Error rendering Turnstile:', error);
      onError?.();
    }
  }, [onVerify, onError, onExpire]);

  // Handle window resize to adjust widget size
  useEffect(() => {
    const handleResize = () => {
      // Only re-render if needed
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
        hasRendered.current = false;
        renderTurnstile();
      }
    };

    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [renderTurnstile]);

  // Load the Turnstile script only once
  useEffect(() => {
    if (hasRendered.current || !widgetContainerRef.current) return;

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    if (document.getElementById('cf-turnstile-script')) {
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          renderTurnstile();
        }
      }, 100);
      return () => clearInterval(checkTurnstile);
    }

    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = renderTurnstile;
    script.onerror = () => {
      console.error('Failed to load Turnstile script');
      onError?.();
    };
    
    document.body.appendChild(script);

    return () => {
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
      }
    };
  }, [renderTurnstile, onError]);

  // Render success state when verified
  if (isVerified) {
    return (
      <div className={`turnstile-container ${className}`}>
        <div className="w-full flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Verified</p>
        </div>
      </div>
    );
  }

  // Render the widget container with improved centering and consistent sizing
  return (
    <div 
      className={`turnstile-container ${className}`}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
        padding: '0',
        textAlign: 'center',
        minHeight: '78px', 
        position: 'relative' 
      }}
    >
      {/* Main widget container - always rendered but initially transparent */}
      <div 
        ref={widgetContainerRef}
        className="cf-turnstile"
        style={{
          width: '100%',
          maxWidth: '320px',
          minHeight: '78px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          padding: '8px',
          textAlign: 'center',
          position: 'relative',
          transition: 'opacity 0.2s ease-in-out',
          opacity: hasRendered.current ? '1' : '0',
          visibility: 'visible',
          zIndex: 20
        }}
      />
      
      {/* Loading overlay - positioned absolutely and removed when widget is ready */}
      {!hasRendered.current && (
        <div 
          style={{
            position: 'absolute',
            width: '320px',
            height: '78px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s ease-in-out',
            zIndex: 10
          }}
        >
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md w-full h-full"></div>
        </div>
      )}
    </div>
  );
}