import { StyleSheet, Dimensions } from 'react-native';
import { colors } from "../../styles";

export const styles = StyleSheet.create({
  button: {
    margin: 5,
    borderRadius: 5,
    backgroundColor: colors.backgroundLight,
    height: Dimensions.get('window').width / 2 - 70,
    minWidth: Dimensions.get('window').width / 2 - 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    padding: 30,
  },
  icon: { position: 'absolute', top: 18 },
  text: { position: 'absolute', bottom: 10, color: colors.textInputColor },
  inputContainer: {
    marginTop: 23,
    height: 40,
    borderWidth: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 0,
    marginHorizontal: 13,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // width:"100%"
  },
  inputField: {
    width: "90%",
    color: "black",
    marginHorizontal: 0,
  },
  searchFieldStyles: {
    position: 'absolute',
    top: '14%',
  },
  // map view
  container: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.1)",
  },
  subContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  callout: {
    padding: 5,
  },
  order: {
    textAlign: 'right',
    marginTop: 12,
    fontWeight: 'bold',
    color: '#084DF8',
    fontSize: 16,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  storename: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 25
  },
  address: {
    maxWidth: 250,
    lineHeight: 22,
  }
});
