import React from 'react';
import { View, Platform, StyleSheet, TextInput } from 'react-native';

import { fonts, colors } from '../styles';

const RNSTextInput = ({
  type,
  style={},
  placeholderTextColor,
  ...restProps
}) => {
  const finalStyle = [
    styles.default,
    type === 'bordered' && styles.bordered,
    style && style,
  ];

  return (
    <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
      <TextInput
        placeholderTextColor={placeholderTextColor || colors.textInputColor}
        // underlineColorAndroid={colors.textInputColor}
        {...restProps}
        style={finalStyle}
      />
      {Platform.OS === 'ios' && (
        <View style={{ height: 0.5 }} />
      )}
    </View>
  );
};

const HEIGHT = 40;

const styles = StyleSheet.create({
  default: {
    height: HEIGHT,
    color: 'white',
    fontFamily: fonts.primaryRegular,
    ...Platform.select({
      android: {
        paddingLeft: 5,
        opacity: 0.9,
      },
    }),
  },
  bordered: {
    borderWidth: 0.5,
    borderColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  dark: {
    color: colors.gray,
  },
  primary: {
    borderRadius: HEIGHT / 2,
    backgroundColor: 'transparent',
  },
});

export default RNSTextInput;
