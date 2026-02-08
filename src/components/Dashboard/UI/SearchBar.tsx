/**
 * SearchBar Component
 * Search input with icon
 */
import React from 'react';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ placeholder = 'Search...', value, onChange }: SearchBarProps) {
    return (
        <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default SearchBar;
