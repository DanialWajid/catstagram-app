// import React, { useRef, useEffect } from 'react';
// import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
// import { useTheme } from '../contexts/themeContext';
// import { Sun, Moon } from 'lucide-react-native';

// const ThemeToggle = () => {
//   const { isDark, toggleTheme } = useTheme();
  
//   // Animation refs
//   const switchTranslate = useRef(new Animated.Value(isDark === true ? 30 : 0)).current;
//   const rotation = useRef(new Animated.Value(0)).current;
//   const moonOpacity = useRef(new Animated.Value(isDark === true ? 1 : 0)).current;
//   const sunOpacity = useRef(new Animated.Value(isDark === true ? 0 : 1)).current;
  
//   useEffect(() => {
//     const animations = Animated.parallel([
//       Animated.spring(switchTranslate, {
//         toValue: isDark ? 30 : 0,
//         useNativeDriver: true,
//       }),
//       Animated.timing(rotation, {
//         toValue: isDark ? 1 : 0,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//       Animated.timing(moonOpacity, {
//         toValue: isDark ? 1 : 0,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//       Animated.timing(sunOpacity, {
//         toValue: isDark ? 0 : 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ]);
    
//     animations.start();
//     return () => animations.stop();
//   }, [isDark, switchTranslate, rotation, moonOpacity, sunOpacity]);

//   const spin = rotation.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         activeOpacity={0.8}
//         onPress={toggleTheme}
//         style={[
//           styles.switch,
//           { backgroundColor: isDark ? '#183153' : '#73C0FC' }
//         ]}
//         testID="theme-toggle-button"
//       >
//         <Animated.View style={[styles.iconContainer, { opacity: sunOpacity, transform: [{ rotate: spin }] }]}>
//           <Sun size={20} color="#ffd43b" />
//         </Animated.View>
        
//         <Animated.View style={[styles.iconContainer, { opacity: moonOpacity }]}>
//           <Moon size={20} color="#e8e8e8" />
//         </Animated.View>
        
//         <Animated.View 
//           style={[
//             styles.slider,
//             { transform: [{ translateX: switchTranslate }] }
//           ]}
//         />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 5,
//   },
//   switch: {
//     width: 60,
//     height: 30,
//     borderRadius: 15,
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   slider: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: '#fff',
//     position: 'absolute',
//     top: 2,
//     left: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1,
//     elevation: 2,
//   },
//   iconContainer: {
//     position: 'absolute',
//     top: 5,
//     width: 20,
//     height: 20,
//   },
// });

// export default ThemeToggle;