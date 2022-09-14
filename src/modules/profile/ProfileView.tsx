import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, View, Text, Modal, ActivityIndicator, ImageBackground, ScrollView, Linking, TouchableOpacity, Alert } from 'react-native';
import { TextInput, SMHeader, SMContent, SMFooter } from '../../components';
import { Button, Card, CardItem, Container, List, ListItem, Body } from 'native-base';
import { fonts, colors } from '../../styles';
import foodCore from "../../core/food";
import { useFirestore } from 'react-redux-firebase';
import get from 'lodash/get'
import map from 'lodash/map'
import find from 'lodash/find'
import take from 'lodash/take'
import words from 'lodash/words'
import includes from 'lodash/includes'
import { generateId, startOrderListener } from 'utils/orderListener';
import { trimPrice } from 'utils/helper';
import AntDesignIcon from "react-native-vector-icons/AntDesign";
import AccountModal from './AccountModal';

const ProfileScreen = props => {
  const dispatch = useDispatch()
  const firestore = useFirestore()
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setLoading] = useState(false)
  const [showLoyaltyProgram, setShowLoyaltyProgram] = useState(false)
  const [accruals, setAccruals] = useState([])
  const [tiers, setTiers] = useState([])
  const [showAccountModal, setShowAccountModal] = useState(false)

  const addOrdaOperation = (firestore, locationId, item) => dispatch(foodCore.actions.addOrdaOperation(firestore, locationId, item))
  const setOrdaId = (ordaId) => dispatch(foodCore.actions.setOrdaId(ordaId))
  const setCurrency = (id, country) => dispatch(foodCore.actions.setCurrency({ id, country }))
  const cartListener = (doc) => dispatch(foodCore.actions.cartListener(doc))
  const locationId = useSelector(state => foodCore.selectors.getLocationId(state));
  const currency: any = useSelector(state => foodCore.selectors.getCurrency(state));
  const ordaOperations = useSelector(state => foodCore.selectors.getOrdaOperations(state));
  const account = useSelector(state => foodCore.selectors.getAccount(state));
  const accountName = useSelector(state => foodCore.selectors.getAccountName(state));
  const accountError = useSelector(state => foodCore.selectors.getAccountError(state));
  const loyaltyError = useSelector(state => foodCore.selectors.getLoyaltyError(state));
  const loyaltyBalance = useSelector(state => foodCore.selectors.getAccountLoyaltyBalance(state));
  const term = useSelector(state => foodCore.selectors.getLoyaltyTerm(state));
  const appSettings = useSelector(state => foodCore.selectors.getAppSettings(state));

  const onlyFirstName = get(appSettings, `apps.apps-loyalty.requireOnlyFirstName`, true)
  const [nameErrorMessage, setNameErrorMessage] = useState(null)

  const [currentOpId, setCurrentOpId] = useState(null)

  const initOrder = async () => {
    const ordaId = generateId()
    await setOrdaId(ordaId)
    const location = getLocation()
    await setCurrency(location.currency, location.country)
    startOrderListener(firestore, ordaId, cartListener, () => {
      // error ?
    })
    const mobile = get(account, 'mobile')
    await addOrdaOperation(firestore, location.id, {
      createdAt: new Date().toISOString(),
      mobile,
      prefix: `+${get(currency, 'prefix') || 1}`,
      type: -1
    })
  }

  const isOriginMenu = props.navigation.getParam('origin') === 'menu'

  useEffect(() => {
    if (isOriginMenu) {
      initOrder()
    }
  }, []) // runs once

  useEffect(() => {
    if (accountError) {
      setLoading(false)
      return
    }
    if (account && account.mobile) {
      setLoading(false)
      if (isOriginMenu) {
        setShowLoyaltyProgram(true)
      } else {
        goto('CartScreen')
      }
    }
  }, [account, accountError, ordaOperations])

  useEffect(() => {
    const accruals = getAccrualsFromSettings()
    const loyalty = getLoyalty()
    const tiers = get(loyalty, 'reward_tiers', [])
    setTiers(tiers)
    setAccruals(accruals)
  }, [appSettings])

  const goto = (screen) => {
    props.navigation.pop()
    props.navigation.navigate(screen);
  }

  const getLoyalty = () => {
    const loyalty = get(appSettings, 'loyalty[0]', null)
    if (get(loyalty, 'status') === 'ACTIVE') {
      return loyalty
    }
    return {}
  }

  const getProgramId = () => {
    const loyalty = getLoyalty();
    return includes(get(loyalty, 'location_ids'), locationId) ? loyalty.id : null
  }

  const getLocation = () => {
    const loyalty = getLoyalty();
    const id = get(loyalty, 'location_ids[0]')
    return id ? find(get(appSettings, 'locations', []), { id }) : {}
  }

  const getAccrualsFromSettings = () => {
    const loyalty = getLoyalty();
    const accruals = get(loyalty, 'accrual_rules')
    if (!accruals || accruals.length === 0) {
      return ['']
    }
    const symbol = get(currency, 'symbol') || '$'
    return map(take(accruals, 1), accrual => {
      switch (accrual.accrual_type) {
        case 'VISIT':
          return `Earn ${accrual.points} ${term} for each visit. ${symbol}${trimPrice(get(accrual, 'visit_minimum_amount_money.amount', 0))} minimum purchase`
        case 'SPEND':
          return `Earn ${accrual.points} ${term} for every ${symbol}${trimPrice(get(accrual, 'spend_amount_money.amount', 0))} spent`
        case 'CATEGORY':
        case 'ITEM_VARIATION':
          return `Earn ${accrual.points} ${term} for each purchase of categories and items`
        default:
          return `Earn ${accrual.points} ${term}`
      }
    })
  }

  const registerHandler = async () => {
    const validName = isValidName()
    if (!validName) {
      return
    }
    setLoading(true)
    const mobile = phoneNumber.replace(/\D/g, '')
    const programId = getProgramId()

    let id = null
    if (isOriginMenu) {
      const location = getLocation()
      id = await addOrdaOperation(firestore, location.id, {
        programId,
        mobile,
        name: username,
        prefix: `+${get(currency, 'prefix') || 1}`,
        type: 4
      })
    } else {
      id = await addOrdaOperation(firestore, locationId, {
        programId,
        mobile,
        name: username,
        prefix: `+${get(currency, 'prefix') || 1}`,
        type: 4
      })
    }
    setCurrentOpId(id)
  }

  const isDisabled = () => {
    return !username || !phoneNumber || !phoneNumber.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
  }

  const errorMessage = () => {
    if (nameErrorMessage) {
      return nameErrorMessage
    }
    return (accountError || get(loyaltyError, currentOpId)) ? "Loyalty phone number is not formatted correctly" : null
  }

  const handlePrivacyPolicy = async () => {
    const url = "https://getorda.com/privacy-policy"
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  }

  const isValidName = () => {
    if (onlyFirstName) {
      return true
    }
    const invalidName = words(username).length < 2
    if (invalidName) {
      setNameErrorMessage('Please provide your first and last name')
      return false
    }
    return true
  }

  const usernameChange = (value) => {
    setUsername(value)
    setNameErrorMessage('')
  } 

  const onDeleteAccount = () => {
    setShowAccountModal(true)
  }

  return (
    <View style={styles.container}>
      <SMHeader title="Your Loyalty & Rewards" navigation={props.navigation} isBack isMenu={false} isRefresh={false} isAccountDelete={showLoyaltyProgram} onDeleteAccount={onDeleteAccount} />
      {showLoyaltyProgram ? <Container>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Card style={{ flex: 1, padding: 0, paddingTop: 0, elevation: 12, position: 'absolute', marginTop: 40, width: '100%', height: 200, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                <CardItem header bordered style={{ flex: 1, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0,  margin: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20  }}>
                  <ImageBackground style={[styles.avatar, { borderRadius: 20, overflow: 'hidden' }]}
                    source={{ uri: get(appSettings, 'general.logoUrl') }} >
                    <View style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row'  }}>
                      <Button
                        dark
                        iconLeft
                        rounded
                        style={{ marginLeft: 15, marginTop: 15, height: 33, backgroundColor: '#333333', paddingVertical: 2, paddingHorizontal: 15, }}
                      >
                        <AntDesignIcon color={colors.ButtonTextColor} name='staro' size={16} />
                        <Text numberOfLines={1} style={{ paddingLeft: 6, fontSize: 14, fontWeight: '600', color: colors.ButtonTextColor }}>
                          {accountName}
                        </Text>
                      </Button>
                      { !!loyaltyBalance && <Button
                        dark
                        iconLeft
                        rounded
                        style={{ marginLeft: 80, marginTop: 15, height: 33,  backgroundColor: '#333333', paddingVertical: 2, paddingHorizontal: 15, }}
                      >
                        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: colors.ButtonTextColor }}>
                          {loyaltyBalance} {term}
                        </Text>
                      </Button>}
                    </View>
                  </ImageBackground>
                </CardItem>
              </Card>
            </View>
          </View>
          <View style={styles.body}>
            <View style={styles.containerRewards}>
              {accruals && accruals.length > 0 && <View style={styles.bodyContent}>
                <Button
                  iconLeft
                  rounded
                  style={{ height: 33, backgroundColor: '#EBEBEB', marginBottom: 15, paddingVertical: 2, paddingHorizontal: 15 }}
                >
                  <AntDesignIcon name='gift' size={16} />
                  <Text numberOfLines={1} style={{ paddingLeft: 6, fontSize: 14, fontWeight: '600', }}>
                    {get(appSettings, 'general.appName')} Rewards
                  </Text>
                </Button>
                <View>
                  {accruals.map(title =>
                    <Text style={{ color: colors.darkGray }}>{title}</Text>
                  )}
                </View>
                <View style={{
                  height: 250
                }}>
                  <ScrollView style={{
                    marginRight: 5,
                  }}>
                    <List style={{ paddingTop: 20 }}>
                      {tiers.map((tier: any) => {
                        return <ListItem noBorder>
                          <Button style={{ borderRadius: 25, flexDirection: 'column', justifyContent: 'center', width: 45, height: 45, marginRight: 10, backgroundColor: get(appSettings, 'theme.menuBackgroundColor') }}>
                            <Text style={{ color: 'white' }} numberOfLines={1}>{tier.points}</Text>
                            <Text style={{ color: 'white', fontSize: 9 }} numberOfLines={1}>{term}</Text>
                          </Button>
                          <Text>{tier.name}</Text>
                        </ListItem>
                      })
                      }
                    </List>
                  </ScrollView>
                </View>
              </View>}
            </View>

          </View>
        </View>
        <SMFooter style={{ height: 50, marginBottom: 2 }}>
          <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 20 }}>
            <Button
              testID="lets-order"
              full
              rounded
              style={{ backgroundColor: colors.black, height: 50, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => props.navigation.goBack(null)}
            >
              <Text style={{ color: colors.white }}>Let's Order</Text>
            </Button>
          </View>

        </SMFooter>
      </Container> :
        <Container>
          <SMContent style={{ paddingHorizontal: 20 }}>
            <Modal
              transparent={true}
              animationType={'none'}
              visible={isLoading && ordaOperations && ordaOperations.length > 0}>
              <View style={styles.modalBackground}>
                <View style={styles.activityIndicatorWrapper}>
                  <ActivityIndicator animating={true} />
                  <Text style={{ paddingTop: 10, fontSize: 11 }}>{"Sign-in your account..."}</Text>
                </View>
              </View>
            </Modal>
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <Text style={styles.title}>Join {get(appSettings, 'general.appName')}. Let's set your name and phone so we will text you once your order's ready.</Text>
            </View>
            <View style={{ alignItems: 'center', paddingVertical: 10, }}>
              <TextInput
                testID="field-name"
                placeholder={ onlyFirstName ? "Your Name" : "Full Name"}
                type="bordered"
                placeholderTextColor={'#cecece'}
                value={username}
                autoCompleteType={'name'}
                keyboardType={'default'}
                style={{ color: colors.black, marginBottom: 10, height: 50, borderRadius: 50, }}
                onChangeText={usernameChange}
                autoCapitalize
              />
            </View>
            <View style={{ alignItems: 'center', paddingVertical: 10, }}>
              <TextInput
                testID="field-phone"
                placeholder="Phone"
                type="bordered"
                placeholderTextColor={'#cecece'}
                value={phoneNumber}
                autoCompleteType={'tel'}
                keyboardType={'phone-pad'}
                style={{ color: colors.black, marginBottom: 10, height: 50, borderRadius: 50, }}
                onChangeText={value => setPhoneNumber(value)}
              />
            </View>
            <View>
              <Text style={{ textAlign: 'center', width: '100%', color: 'red' }}>{errorMessage()}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Button
                disabled={isDisabled()}
                full
                rounded
                style={{ backgroundColor: isDisabled() ? colors.grey : colors.black, height: 50, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                onPress={registerHandler}
              >
                <Text style={{ color: colors.white }} testID="join">Join </Text>
              </Button>
            </View>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity style={{ flexDirection: 'column' }} onPress={() => handlePrivacyPolicy()}>
                <Text style={[styles.title, { fontSize: 11 }]}>You will receive a text message when your order is ready and our store may contact you with questions or suggestions. For more details read our <Text style={[styles.title, { fontSize: 11, textDecorationLine: 'underline' }]}>privacy policy, terms an conditions.</Text></Text>
              </TouchableOpacity>
            </View>
          </SMContent>
        </Container>
      }
      <AccountModal show={showAccountModal} dismissed={()=> (setShowAccountModal(false))} onClose={()=> (setShowAccountModal(false))} logout={()=> (setShowLoyaltyProgram(false), goto('Home'))} ></AccountModal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  section: {
    flex: 1,
    position: 'relative',
  },
  title: {
    color: colors.textInputColor,
    fontFamily: fonts.primaryBold,
    fontWeight: '500',
    fontSize: 18,
    letterSpacing: 0.04,
    paddingVertical: 40,
  },
  lightText: {
    color: colors.white,
  },
  quickFacts: {
    height: 60,
    flexDirection: 'row',
  },
  quickFact: {
    flex: 1,
  },
  infoSection: {
    flex: 1,
  },
  infoRow: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  hr: {
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    marginLeft: 20,
  },
  infoIcon: {
    marginRight: 20,
  },
  bottomRow: {
    height: 80,
    flexDirection: 'row',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  position: {
    color: colors.white,
    fontFamily: fonts.primaryLight,
    fontSize: 16,
    marginBottom: 3,
  },
  company: {
    color: colors.white,
    fontFamily: fonts.primaryRegular,
    fontSize: 16,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  quickInfoText: {
    color: colors.white,
    fontFamily: fonts.primaryRegular,
  },
  bottomImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  header: {
    backgroundColor: "#1E1518",
    height: 140
  },
  headerContent: {
    padding: 30,
    alignItems: 'center'
  },
  avatar: {
    flex: 1,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20
  },
  name: {
    maxWidth: 140,
    backgroundColor: '#333333',
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: '600',
    borderRadius: 18,
    height: 25,
  },
  textInfo: {
    fontSize: 18,
    marginTop: 20,
    color: "#696969",
  },
  bodyContent: {
    paddingTop: 5,
  },
  body: {
    marginTop: 120,
  },
  containerRewards: {
    paddingTop: 10,
    marginHorizontal: 30,
  },
  menuBox: {
    backgroundColor: "#DCDCDC",
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    shadowColor: 'black',
    shadowOpacity: .2,
    shadowOffset: {
      height: 2,
      width: -2
    },
    elevation: 4,
  },
  icon: {
    width: 60,
    height: 60,
  },
  info: {
    fontSize: 22,
    color: "#696969",
  }
});