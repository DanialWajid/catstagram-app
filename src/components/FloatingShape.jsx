import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const FloatingShape = ({ size, top, left, delay }) => {
  const backgroundColor = 'rgba(192, 132, 252, 0.2)';
  
  // Animation values
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  
  // Start animations
  React.useEffect(() => {
    // Y animation
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(100, { duration: 10000, easing: Easing.linear }),
        -1,
        true
      )
    );
    
    // X animation
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(100, { duration: 10000, easing: Easing.linear }),
        -1,
        true
      )
    );
    
    // Rotation animation
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);
  
  // Create animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });
  
  // Determine size class
  let sizeStyle = {};
  switch (size) {
    case 'w-16 h-16':
      sizeStyle = { width: 64, height: 64 };
      break;
    case 'w-24 h-24':
      sizeStyle = { width: 96, height: 96 };
      break;
    case 'w-32 h-32':
      sizeStyle = { width: 128, height: 128 };
      break;
    default:
      sizeStyle = { width: 64, height: 64 };
  }
  
  return (
    <Animated.View
      style={[
        styles.shape,
        { top, left, backgroundColor },
        sizeStyle,
        animatedStyle,
      ]}
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    />
  );
};

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.2,
  },
});

export default FloatingShape;