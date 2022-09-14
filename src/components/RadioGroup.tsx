import React, {useEffect, useState} from 'react';

import { Text, FlatList} from 'react-native';
import {colors} from '../styles';
import {Body, CheckBox, ListItem} from "native-base";
import {notEmpty, trimPrice} from "utils/helper";

export default function RNSRadioGroup(
  {
    items,
    isMultiple,
    selectedIndex,
    onChange,
    absolutePrice = false,
    max = -1
  }
) {
  const [selectedId, setSelectedId] = useState(selectedIndex);
  const [changed, setChanged] = useState(0);
  useEffect(() => {
    if (isMultiple && !notEmpty(selectedIndex)) {
      setSelectedId([]);
    }
  }, []);

  useEffect(() => {
    if (changed) {
      onChange(selectedId);
    }
  }, [changed]);

  const setIndex = (id) => {
    if (isMultiple) {
      let temp = notEmpty(selectedId) ? selectedId : [];
      const index = temp.findIndex(item => item === id);
      if (index > -1) {
        temp.splice(index, 1);
      } else if (max === -1 || temp.length < max) {
        temp.push(id);
      }
      setSelectedId(temp);
    } else {
      setSelectedId(id);
    }
    setChanged(changed+1);
  };

  const checkIndex = (id) => {
    const temp = notEmpty(selectedId) ? selectedId : [];
    return (isMultiple) ? temp.findIndex(item => item === id) > -1 : temp === id;
  };
  return (
    <FlatList
      data={items}
      renderItem={({item}) => <ListItem onPress={() => setIndex(item.id)} style={ (item.id === items[items.length - 1].id) ? styles.itemNoUnderline : styles.itemUnderline}>
        <CheckBox checked={checkIndex(item.id)} color={colors.textInputColor} onPress={() => setIndex(item.id)}/>
        <Body>
          <Text style={{color: colors.darkGray, marginStart: 12, fontSize: 15 }}>{`${item.name} ${item.price ? `(${ absolutePrice ? '' : '+' }$` + trimPrice(item.price) + ')' :  ''}`}</Text>
        </Body>
      </ListItem>}
      keyExtractor={item => item.id.toString()}
    />
  );
}

const styles = {
  container: {
    flex: 1,
    flexDirection: 'row',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
  },
  underline: {
    borderWidth: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  itemUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
  itemNoUnderline: {
    borderBottomWidth: 0
  },
  itemActive: {
    backgroundColor: colors.primary,
  },
  itemActiveUnderline: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  text: {
    color: colors.primary,
  },
  textUnderline: {
    color: '#a6a6a6',
  },
  textActive: {
    color: colors.white,
  },
  textActiveUnderline: {
    color: colors.primary,
  },
};
