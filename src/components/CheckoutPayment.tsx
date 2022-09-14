import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Picker, Dimensions, Image} from 'react-native';
import {Text, Button} from 'native-base';
import Modal from 'react-native-modal';
import {colors} from '../styles';
import { trimPrice } from 'utils/helper';

export default function CheckoutPayment(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const {style, onCancel, disabled, totalPrice, onComplete} = props;

  
  const openModal = () => {
    setModalVisible(true);
  };

  const selectPayment = async () => {
    setModalVisible(false);
    onComplete()
  }
  return (
    <View style={{ flex: 1}} >
      <Modal
        isVisible={modalVisible}
        onSwipeComplete={() => {
          setModalVisible(false);
          onCancel();
        }}
        swipeDirection={['down']}
        style={styles.bottomModal}>
        <View
          style={[styles.contentFilterBottom, {backgroundColor: colors.background}]}>
          <View style={styles.contentSwipeDown}>
            <View style={styles.lineSwipeDown}/>
          </View>
          <View style={styles.contentBody}>
            <Button
              full
              style={{marginTop: 10, marginBottom: 20, backgroundColor: colors.yellowDark}}
              onPress={() => selectPayment()}>
              <Text style={{color: colors.ButtonTextColor}}>By with G-Pay</Text>
            </Button>
            <Button
              full
              style={{marginTop: 10, marginBottom: 20, backgroundColor: colors.yellowDark}}
              onPress={() => selectPayment()}>
              <Text style={{color: colors.ButtonTextColor}}>Use Credit Card</Text>
            </Button>
          </View>
        </View>
      </Modal>
      <Button full rounded disabled={disabled} style={{ height: 50, backgroundColor: disabled ? colors.grey : colors.black, marginBottom: 20,}} onPress={() => openModal()}>
        <Text  style={{color: colors.ButtonTextColor}}>Checkout ${ trimPrice(totalPrice) }</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  contentForm: {
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'flex-start',
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
    paddingVertical: 10,
    alignItems: 'flex-start',
    marginTop: 20
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
    justifyContent: 'center',
    paddingLeft: 10,
    height: 250
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
