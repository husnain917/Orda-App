import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { deviceWidth, hp, wp } from 'utils/responsiveUtil';
import { colors, fonts } from "../../styles";

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
  tabBar: {
    borderBottomWidth: 0,
    marginVertical: 10,
  },
  tabContainer: {
    borderBottomWidth: 0,
  },
  tabText: {
    margin: 5,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 14,
    paddingRight: 14,
    fontSize: 18,
    fontWeight: '500',
    overflow: "hidden",
    borderWidth: 0,
    borderColor: '#000',
    borderRadius: 20,
    borderBottomWidth: 0,
  },
  sectionFooter: {
    paddingTop: 25,
  },
  separator: {
    height: 0,
    width: '96%',
    alignSelf: 'flex-end',
    backgroundColor: '#ffffff'
  },
  sectionHeaderContainer: {
    height: 10,
    backgroundColor: '#f6f6f6',
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1
  },
  sectionHeaderText: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '500',
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 15
  },
  itemContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff'
  },
  itemTitle: {
    flex: 1,
    fontSize: 20,
    color: '#131313'
  },
  itemPrice: {
    fontSize: 18,
    color: '#131313'
  },
  itemDescription: {
    marginTop: 10,
    color: '#b6b6b6',
    fontSize: 16
  },
  itemRow: {
    flexDirection: 'row'
  },
  htmlContainerStyle: {
    fontSize: 10,
    color: colors.darkGray,
  },
  bottomModal: {
    justifyContent: 'flex-end',
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
    justifyContent: 'center',
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
  searchIconBox: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(40),
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchFilterIcon: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(30),
    justifyContent: 'center',
    alignItems: 'center'
  },
  backIconBox: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(40),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(5)
  },
  inputContainer: {
    flex: 1,
    height: hp(40),
    backgroundColor: 'white',
    borderRadius: wp(25),
    paddingHorizontal: wp(16),
    marginRight: wp(10),
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: wp(15),
  },
  inputBox: {
    height: hp(60),
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: StatusBar.currentHeight + hp(5),
    left: 0,
    width: deviceWidth,
    paddingHorizontal: wp(10),
    paddingTop: hp(2),
    // marginTop: Platform.OS === 'android' ? hp(42) : null,
  },
  searchBarContainer: {
    position: 'absolute',
    right: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 0,
  },
  foodItemTag: {
    marginRight: wp(5),
    borderRadius: wp(20),
    paddingHorizontal: wp(8),
    paddingVertical: wp(5),
    justifyContent: 'center',
    alignItems: 'center'
  },
  foodItemText: {
    fontSize: wp(10.5),
  }
});
