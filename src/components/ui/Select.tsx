"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = "Select...", className = "" }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white transition-all hover:bg-black/60 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 text-left backdrop-blur-md shadow-lg"
      >
        <span className={!selectedOption ? "text-white/40" : "text-white"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#150810]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-60 overflow-y-auto py-1.5 custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all hover:bg-white/10 mx-1.5 w-[calc(100%-24px)] rounded-lg px-2.5 ${
                  value === option.value 
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium shadow-sm' 
                    : 'text-white/80'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check size={16} className="text-[var(--color-primary)]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
