import React from 'react';
import {StyleSheet} from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import colors from "../themes/dark/colors";

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
});
const ImageContent = ({children, style}) => {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
      style={[styles.bgImage, {...style}]}
    >
      {children}
    </LinearGradient>
  );
};

ImageContent.defaultProps = {
  style: {},
};
export default ImageContent;
