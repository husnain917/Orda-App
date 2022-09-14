import { StyleSheet, Dimensions } from 'react-native';
import { colors } from "../../styles";
const { height, width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  button: { lineHeight: 15, marginTop: 10, fontWeight: '600', color: colors.blue },
  insta: { right: 10, bottom: 10, position: 'absolute' },
  container: { flex: 1, margin: 0, padding: 0 },
  timestamp: { color: colors.lightGray, fontSize: 14, lineHeight: 25, alignSelf: 'flex-start', fontWeight: '400' },
  caption: { flex: 1, color: colors.black, fontSize: 15, lineHeight: 20, textAlign: 'left', width: '100%' },
  following: { alignSelf: 'center', fontSize: 18, lineHeight: 30, fontWeight: '600', paddingVertical: 20 },
  img: { height: 300, backgroundColor: 'gray', marginBottom: 10, width: width, resizeMode: 'contain' },
  card: { flexDirection: 'column', justifyContent: 'flex-start', marginBottom: 10,  },
  icon: { position: 'absolute', top: 18 },
  text: { position: 'absolute', bottom: 10, color: colors.textInputColor }
});
