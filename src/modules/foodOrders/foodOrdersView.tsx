import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, FlatList, Image } from 'react-native';
import { Container, Card, CardItem, Text, Button, Icon } from 'native-base';
import SMHeader from "../../components/SMHeader";
import SMContent from "../../components/SMContent";
import { colors } from '../../styles';
import moment from "moment";
import find from "lodash/find";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import includes from "lodash/includes";
import map from "lodash/map";
import { useFirestore } from 'react-redux-firebase';
import { generateId, startOrderListener } from 'utils/orderListener';

const OrderItem = ({ data, onReorder, logoUrl }) => {
  return <Card style={{ marginBottom: 10 }}>
    <CardItem>
      <TouchableOpacity style={{ backgroundColor: colors.white, flexDirection: 'row' }} onPress={onReorder}>
        <Image source={{ uri: logoUrl }} style={{ width: 65, height: 65 }} />
        <View style={{ flex: 1, marginHorizontal: 10, justifyContent: 'space-between' }}>
          <View style={{ paddingBottom: 10 }}>
            <Text style={{ textTransform: 'capitalize' }} >{map(get(data, 'addItemData'), it => it.text).join(', ')}</Text>
          </View>
          <View style={{}}>
            <Text style={{ fontSize: 12, color: colors.darkGray }}>{moment(data.createdAt).format("MMM D YYYY, h:mm:ss a")}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ alignSelf: 'flex-end', color: colors.green, fontWeight: 'bold' }}></Text>

            <Button rounded small style={{ backgroundColor: colors.black, marginTop: 3 }} onPress={onReorder}>
              <Text style={{ color: colors.ButtonTextColor }}>Reorder</Text>
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    </CardItem>
  </Card>
};


export default function FoodOrdersScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [reorders, setReorders] = useState([])
  const firestore: any = useFirestore()

  useEffect(() => {
    firestore.collection('beans').where('connectAccountData.mobile', '==', props.accountMobile).limit(10).get().then((querySnapshot) => {
      const rs = []
      querySnapshot.forEach(doc => {
        rs.push({ id: doc.id, ...doc.data() })
      })
      setReorders(orderBy(rs, ['createdAt'], ['desc']))
      setIsLoading(false)
    })
  }, [firestore, props.accountMobile])

  const getLoyalty = (locationId) => {
    const loyalty = get(props.appSettings, 'loyalty[0]', null)
    const isActive = get(loyalty, 'status') === 'ACTIVE' && includes(get(loyalty, 'location_ids'), locationId)
    return isActive ? loyalty : null
  }

  const reOrder = async (item) => {
    props.resetOrder()
    props.setCurrentMerchant(item.merchantId)
    const found = find(props.locations, { id: item.locationId })
    const location = get(found, 'locationData')
    props.setLocationId(item.locationId)
    props.setOrderAheadTimes(get(location, 'business_hours.periods'))
    props.setCurrency(location.currency, location.country)
    const ordaId = generateId()
    props.setOrdaId(ordaId)
    props.addOrdaOperation(firestore, location.id, { createdAt: new Date().toISOString(), type: -1 })
    const locationLoyalty = getLoyalty(item.locationId)
    props.setLoyalty(locationLoyalty)
    const unsubscribe = startOrderListener(firestore, ordaId, props.cartListener, () => {
      console.log("*** Error")
    })
    props.addOrdaOperation(firestore, location.id, { bean: item.id, type: 9 })
    props.navigation.navigate('CartScreen', {});
  };

  return (
    <Container>
      <SMHeader title={"Reorder"} navigation={props.navigation} isRefresh={false} />
      <SMContent>
        {reorders && reorders.length ? reorders.map((item:any) => {
          return (<OrderItem
            logoUrl={get(props.appSettings, 'general.logoUrl')}
            data={item}
            onReorder={() => reOrder(item)}
          />);
        }) : <>{!isLoading && <Container style={{ flex: 1, paddingTop: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
          <Icon style={{ color: colors.grey, fontSize: 80 }} name={'folder-open-outline'}></Icon>
        </View>
        <View style={{ paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
          <Text>{"We keep your past orders here, so you can easily reorder. Let's make your first order"}</Text>
        </View>
        <View style={{ paddingHorizontal: 10, paddingTop: 40 }}>
          <Button onPress={() => props.navigation.navigate('Home')} style={{ backgroundColor: colors.black }} full rounded><Text>{"Let's Order"}</Text></Button>
        </View>
      </Container>}</>}
      </SMContent>
     
    </Container>
  );
}
