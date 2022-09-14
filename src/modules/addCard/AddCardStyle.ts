import { StyleSheet, Dimensions } from 'react-native';
import {colors} from "../../styles";

export const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
    zIndex: 999999,
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 90,
    width: 140,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },  
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
  text: {position: 'absolute', bottom:10, color: colors.textInputColor},
  contentForm: {
    padding: 4,
    width: '100%',
    alignItems: 'center',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  topModal: {
    justifyContent: 'flex-start',
    margin: 0,
  },
  contentFilterBottom: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 20,
  },
  contentSwipeDown: {
    paddingTop: 10,
    alignItems: 'center',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30
  },
  contentSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  contentBodyIcon: {
    width: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentBody: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingLeft: 0,
    paddingTop: 20,
    minHeight: 200,
  },
  lineSwipeDown: {
    width: 30,
    height: 2.5,
    backgroundColor: colors.gray,
  },
  contentActionModalBottom: {
    flexDirection: 'row',
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
});
