// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { Appearance } from 'react-native';

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [isDark, setIsDark] = useState(false);

//   useEffect(() => {
//     const colorScheme = Appearance.getColorScheme();
//     setIsDark(colorScheme === 'dark');
//   }, []);

//   const toggleTheme = () => setIsDark(!isDark);

//   // In your ThemeProvider
// const theme = {
//   isDark,
//   toggleTheme,
//   colors: isDark ? {
//     background: '#111827',
//     text: '#f9fafb',
//     card: '#1f2937',
//     border: '#374151',
//     primary: '#3b82f6'
//   } : {
//     background: '#f9fafb',
//     text: '#111827',
//     card: '#ffffff',
//     border: '#e5e7eb',
//     primary: '#2563eb'
//   }
// };

//   return (
//     <ThemeContext.Provider value={theme}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };

// // Add default export
// export default ThemeProvider;