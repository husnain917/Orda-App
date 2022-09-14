import React, { useEffect, useState } from 'react';
import { View, TextInput, Image } from 'react-native';

import { Text, List, ListItem, Button } from 'native-base';
import Modal from 'react-native-modal';
import { styles } from './FoodMenuStyle'
import { colors } from 'styles';

export default function AddCoupon({ show, onClose }) {

  return (
    <View>
      <Modal
        isVisible={show}
        onDismiss={() => onClose()}
        swipeDirection={['down']}
        animationIn={'bounceInLeft'}
        animationInTiming={700}
        style={styles.bottomModal}>

        <View
          style={[styles.contentFilterBottom, { backgroundColor: colors.background }]}>
          <View style={styles.contentSwipeDown}>
            <View style={styles.lineSwipeDown} />
          </View>
          <View style={[styles.contentHeader]}>
            <Text style={{ fontWeight: '700', fontSize: 20, flex: 1, textAlign: 'center' }}>Store Temporarily Closed</Text>
          </View>
          <View style={styles.contentBody}>
            <List>
              <ListItem noBorder style={{ flex: 1, justifyContent: 'center', marginVertical: 40 }}>
                  <Image
                    source={require('../../assets/404.png')} resizeMode="cover" style={{ width: 100, height: 100 }}
                  />
              </ListItem>
              <ListItem noBorder>
                <Text style={{textAlign: 'center', lineHeight: 25,}}>
                  The store is currently not accepting online ordering. We apologize for the inconvenience. We will be back open as soon as possible and look forward to serving you!
                </Text>
              </ListItem>
              <ListItem noBorder>
                <View style={{ marginTop: 15, justifyContent: 'center', flex: 1, flexDirection: 'row' }}>
                  <Button rounded style={{ backgroundColor: colors.black, marginBottom: 20 }} onPress={() => onClose(false)}>
                    <Text style={{ marginLeft: 10, marginRight: 10 }}> Close </Text>
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
