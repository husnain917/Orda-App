import { StyleSheet, Dimensions } from 'react-native';
import {colors} from "../../styles";

export const styles = StyleSheet.create({
  button: {
    margin: 5,
    borderRadius: 5,
    backgroundColor: colors.backgroundLight,
    height: Dimensions.get('window').width/2 - 70,
    minWidth: Dimensions.get('window').width/2 - 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    padding: 30,
  },
  icon: {position: 'absolute', top:18},
  text: {position: 'absolute', bottom:10, color: colors.textInputColor}
});
