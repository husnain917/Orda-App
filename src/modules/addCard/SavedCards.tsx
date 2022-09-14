import React, { useEffect, useState } from 'react';
import { View, } from 'react-native';

import { Text, List, ListItem, Left, Right, Button } from 'native-base';
import Modal from 'react-native-modal';
import { styles } from './AddCardStyle'
import { colors } from 'styles';
import Icon from 'components/Icon';
import filter from 'lodash/filter'

export default function SavedCards({ show, customerCards, onNew, onSelected, onClose, onDelete, customerId, currentMerchant }) {
  const [editMode, setEditMode] = useState(false);
  const [operationNew, setOperationNew] = useState(false);
  const [operationSelect, setOperationSelect] = useState(null);
  const [operationDelete, setOperationDelete] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const cs = filter(customerCards, c => {
      return !c.card.merchantId || !currentMerchant || c.card.merchantId === currentMerchant
    })
    setCards(cs)
  }, [customerCards, currentMerchant])

  const addCard = () => {
    setOperationNew(true)
    onClose()
  }
  const onOperationSelect = (card) => {
    setOperationSelect(card)
    onClose()
  }
  const deletePressed = (card) => {
    setOperationDelete(card)
    onClose()
  }
  const dismissed = () => {
    if (operationNew) {
      setTimeout(() => onNew(), 100)
    }
    if (operationSelect) {
      setTimeout(() => onSelected({ nonce : operationSelect.cardId, customer_id: customerId }), 100)
    }
    if (operationDelete) {
      setTimeout(() => onDelete(operationDelete), 100)
    }
    setOperationNew(false)
    setOperationSelect(null)
    setOperationDelete(null)
    setEditMode(false)
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
          <View style={[styles.contentHeader]}>
            <Text style={{ fontWeight: '700', fontSize: 20, flex: 1 }}>My Saved Cards</Text>
            { (cards.length > 0) && <Button transparent icon onPress={() => setEditMode(!editMode) }>
              <Icon style={{ paddingRight: 20 }} module={'MaterialCommunityIcons'} name={'credit-card-multiple'} size={20} color={'#FF1133CC'}></Icon>
            </Button>}
          </View>
          <View style={styles.contentBody}>

            <List>
              {cards.map((card: any) => {
                return <ListItem noBorder>
                  <Left style={{ width: '50%' }}>
                    <View>
                      <Text style={{ fontSize: 18 }} >💳  {card.card.brand} {card.card.lastFourDigits}</Text>
                      <Text style={{ color: colors.lightGray, }}>expires {card.card.expirationMonth}/{card.card.expirationYear}</Text>
                    </View>
                  </Left>
                  <Right>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      { editMode && <Button transparent icon onPress={() => { deletePressed(card) }}>
                        <Icon style={{ paddingRight: 20 }} module={'MaterialCommunityIcons'} name={'trash-can'} size={25} color={'#FF1133CC'}></Icon>
                      </Button>}
                      { !editMode && <Button rounded style={{ backgroundColor: colors.black }} onPress={() => { onOperationSelect(card) }}>
                        <Text> Pay </Text>
                      </Button>}

                    </View>
                  </Right>
                </ListItem>
              })
              }
              <ListItem noBorder>
                <View style={{ marginTop: 15, justifyContent: 'center', flex: 1, flexDirection: 'row' }}>
                  <Button rounded style={{ backgroundColor: colors.black, marginBottom: 20 }} onPress={addCard}>
                    <Text style={{ marginLeft: 10, marginRight: 10 }}> Add Card </Text>
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
