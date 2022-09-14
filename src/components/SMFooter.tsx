import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Footer } from 'native-base';
const styles = StyleSheet.create({
  bgImage: {
    height: 'auto'
  },
});
const SMFooter = ({ children, style = {} }) => {
  return (
    <Footer style={{ elevation: 0, borderTopWidth: 0, borderWidth: 0, backgroundColor: "transparent", alignItems: "baseline", ...style }}>
      {children}
    </Footer>
  );
};

SMFooter.propTypes = {
  children: PropTypes.node,
};
export default SMFooter;
