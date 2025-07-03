import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeInputProps {
  value: number; // Duration in seconds
  onChange: (seconds: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  placeholder = "00:00",
  className = "",
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Convert seconds to MM:SS format
  const secondsToTimeString = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert MM:SS format to seconds
  const timeStringToSeconds = (timeString: string): number => {
    const parts = timeString.split(':');
    if (parts.length !== 2) return 0;
    
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    
    if (isNaN(mins) || isNaN(secs)) return 0;
    if (mins < 0 || mins > 59 || secs < 0 || secs > 59) return 0;
    
    return mins * 60 + secs;
  };

  // Validate time format
  const validateTimeFormat = (timeString: string): boolean => {
    const timeRegex = /^([0-5]?[0-9]):([0-5]?[0-9])$/;
    const match = timeString.match(timeRegex);
    
    if (!match) return false;
    
    const mins = parseInt(match[1], 10);
    const secs = parseInt(match[2], 10);
    
    // Check if it's at least 1 second and not more than 59:59
    const totalSeconds = mins * 60 + secs;
    return totalSeconds >= 1 && totalSeconds <= 3599;
  };

  // Initialize display value from props
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(secondsToTimeString(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove any non-digit or non-colon characters
    inputValue = inputValue.replace(/[^\d:]/g, '');
    
    // Auto-format as user types
    if (inputValue.length <= 5) {
      // Remove existing colons to reformat
      const digitsOnly = inputValue.replace(/:/g, '');
      
      if (digitsOnly.length <= 4) {
        let formatted = digitsOnly;
        
        // Add colon after 2 digits
        if (digitsOnly.length > 2) {
          formatted = digitsOnly.slice(0, 2) + ':' + digitsOnly.slice(2);
        }
        
        setDisplayValue(formatted);
        
        // Validate if complete format
        if (formatted.length === 5) {
          const isValidFormat = validateTimeFormat(formatted);
          setIsValid(isValidFormat);
          
          if (isValidFormat) {
            const seconds = timeStringToSeconds(formatted);
            onChange(seconds);
          }
        } else {
          setIsValid(true); // Don't show error while typing
        }
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    if (displayValue.length === 0) {
      setDisplayValue(secondsToTimeString(value));
      setIsValid(true);
      return;
    }
    
    // Ensure complete format on blur
    if (displayValue.length < 5) {
      const digitsOnly = displayValue.replace(/:/g, '');
      let padded = digitsOnly.padEnd(4, '0');
      
      // Ensure we don't exceed valid ranges
      const mins = parseInt(padded.slice(0, 2), 10);
      const secs = parseInt(padded.slice(2, 4), 10);
      
      if (mins > 59) padded = '59' + padded.slice(2);
      if (secs > 59) padded = padded.slice(0, 2) + '59';
      
      const formatted = padded.slice(0, 2) + ':' + padded.slice(2, 4);
      setDisplayValue(formatted);
      
      const isValidFormat = validateTimeFormat(formatted);
      setIsValid(isValidFormat);
      
      if (isValidFormat) {
        const seconds = timeStringToSeconds(formatted);
        onChange(seconds);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    if ([8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode)) {
      return;
    }
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
      return;
    }
    
    // Only allow digits and colon
    if (!/[\d:]/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10 text-center font-mono text-lg
            border rounded-lg transition-all duration-200
            ${isValid 
              ? 'border-gray-300 dark:border-dark-border focus:ring-2 focus:ring-red-500 focus:border-red-500' 
              : 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500'
            }
            ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-dark-surface'}
            ${className}
          `}
          maxLength={5}
        />
        <Clock className={`
          absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4
          ${isValid ? 'text-gray-400 dark:text-gray-500' : 'text-red-500 dark:text-red-400'}
        `} />
      </div>
      
      {!isValid && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
          <span className="mr-1">⚠️</span>
          Formato válido: 00:01 a 59:59 (MM:SS)
        </p>
      )}
      
      {isFocused && isValid && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Formato: MM:SS (ej: 02:30 = 2 min 30 seg)
        </p>
      )}
    </div>
  );
};

export default TimeInput;