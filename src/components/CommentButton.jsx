import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  Animated,
} from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useRef } from 'react';

const CommentButton = ({ onPress }) => {
  // Animation references
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const widthAnim = useRef(new Animated.Value(130)).current;
  const textOpacityAnim = useRef(new Animated.Value(1)).current;
  const iconContainerWidthAnim = useRef(new Animated.Value(30)).current;
  
  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(iconContainerWidthAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: 130,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(iconContainerWidthAnim, {
        toValue: 30,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (onPress) {
      onPress();
    }
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ scale: scaleAnim }],
        width: widthAnim,
      }
    ]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View style={[
          styles.iconContainer,
          { width: iconContainerWidthAnim }
        ]}>
          <MessageCircle color="white" size={16} />
        </Animated.View>
        
        <Animated.Text style={[
          styles.text,
          { opacity: textOpacityAnim }
        ]}>
          Comment
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#674ae4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  text: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommentButton;