// ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightTheme, darkTheme } from '../theme'; // Adjust the import based on your file structure

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(darkTheme); // Default theme

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
    };

    useEffect(() => {
        // Set CSS variables on the root element
        const root = document.documentElement;
        Object.keys(theme).forEach(key => {
            root.style.setProperty(key, theme[key]);
        });
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);