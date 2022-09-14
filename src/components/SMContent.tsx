import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View} from 'react-native';
import colors from "../themes/dark/colors";
import {Content} from 'native-base';
import LinearGradient from "react-native-linear-gradient";
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
});
const SMContent = ({children, style, visible, noPadding}) => {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={[colors.background, colors.backgroundLight]}
      style={[styles.bgImage, {...style}]}
    >
      <Content style={{flex: 1, padding: noPadding ? 0 : 10}}>
        {children}
        <View style={{height: 15}}/>
       </Content>
    </LinearGradient>
  );
};

SMContent.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  visible: PropTypes.bool,
  noPadding: PropTypes.bool
};
SMContent.defaultProps = {
  style: {},
  visible: false,
  noPadding: false
};
export default SMContent;
