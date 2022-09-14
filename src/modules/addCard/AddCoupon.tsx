import React, { useEffect, useState } from 'react';
import { View, TextInput, } from 'react-native';

import { Text, List, ListItem, Button } from 'native-base';
import Modal from 'react-native-modal';
import { styles } from './AddCardStyle'
import { colors } from 'styles';
import Icon from 'components/Icon';
import filter from 'lodash/filter'

export default function AddCoupon({ show, onClose, onCancel }) {

  const [code, setCode] = useState('')

  const addCouponClicked =() => {
    onClose(code)
  }

  return (
    <View>
      <Modal
        isVisible={show}
        onDismiss={() => onClose() }
        swipeDirection={['left', 'up']}
        animationIn={'bounceInLeft'}
        animationInTiming={700}
        style={styles.topModal}>
        
        <View
          style={[styles.contentFilterBottom, { backgroundColor: colors.background }]}>
          <View style={styles.contentSwipeDown}>
            <View style={styles.lineSwipeDown} />
          </View>
          <View style={[styles.contentHeader]}>
            <Text style={{ fontWeight: '700', fontSize: 20, flex: 1 }}>Enter Your Coupon</Text>
          </View>
          <View style={styles.contentBody}>

            <List>
              <ListItem noBorder>
                <TextInput
                  autoFocus
                  autoCorrect={false}
                  autoCapitalize={"characters"}
                  onChangeText={(text) => setCode(text)}
                  style={{
                    flex: 1, borderWidth: 0.5,
                    borderColor: colors.lightGray,
                    borderRadius: 20,
                    paddingHorizontal: 20, height: 40, textTransform: 'uppercase'
                  }}
                />
              </ListItem>
              <ListItem noBorder>
                <View style={{ marginTop: 15, justifyContent: 'center', flex: 1, flexDirection: 'row' }}>
                  <Button rounded style={{ backgroundColor: colors.white, marginBottom: 20 }} onPress={onCancel}>
                    <Text style={{ marginLeft: 10, marginRight: 10, color: colors.lightBlack }}> Cancel </Text>
                  </Button>
                  <Button rounded style={{ backgroundColor: colors.black, marginBottom: 20 }} onPress={addCouponClicked}>
                    <Text style={{ marginLeft: 10, marginRight: 10 }}> Add Coupon </Text>
                  </Button>
                </View>
              </ListItem>
            </List>
          </View>
        </View>
      </Modal>
    </View>
  );
}
