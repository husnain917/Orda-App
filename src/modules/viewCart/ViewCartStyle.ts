import { StyleSheet } from 'react-native';
import { colors } from "../../styles";

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
  icon: { position: 'absolute', top: 18 },
  text: { position: 'absolute', bottom: 10, color: colors.textInputColor },
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
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  subContainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  content: {
    flex: 1,
  },
  buttonView: {
    padding: 15,
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  title: {
    color: colors.black,
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold"
  },
  border: {
    borderWidth: 0.5,
    borderColor: "rgba(123, 132, 151, 0.4)",
    marginHorizontal: 12
  },
  itemContainer: {
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center"
  },
  itemText: {
    color: colors.black,
    fontSize: 16,
    textTransform: 'capitalize' , 
  },
  button: {
    backgroundColor: colors.black, height: 50, justifyContent: 'center', alignItems: 'center'
  },
  buttonText: {
    color: colors.ButtonTextColor, fontSize: 16, fontWeight: '500',
  },
  backTextWhite: {
    color: '#FFF',
  },
  rowFront: {
    // alignItems: 'center',
    backgroundColor: '#fff',
    // justifyContent: 'center',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 60,
  },
  backRightBtnLeft: {
    right: 50,
  },
  backRightBtnRight: {
    right: 0,
  },
  trash: {
    height: 25,
    width: 25,
  },
  iconContainer: {
    justifyContent: 'center', alignItems: "center", width: 30, height: 30, backgroundColor: '#F5F5F5', borderRadius: 15,
  },
  quantity: {
    paddingVertical: 5, paddingHorizontal: 10, backgroundColor: "#F5F5F5", marginRight: 5
  },
  itemRow:{
    flexDirection: "row", alignItems: "center", width: "70%" 
  },
  modifierName:{
    fontSize: 14, paddingBottom: 7, fontWeight: '300', textTransform: 'capitalize'
  },
});
