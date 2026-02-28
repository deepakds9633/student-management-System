import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check localStorage first, default to dark
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('mc-theme');
        return savedTheme ? savedTheme : 'dark';
    });

    useEffect(() => {
        // Set data-theme attribute on root element for CSS selectors
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mc-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
