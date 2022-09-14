import React, { useEffect, useState, } from 'react';
import { useSelector } from "react-redux";
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, CardItem, Card, Right, List, ListItem, Left } from 'native-base';
import Modal from 'react-native-modal';
import { colors } from '../styles';
import Icon from "./Icon";
import foodCore from '../core/food'
import get from 'lodash/get'

export default function Redeem(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const accountLoyalty = useSelector(state => foodCore.selectors.getAccountLoyalty(state));
  const loyalty = useSelector(state => foodCore.selectors.getLoyalty(state));
  const accountName = useSelector(state => foodCore.selectors.getAccountName(state));
  const appliedReward = useSelector(state => foodCore.selectors.getAppliedReward(state));
  const term = useSelector(state => foodCore.selectors.getLoyaltyTerm(state, true));
  const { style, onApply, onUnredeem } = props;
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    if (accountLoyalty) {
      setPoints(get(accountLoyalty, 'balance'))
    }
  }, [accountLoyalty])

  useEffect(() => {
    if (loyalty) {
      const tiers = get(loyalty, 'reward_tiers')
      setTiers(tiers)
    }
  }, [loyalty])

  const openModal = () => {
    !!loyalty && setModalVisible(true);
  };

  const onSelect = (tier) => {
    setModalVisible(false);
    if (tier.points <= points) {
      onApply(tier.id);
    }
  };

  return (
    <View>
      <Modal
        isVisible={modalVisible}
        onSwipeComplete={() => {
          setModalVisible(false);
        }}
        swipeDirection={['down']}
        style={styles.bottomModal}>
        <View
          style={[styles.contentFilterBottom, { backgroundColor: colors.background }]}>
          <View style={styles.contentSwipeDown}>
            <View style={styles.lineSwipeDown} />
          </View>
          <View style={styles.contentHeader}>
            <Text style={{ fontWeight: '500', fontSize: 18 }}>Our Rewards Program</Text>
          </View>
          <View style={styles.contentBody}>

            <List>
              {tiers.map((tier: any) => {
                return <ListItem noBorder>
                  <Left style={{ width: '80%'}}>
                    <Button style={{ borderRadius: 35, flexDirection: 'column', justifyContent: 'center', width: 60, height: 60, marginRight: 10, marginLeft: -12, backgroundColor: props.menuBackgroundColor }}>
                      <Text style={{ color: 'white', fontSize: 13 }} numberOfLines={1}>{tier.points}</Text>
                      <Text style={{ color: 'white', fontSize: 9 }} numberOfLines={1}>{term}</Text>
                    </Button>                    
                    <Text style={{ width: Platform.OS == 'ios' ? 170 : 200, fontSize: 14 }}>{tier.name}</Text>
                  </Left>
                  <Right style={{ padding: 0, margin: 0}}>
                    <Button disabled={points < tier.points} transparent style={{ padding: 0, margin: 0 }} onPress={ () => { onSelect(tier) }}>
                      <Text style={{ paddingLeft: 0, paddingRight: 0, color: (points < tier.points ? 'grey': 'blue')}}>Redeem</Text>
                    </Button>
                  </Right>
                </ListItem>
              })
              }
            </List>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={[styles.contentForm, {
          backgroundColor: colors.background,
        }, style]}
        onPress={() => get(appliedReward, 'id') ? onUnredeem(get(appliedReward, 'id')) : openModal()}>
        <Card transparent style={{ flex: 1, flexDirection: 'row', marginBottom: 20 }}>
          <CardItem style={{ flexDirection: 'row', backgroundColor: '#eeeeee', }}>
            <Icon style={{ paddingTop: 5 }} module={'MaterialCommunityIcons'} name={'trophy-outline'} color={colors.black} size={19} />
            { !loyalty && 
            <View style={{ marginHorizontal: 10 }}>
              <Text>{accountName}, it's great seeing you!</Text>
            </View>}
            { !!loyalty && 
            <View style={{ marginHorizontal: 10, flexDirection: 'row' }}>
            { (points > 0) ?
              <Text>{accountName}, you earned {points} {term}</Text> :
              <Text>{accountName}, start earning {term}</Text>
            }
            { (points > 0) ?
              <Text style={{ color: 'blue' }}> { get(appliedReward, 'id') ? 'Unredeem' : 'Redeem' }</Text> :
              <Text style={{ color: 'blue' }}> See Rewards</Text>
            }
          </View>}
          </CardItem>
        </Card>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contentForm: {
    padding: 4,
    width: '100%',
    alignItems: 'center',
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
    justifyContent: 'flex-start',
    paddingLeft: 0,
    paddingTop: 20,
    minHeight: 200,
  },
  takeButton: {
    margin: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('screen').width / 3 - 30,
    height: Dimensions.get('screen').width / 3 - 30,
    backgroundColor: colors.background
  },
  activeTakeButton: {
    backgroundColor: colors.yellow,
  },
  takeButtonText: {
    color: colors.textInputColor,
    fontSize: 12,
  },
  contentBodyTailer: {},
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

const pickerSelectStyles = (colors) => StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 0,
    borderColor: colors.textInputColor,
    borderRadius: 4,
    color: colors.textInputColor,
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderWidth: 0,
    borderColor: colors.textInputColor,
    borderRadius: 8,
    color: colors.textInputColor,
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
    top: 18,
    right: 5,
  },
});
