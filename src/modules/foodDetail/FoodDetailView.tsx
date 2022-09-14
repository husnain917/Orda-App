import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, Platform, Animated, Dimensions, findNodeHandle } from 'react-native';
import { Container, Button, Label, Textarea } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { SMHeader, SimpleRadioGroup as RadioGroup } from "../../components";
import colors from "../../themes/dark/colors";
import { notEmpty, thumbnail, trimPrice } from "utils/helper";
import { useDispatch, useSelector } from "react-redux";
import foodCore from "../../core/food";
import SMFooter from "components/SMFooter";
import AntDesignIcon from "react-native-vector-icons/AntDesign";
import HTML from "react-native-render-html";
import { useFirestore } from 'react-redux-firebase';
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import find from 'lodash/find'
import reduce from 'lodash/reduce'
import cloneDeep from 'lodash/cloneDeep'
import map from 'lodash/map'
import each from 'lodash/each'
import filter from 'lodash/filter'
import concat from 'lodash/concat'
import includes from 'lodash/includes'
import { generateId, startOrderListener } from 'utils/orderListener';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view'

const winHeight = Dimensions.get('window').height;
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' && winHeight > 736 ? 60 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function FoodMenuScreen(props) {
  const getVariation = (editedLineItem: any) => {
    return find(props.variations, { id: editedLineItem.catalog_object_id })
  }

  const getItem = (editedLineItem: any) => {
    const variation = getVariation(editedLineItem)
    const id = get(variation, 'itemId')
    return find(props.items, { id })
  }

  const dispatch = useDispatch();
  const firestore = useFirestore()
  const editedLineItem = props.navigation.getParam('editedItem');
  const isEdit = !!editedLineItem;
  const selectedItem = isEdit ? getItem(editedLineItem) : props.navigation.getParam('item');
  const upSelling = props.navigation.getParam('upsell');
  const allVariations = useSelector(state => foodCore.selectors.getVariations(state));
  const allModifiers = useSelector(state => foodCore.selectors.getModifiers(state));
  const [modifiers, setModifiers] = useState([]);
  const [variations, setVariations] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [modifierData, setModifierData] = useState({});
  const [variationData, setVariationData] = useState(null);
  const [notes, setNotes] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [isInventoryLoading, setIsInventoryLoading] = useState(false)
  const [maxCount, setMaxCount] = useState(-1)
  const [currency, setCurrency] = useState('$')
  const fulfillmentType: any = useSelector(state => foodCore.selectors.getOrderFulfillmentType(state));
  const orderAt: any = useSelector(state => foodCore.selectors.getOrderAt(state));
  const location = get(props.appSettings, `locationsMetadata.${props.locationId}`);

  useEffect(() => {
    setCurrency(get(props.appSettings, `locations[0].currency`) === 'GBP' ? '£' : '$')

    const ams = dispatch(foodCore.actions.getModifierTypes(selectedItem, allModifiers));
    const locationAms = filter(ams, modifier => {
      if (modifier.present_at_all_locations === true) {
        return !includes(modifier.absent_at_location_ids, props.locationId)
      }
      if (modifier.present_at_all_locations === false) {
        return includes(modifier.present_at_location_ids, props.locationId)
      }
      return true
    })
    setModifiers(locationAms);

    const avs = dispatch(foodCore.actions.getVariationsTypes(selectedItem, allVariations));
    const locationAvs = filter(avs, variation => {
      if (variation.present_at_all_locations === true) {
        return !includes(variation.absent_at_location_ids, props.locationId)
      }
      if (variation.present_at_all_locations === false) {
        return includes(variation.present_at_location_ids, props.locationId)
      }
      return true
    })
    setVariations(locationAvs);

    if (isEdit) {
      const selectedModifiers = map(get(editedLineItem, 'modifiers', []), 'catalog_object_id')
      const md = reduce(get(selectedItem, 'modifierListInfo'), (calculated, modifierList) => {
        const modifierListData = get(allModifiers, `${modifierList.modifier_list_id}.modifier_list_data`, {})
        const modifierListModifiers = modifierListData.modifiers
        const isMultiple = modifierListData.selection_type === 'MULTIPLE'
        each(modifierListModifiers, modifier => {
          if (selectedModifiers.includes(modifier.id)) {
            if (isMultiple) {
              calculated[modifierList.modifier_list_id] = calculated[modifierList.modifier_list_id] || []
              calculated[modifierList.modifier_list_id].push(modifier.id)
            } else {
              calculated[modifierList.modifier_list_id] = modifier.id
            }
          }
        });
        return calculated
      }, {})
      setModifierData(md)
      setNotes(editedLineItem.note)
      setVariationData(getVariation(editedLineItem))
      setPrice(md)
    } else {
      const md = reduce(get(selectedItem, 'modifierListInfo'), (calculated, modifierList) => {
        const modifierListData = get(allModifiers, `${modifierList.modifier_list_id}.modifier_list_data`, {})
        const isMultiple = modifierListData.selection_type === 'MULTIPLE'
        if (modifierList.modifier_overrides) {
          each(modifierList.modifier_overrides, override => {
            const on = get(override, 'on_by_default')
            if (on) {
              if (isMultiple) {
                calculated[modifierList.modifier_list_id] = calculated[modifierList.modifier_list_id] || []
                calculated[modifierList.modifier_list_id].push(override.modifier_id)
              } else {
                calculated[modifierList.modifier_list_id] = override.modifier_id
              }
            }
          });
        } else {
          const modifierListModifiers = modifierListData.modifiers
          each(modifierListModifiers, modifier => {
            const on = get(modifier, 'modifier_data.on_by_default')
            if (on) {
              if (isMultiple) {
                calculated[modifierList.modifier_list_id] = calculated[modifierList.modifier_list_id] || []
                calculated[modifierList.modifier_list_id].push(modifier.id)
              } else {
                calculated[modifierList.modifier_list_id] = modifier.id
              }
            }
          });
        }
        return calculated
      }, {})
      setModifierData(md)
      setVariationData(avs[0])
    }
  }, [allVariations, allModifiers, props.locationId]);

  const trackInventory = (variationData, location_id) => {
    const isEnabled = get(props.appSettings, 'apps.apps-track-inventory.connected')
    if (!isEnabled) {
      return false
    }
    const ti = get(variationData, 'track_inventory')
    const override = get(variationData, `location_overrides[${location_id}]`)
    const ti_over = get(override, 'track_inventory')
    const result = ti && ti_over !== false || !ti && ti_over === true
    return result
  }

  const getVariationCount = () => {
    const inventoryData = find(props.inventory, { catalog_object_id: variationData.id, state: 'IN_STOCK' })
    return inventoryData ? parseInt(inventoryData.quantity || '0') : -1
  }

  const updateIsAvailable = () => {
    const shouldTrack = trackInventory(variationData, props.locationId)
    if (!shouldTrack) {
      setIsAvailable(true)
      return
    }
    const quantity = getVariationCount()
    if (quantity === -1) {
      const inventoryGeneralData = find(props.inventory, { catalog_object_id: variationData.id })
      if (inventoryGeneralData) { // if inventory data already feteched - skip
        setIsInventoryLoading(false)
        setIsAvailable(false)
        return
      }
      setIsInventoryLoading(true)
      props.addOrdaOperation(firestore, props.locationId, {
        type: 13,
        variations: map(variations, 'id'),
      })
      return
    }
    setIsAvailable(quantity > 0)
    setIsInventoryLoading(false)
    setMaxCount(quantity)
  }

  useEffect(() => {
    updateIsAvailable()
  }, [props.inventory])

  useEffect(() => {
    setMaxCount(-1)
    setPrice()
    updateIsAvailable()
  }, [variationData])

  const selectedModifiers = () => {
    const list = reduce(modifiers, (flat, modifier) => {
      const add = get(modifierData, modifier.id)
      if (add) {
        flat = concat(flat, add)
      }
      return flat
    }, [])    
    return list
  }

  const gotoCart = () => {
    if (props.accountMobile) {
      props.navigation.push('CartScreen', { fulfillmentType, orderAt });
    } else {
      props.navigation.push('ProfileScreen', {});
    }
  }

  const addCart = (item) => {
    const modifiers = selectedModifiers()
    if (isEdit) {
      saveItem(modifiers)
      props.navigation.pop();
      if (props.navigation.getParam('isCheckoutModal')) {
        props.navigation.navigate('FoodMenu', { location, isOpen: true });
      }
    }
    else if (upSelling) {
      addItem(modifiers)
      props.navigation.pop()
      gotoCart()
    }
    else {
      addItem(modifiers)
      props.navigation.pop();
    }
  };

  const handleModifierData = (cateId, isMultiple, data) => {
    if (!data) {
      return
    }
    const newModifierData = cloneDeep(modifierData)
    if (data.length > 0) {
      newModifierData[cateId] = data;
    } else {
      delete newModifierData[cateId]
    }
    setModifierData(newModifierData);
    setPrice(newModifierData)
  }

  const handleVariationData = async (data) => {
    const variation = find(allVariations, { id: data })
    if (variation) {
      setVariationData(variation);
    }
  }

  const setPrice = (calculatedModifierData = null) => {
    calculatedModifierData = calculatedModifierData || modifierData
    if (!variationData || !calculatedModifierData) {
      return 0
    }
    let price = get(variationData, `location_overrides.${props.locationId}.price_money.amount`) || variationData.price
    for (const modifierListId in calculatedModifierData) {
      const selectedModifiers: any = calculatedModifierData[modifierListId]
      const modifierListModifiers = get(allModifiers, `${modifierListId}.modifier_list_data.modifiers`)
      each(modifierListModifiers, modifier => {
        if (selectedModifiers.includes(modifier.id) || selectedModifiers === modifier.id) {
          price += get(modifier, `modifier_data.price_money.amount`, 0)
        }
      });
    }
    setTotalPrice(price)
  }

  const isRequiredMissing = () => {
    let result = false
    each(modifiers, modifierList => {
      if (modifierList.min < 1) {
        return
      }
      if (
        modifierList.isMultiple && get(modifierData, `${modifierList.id}.length`, 0) < modifierList.min ||
        !modifierList.isMultiple && !get(modifierData, `${modifierList.id}`)) {
        result = true
      }
    })
    return result
  }

  const addItem = (modifiers) => {
    if (!props.ordaId) {
      const ordaId = generateId()
      props.setOrdaId(ordaId)
      const unsubscribe = startOrderListener(firestore, ordaId, props.cartListener, () => {
        console.log("*** Error")
      })
    }
    props.addOrdaOperation(firestore, props.locationId, {
      variation: variationData.id,
      modifiers,
      note: notes,
      tax_ids: locationBasedTaxes(selectedItem.taxIds) || [],
      quantity
    })
    props.addUnstagedSubtotal(totalPrice * quantity)
    props.addOrdaCartItem(firestore, props.locationId, selectedItem.id)
  }

  const saveItem = (modifiers) => {
    props.addOrdaOperation(firestore, props.locationId, {
      variation: variationData.id,
      modifiers,
      note: notes,
      tax_ids: locationBasedTaxes(selectedItem.taxIds) || [],
      quantity,
      uid: editedLineItem.uid,
      type: 2
    })
  }

  const locationBasedTaxes = (taxIds) => {
    const result = []
    each(taxIds, taxId => {
      const tax = find(props.taxes, { id: taxId })
      if (!tax || tax.inclusion_type === 'INCLUSIVE') {
        return
      }
      if (tax.present_at_all_locations === true) {
        if (!includes(tax.absent_at_location_ids, props.locationId)) {
          result.push(taxId)
        }
        return
      } else if (tax.present_at_all_locations === false) {
        if (includes(tax.present_at_location_ids, props.locationId)) {
          result.push(taxId)
        }
        return
      }
      result.push(taxId)
    })
    return result
  }

  const getShare = () => {
    if (Platform.OS !== 'ios' || !get(props.shareValue, 'message')) {
      return
    }
    const message = props.shareValue.message.replaceAll('{name}', selectedItem.name).replaceAll('{description}', selectedItem.description)
    const url = props.shareValue.url || props.downloadLink
    return {
      title: selectedItem.name,
      message,
      url,
    }
  }

  const _renderScrollViewContent = () => {
    return (
      <View style={{ position: 'relative', top: (Platform.OS == 'ios' && winHeight > 736 ? (selectedItem.image ? -90 : -310) : (Platform.OS == 'ios' ? -310 : 0)), paddingTop: selectedItem.image ? (Platform.OS == 'ios' && winHeight > 736 ? 0 : HEADER_SCROLL_DISTANCE + 20) : (HEADER_MAX_HEIGHT / 2.5) }}>
        <KeyboardAwareScrollView>
          <View style={{ paddingTop: 0, }}>
            {!!selectedItem.description && <View style={{ paddingHorizontal: 20 }}>
              <HTML source={{ html: `<div>${selectedItem.description}</div>` }} tagsStyles={{ div: { maxHeight: 200, marginBottom: 12, fontWeight: '400', fontSize: 16, color: colors.gray, lineHeight: 22 } }} />
            </View>}
            {notEmpty(variations) && (variations.length > 1) &&
              <View style={{ paddingBottom: 10, paddingHorizontal: 20 }}>
                <RadioGroup currency={currency} items={variations} absolutePrice isMultiple={false} selectedIndex={variationData.id} onChange={(data) => handleVariationData(data)} />
              </View>
            }
            {notEmpty(modifiers) &&
              modifiers.map((item) => {
                return <ModifierItem
                  currency={currency}
                  data={item}
                  modifierData={get(modifierData, item.id)}
                  dataChange={(data) => handleModifierData(item.id, item.isMultiple, data)}
                />
              })
            }
            <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
              <Label style={styles.label}>Special Instructions</Label>
                <View>
                  <Textarea
                    rowSpan={3}
                    maxLength={200}
                    style={[
                      styles.inputTextArea,
                    ]}
                    value={notes}
                    placeholder=""
                    placeholderTextColor={colors.grey}
                    bordered={false} underline={false}
                    onChangeText={(value) => setNotes(value)}
                  />
                </View>
            </View>
          </View>
        </KeyboardAwareScrollView> 
      </View>
    );
  }

  const OSWiseHeaderTranslate = Platform.OS === 'ios' && winHeight > 736 ? -HEADER_SCROLL_DISTANCE + 45 : -HEADER_SCROLL_DISTANCE;
  const OSWiseTitleTranslate = Platform.OS === 'ios' && winHeight > 736 ? -220 : -266;
  const OSWiseTitleTranslateForNoImage = Platform.OS === 'ios' && winHeight > 736 ? -2 : -40;

  const [scrollYValue, setScrollYValue] = useState(new Animated.Value(Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0));

  const scrollY = Animated.add(
    scrollYValue,
    Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
  );

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, OSWiseHeaderTranslate],
    extrapolate: 'clamp',
  });
  const headerScale = scrollY.interpolate({
    inputRange: [-330, 0, HEADER_SCROLL_DISTANCE],
    outputRange: [2.8, 1, 1],
    extrapolate: 'clamp',
  });
  const imageTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });
  const imageScale = scrollY.interpolate({
    inputRange: [-330, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1.4, 1.01, 1],
    extrapolate: 'clamp',
  });
  const titleOpacityFadeOut = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });
  const titleOpacityFadein = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });


  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0.8],
    extrapolate: 'clamp',
  });
  const titleTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, OSWiseTitleTranslate],
    extrapolate: 'clamp',
  });

  const titleScaleNoImage = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT / 4],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  const titleTranslateNoImage = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT / 4],
    outputRange: [0, OSWiseTitleTranslateForNoImage],
    extrapolate: 'clamp',
  });
  const headerTranslateNoImage = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3],
    outputRange: [0, -HEADER_SCROLL_DISTANCE / 3],
    extrapolate: 'clamp',
  });

  return (
    <Container style={{ backgroundColor: colors.backgroundLight }}>
      <View style={styles.fill}>
        <SMHeader
          navigation={props.navigation}
          isMenu={false}
          isBack
          isRefresh={false}
          transparent
          share={getShare()}
        />
        <Animated.ScrollView
          style={styles.fill}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollYValue } } }],
            { useNativeDriver: true },
          )}

          contentInset={{
            top: HEADER_MAX_HEIGHT,
          }}
          contentOffset={{
            x: 0,
            y: -HEADER_MAX_HEIGHT,
          }}
        >
          {_renderScrollViewContent()}
        </Animated.ScrollView>
        {
          selectedItem.image ?
            (<>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.header,
                  { transform: [{ translateY: headerTranslate }, { scale: headerScale }] },
                ]}
              >

                <Animated.View
                  style={[
                    styles.backgroundImage,
                    {
                      opacity: imageOpacity,
                      transform: [{ translateY: imageTranslate }, { scale: imageScale}],
                    },
                  ]}
                >

                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0, 0.2)', 'rgba(0,0,0, 0.45)']}
                    style={[styles.backgroundImage, { zIndex: 11000, paddingHorizontal: 20, borderWidth: 0, backgroundColor: 'transparent' }]}>
                  </LinearGradient>


                  <Image source={{ uri: thumbnail(selectedItem.image, '512x512') }} style={{
                    height: HEADER_MAX_HEIGHT,
                    resizeMode: 'cover',
                  }} />

                </Animated.View>
              </Animated.View>
              <Animated.View
                style={[
                  styles.bar,
                  {
                    transform: [
                      { scale: titleScale },
                      { translateY: titleTranslate },
                    ],
                  },
                ]}
              >
                <Animated.Text style={[
                  { position: 'absolute', marginVertical: 0, color: colors.ButtonTextColor, opacity: titleOpacityFadeOut, textTransform: 'capitalize', fontSize: 20, fontWeight: 'bold', zIndex: 5000 }
                ]}>
                  {selectedItem.name}
                </Animated.Text>

                <Animated.Text style={[
                  { top: Platform.OS === 'ios' ? 5 : 0, position: 'absolute', marginVertical: 0, color: colors.darkBlack, opacity: titleOpacityFadein, textTransform: 'capitalize', fontSize: 22, fontWeight: 'bold', zIndex: 5000 }
                ]}>
                  {selectedItem.name}
                </Animated.Text>
              </Animated.View>
            </>) :
            (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.headerNoImage,
                  { transform: [{ translateY: headerTranslateNoImage }] },
                ]}
              >
                <Animated.View
                  style={[
                    styles.barNoImage,
                    {
                      transform: [
                        { scale: titleScaleNoImage },
                        { translateY: titleTranslateNoImage },
                      ],
                    },
                  ]}
                >
                  <Animated.Text style={[
                    { position: 'absolute', marginVertical: 0, color: colors.darkBlack, opacity: titleOpacityFadeOut, textTransform: 'capitalize', fontSize: 20, fontWeight: 'bold', zIndex: 5000 }
                  ]}>
                    {selectedItem.name}
                  </Animated.Text>

                  <Animated.Text style={[
                    { position: 'absolute', marginVertical: 0, color: colors.darkBlack, opacity: titleOpacityFadein, textTransform: 'capitalize', fontSize: 22, fontWeight: 'bold', zIndex: 5000 }
                  ]}>
                    {selectedItem.name}
                  </Animated.Text>
                </Animated.View>
              </Animated.View>
            )
        }
      </View>


      <SMFooter style={{}}>
        <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
          {(isAvailable && !isInventoryLoading) ? <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: 120 }}>
            <Button
              bordered
              iconLeft
              rounded
              small
              transparent
              style={{ width: 30, padding: 5, borderColor: colors.lightGray, alignSelf: 'center' }}
              onPress={() => setQuantity(quantity > 1 ? quantity - 1 : quantity)}
            >
              <AntDesignIcon name='minus' size={18} />
            </Button>
            <View style={{ paddingTop: 3, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 16 }}>{quantity}</Text>
            </View>
            <Button
              disabled={maxCount > -1 && quantity >= maxCount}
              bordered
              iconLeft
              rounded
              small
              transparent
              style={{ width: 30, padding: 5, borderColor: colors.lightGray, alignSelf: 'center' }}
              onPress={() => setQuantity(quantity + 1)}
            >
              <AntDesignIcon name='plus' size={18} />
            </Button>
          </View> :
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: 120 }}>
              {isInventoryLoading ?
                <ActivityIndicator color="#333" /> :
                <Text style={{ color: '#FF3300', fontWeight: 'bold', fontSize: 18 }}>{isInventoryLoading ? 'loading...' : 'OUT OF STOCK'}</Text>
              }
            </View>
          }
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1, paddingHorizontal: 10, marginTop: -2 }}>
            <Button full rounded style={{ backgroundColor: (isRequiredMissing() || !isAvailable || isInventoryLoading) ? colors.grey : colors.black, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={() => addCart(selectedItem)} disabled={isRequiredMissing() || !isAvailable || isInventoryLoading}>
              <Text style={{ color: colors.ButtonTextColor, fontWeight: 'bold', fontSize: 18 }}>{isEdit ? 'Edit Item' : 'Add to Cart'}</Text>
              <Text style={{ color: colors.ButtonTextColor, marginStart: 10, fontSize: 12 }}>{currency}{trimPrice(totalPrice * quantity)}</Text>
            </Button>
          </View>
        </View>
      </SMFooter>
    </Container >
  );
}

