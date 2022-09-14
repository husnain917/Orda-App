import React from 'react';
import PropTypes from "prop-types";

import AntDesignIcon from "react-native-vector-icons/AntDesign";
import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIconsIcon from "react-native-vector-icons/MaterialIcons";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontistoIcon from "react-native-vector-icons/Fontisto";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";

const Icon = ({module, name, size, color, style}) => {
  let icon = null;
  switch (module) {
    case "AntDesign" :
      icon = (<AntDesignIcon style={style} name={name} size={size} color={color} />);
      break;
    case "MaterialCommunityIcons" :
      icon = (<MaterialCommunityIconsIcon style={{...style, marginTop: -5}} name={name} size={size} color={color} />);
      break;
    case "MaterialIcons" :
      icon = (<MaterialIconsIcon style={{...style, marginTop: -5}} name={name} size={size} color={color} />);
      break;
    case "FontAwesome5" :
      icon = (<FontAwesome5Icon style={style} name={name} size={size} color={color} />);
      break;
    case "Fontisto" :
      icon = (<FontistoIcon style={style} name={name} size={size} color={color} />);
      break;
    default :
      icon = (<FontAwesomeIcon style={style} name={name} size={size} color={color} />);
      break;
  }
  return icon;
};

Icon.propTypes = {
  module: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  style: PropTypes.object,
};
Icon.defaultProps = {
  module: "",
  name: "",
  size: 10,
  color: "#fff",
  style: {},
};
export default Icon;
