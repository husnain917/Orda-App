import React, {useEffect, useState} from 'react';
import { View, TouchableOpacity, FlatList, Image } from 'react-native';
import {Container, Card, CardItem, Text} from 'native-base';
import AntDesignIcon from "react-native-vector-icons/AntDesign";
import SMHeader from "../../components/SMHeader";
import SMContent from "../../components/SMContent";
import {notEmpty, trimPrice, thumbnail} from "../../utils/helper";
import {colors} from '../../styles';
import {useDispatch, useSelector} from "react-redux";
import foodCore from "../../core/food";

const payload = require('../../config/payload.init');

const CategoryItem = ({data, onSetData, onDelete}) => {
  return <Card style={{marginBottom: 10}}>
    <CardItem>
      <TouchableOpacity style={{backgroundColor: colors.white, flexDirection: 'row'}} onPress={() => onSetData()}>
        <Image source={{uri: thumbnail(data.image, '115x115')}} style={{width: 85, height: 85}}/>
        <View style={{flex: 1, marginHorizontal: 10, justifyContent: 'space-between'}}>
          <View style={{}}>
            <Text>{data.name}</Text>
          </View>
          <View style={{}}>
            <Text style={{fontSize: 12, color: colors.darkGray}}>{data.description}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{alignSelf: 'flex-end', color: colors.green, fontWeight: 'bold'}}>${trimPrice(data.priceMin)} ~
              ${trimPrice(data.priceMax)}</Text>

            <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center', marginTop: 3}} onPress={onDelete}>
              <AntDesignIcon style={{marginTop: 3, paddingRight: 5}} name={'delete'} size={18} color={colors.primary}/>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </CardItem>
  </Card>
};

export default function FoodFavoritesScreen(props) {
  const dispatch = useDispatch();
  const [isChanged, setIsChanged] = useState(false);
  const favorites = useSelector(state => foodCore.selectors.getFavorites(state));
  useEffect(() => {

  }, []);

  useEffect(() => {
    if (isChanged) {
      setIsChanged(false);
    }
  }, [isChanged]);

  const checkIsFav = (key) => {
    return notEmpty(favorites) && notEmpty(favorites[key]);

  };
  const goToDetail = (item) => {
    props.navigation.navigate('FoodDetailScreen', {item, isEdit: false});
  };

  const deleteFavorite = (key) => {
    dispatch(foodCore.actions.deleteFavorite(key));
    setIsChanged(true);
    delete favorites[key];
  }
  return (
    <Container>
      <SMHeader title={"Favorites Foods"} navigation={props.navigation} isRefresh={false}/>
      <SMContent>
         {notEmpty(favorites) && Object.keys(favorites).map((item:any) => {
           return ( <CategoryItem
            data={favorites[item]}
            onSetData={() => goToDetail(favorites[item])}
            onDelete={() => deleteFavorite(item)}/>);
         })}
      </SMContent>
    </Container>
  );
}