const ModifierItem = ({ data, modifierData, dataChange, currency }) => {
  return <View style={{ marginBottom: 10, padding: 0, flexDirection: 'row' }}>
    <View style={{ flex: 1, marginHorizontal: 0, justifyContent: 'space-between' }}>
      <View style={{}}>
        <View style={{ backgroundColor: '#efefef', paddingHorizontal: 20, paddingVertical: 2 }}>
          <Text style={{ color: colors.darkGray, fontSize: 18, textTransform: 'capitalize', paddingVertical: 10, fontWeight: '600' }}>{data.name}{data.min > 0 ? ' *' : ''}</Text>
          {data.min > 0 && <Text style={{ color: colors.darkGray, fontSize: 14, textTransform: 'capitalize', paddingBottom: 10, fontWeight: '600' }}>{`Choose ${data.min}`}</Text>}
        </View>
        <View style={{ paddingHorizontal: 0 }}>
          <RadioGroup currency={currency} items={data.modifiers} max={data.max || -1} isMultiple={data.isMultiple} selectedIndex={notEmpty(modifierData) ? modifierData : null} onChange={dataChange} />
        </View>
      </View>
    </View>
  </View>
}

const styles = StyleSheet.create({
  label: {
    color: colors.darkGray,
    fontSize: 16, fontWeight: '600', marginVertical: 8
  },
  inputTextArea: {
    color: colors.textInputColor,
    borderRadius: 4,
    borderWidth: 0.3,
    borderColor: colors.textInputColor,
    padding: 5,
  },
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    height: HEADER_MAX_HEIGHT,
  },
  headerNoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    height: HEADER_MAX_HEIGHT / 2,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: HEADER_MAX_HEIGHT,
    resizeMode: 'cover',
  },
  bar: {
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'ios' && winHeight > 736 ? 28 : 38,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'absolute',
    top: 210,
    left: 25,
    right: 0,
  },
  barNoImage: {
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'ios' && winHeight > 736 ? 0 : 0,
    height: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'absolute',
    top: 160,
    left: 25,
    right: 0,
  },
  title: {
    color: 'red',
    fontSize: 20,

  },
  scrollViewContent: {
    // iOS uses content inset, which acts like padding.
    paddingTop: Platform.OS == 'ios' && winHeight > 736 ? 0 : HEADER_SCROLL_DISTANCE + 20,
  },
  row: {
    height: 40,
    margin: 16,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
