import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Text, List, ListItem, Button, Left, Right } from 'native-base';
import Modal from 'react-native-modal';
import { styles } from './AccountStyles'
import { colors } from 'styles';
import AntDesignIcon from "react-native-vector-icons/AntDesign";
import foodCore from "../../core/food";
import { useDispatch, useSelector } from "react-redux";

export default function AccountModal({ show, dismissed, onClose, logout }) {
  const dispatch = useDispatch();
  const setAccount = (account) => dispatch(foodCore.actions.setAccount(account))
  const setOrdaId = (account) => dispatch(foodCore.actions.setOrdaId(account))
  const setMyAddress = (address) => dispatch(foodCore.actions.setMyAddress(address))
  const resetCustomerCards = () => dispatch(foodCore.actions.setCustomerCards([]))
  
  const accountMobile = useSelector(state => foodCore.selectors.getAccountMobile(state));
  const currentMerchant = useSelector(state => foodCore.selectors.currentMerchant(state));

  const logoutPressed = () => {
    setAccount(null)
    setOrdaId(null)
    setMyAddress(null)
    resetCustomerCards()
    onClose()
    logout()
  }

  const fetchJSON = async (merchantId, phoneNumber) => {
    try {
      const url = `https://storage.googleapis.com/fav-ordering.appspot.com/${merchantId}/${phoneNumber}`
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      return data
    } catch (e) {
      console.log("done")
      return {}
    }
  }

  const  deleteAccountPressed = async () => {
    logoutPressed()
    await fetchJSON(currentMerchant , accountMobile)
  }

  return (
    <View>
      <Modal
        isVisible={show}
        onModalHide={dismissed}
        onBackdropPress={dismissed}
        onSwipeComplete={() => {
          onClose()
        }}
        swipeDirection={['down']}
        style={styles.bottomModal}>
        <View
          style={[styles.contentFilterBottom, { backgroundColor: colors.background }]}>
          <View style={styles.contentSwipeDown}>
            <View style={styles.lineSwipeDown} />
          </View>
          <View style={styles.contentBody}>

            <List>
              <ListItem style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
                <Left style={{ flex: 0.5 }}>
                  <TouchableOpacity onPress={logoutPressed} style={{ marginBottom: 10, flex: 1, justifyContent: 'flex-start', flexDirection: 'row' }}>
                    <AntDesignIcon name={'logout'} size={18} />
                    <Text style={{ fontWeight: '300', fontSize: 18, marginLeft: 5 }}>Logout </Text>
                  </TouchableOpacity>
                </Left>
              </ListItem>
              <ListItem style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
                <Left style={{ flex: 0.9 }}>
                  <TouchableOpacity onPress={deleteAccountPressed} style={{ marginBottom: 10, flex: 1, justifyContent: 'flex-start', flexDirection: 'row' }}>
                    <AntDesignIcon name={'deleteuser'} size={18} color={'red'} />
                    <Text style={{ fontWeight: '300', fontSize: 18, marginLeft: 5, color:'red' }}>Delete Your Account</Text>
                  </TouchableOpacity>
                </Left>
              </ListItem>

            </List>
          </View>
        </View>
      </Modal>
    </View>
  );
}
