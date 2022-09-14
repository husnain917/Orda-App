import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, } from 'react-native';

import { Text, Input} from 'native-base';
import { colors } from 'styles';
import get from 'lodash/get'
import findIndex from 'lodash/findIndex'
import { trimPrice } from 'utils/helper';

export default function Tipping({ tipSettings, currencyCode, amount, onTipSelect, defaultValue }) {

  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [otherText, setOtherText] = useState('0')

  useEffect(() => {
    onTipSelect(selectedIndex < 0 ? 0 : value(selectedIndex))
  }, [selectedIndex, amount])

  useEffect(() => {
    const index = findIndex(get(tipSettings, `tipOptions`), { value: defaultValue })
    setSelectedIndex(index)
  }, [defaultValue])

  const value = (i) => {
    const opt = get(tipSettings, `tipOptions[${i}]`)
    if (!opt) {
      return 0
    }
    if (opt.type === 'fixed') {
      return opt.value * 100
    }
    return Math.round(amount * opt.value / 100)
  }

  const percent = (i) => {
    const opt = get(tipSettings, `tipOptions[${i}]`)
    return opt && "percent" === opt.type ? opt.value : null
  }

  const currencySymbol = () => {
    return currencyCode === 'GBP' ? '£' : '$'
  }

  const sanitize = () => {
    const val = Math.min(50, parseFloat(otherText || "0")).toFixed(2) || "0"
    setOtherText(val)
    onTipSelect(parseFloat(val) * 100)
  }

  const otherPressed = () => {
    setSelectedIndex(3)
  }

  return (
    <View style={{ flex: 1, marginTop: 30, marginBottom: 20, }}>
      <View style={{ flex: 1 }}>
        <Text style={{ flex: 1, fontSize: 16, textAlign: 'center', textTransform: 'uppercase', fontWeight: '500' }}>{tipSettings.title}</Text>
      </View>

      <View style={{ flex: 1, marginTop: 5, marginBottom: 20,  flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#cecece', height: 30, borderRadius: 20, margin: 10 }}>
        <TouchableOpacity onPress={() => setSelectedIndex(0)} style={{ width: 80, borderRadius: 20, backgroundColor: (selectedIndex === 0 ? colors.black : null) }}>
          <Text style={{ textAlign: 'center', padding: 5, color: (selectedIndex === 0 ? colors.white : colors.black) }}>{currencySymbol()}{trimPrice(value(0))}</Text>
          { percent(0) && <Text style={{ fontSize: 12, textAlign: 'center', padding: 1, color: colors.black }}>{percent(0)}%</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedIndex(1)} style={{ width: 80, borderRadius: 20, backgroundColor: (selectedIndex === 1 ? colors.black : null) }}>
          <Text style={{ textAlign: 'center', padding: 5, color: (selectedIndex === 1 ? colors.white : colors.black) }}>{currencySymbol()}{trimPrice(value(1))}</Text>
          { percent(1) && <Text style={{ fontSize: 12, textAlign: 'center', padding: 1, color: colors.black }}>{percent(1)}%</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedIndex(2)} style={{ width: 80, borderRadius: 20, backgroundColor: (selectedIndex === 2 ? colors.black : null) }}>
          <Text style={{ textAlign: 'center', padding: 5, color: (selectedIndex === 2 ? colors.white : colors.black) }}>{currencySymbol()}{trimPrice(value(2))}</Text>
          { percent(2) && <Text style={{ fontSize: 12, textAlign: 'center', padding: 1, color: colors.black }}>{percent(2)}%</Text>}          
        </TouchableOpacity>
        <TouchableOpacity onPress={otherPressed} style={{ width: 80, borderRadius: 20, backgroundColor: (selectedIndex === 3 ? colors.black : null) }}>
          <Text style={{ textAlign: 'center', padding: 5, color: (selectedIndex === 3 ? colors.white : colors.black) }}>Other</Text>
        </TouchableOpacity>
      </View>

      { (selectedIndex === 3) && <View style={{ marginTop: 5, borderStyle: 'solid', borderWidth: 2, borderColor: colors.black , flexDirection: 'row', justifyContent: 'flex-start', backgroundColor: '#eeeeee', height: 30, borderRadius: 20, margin: 10 }}>
        <Text style={{ marginLeft: 5, padding: 2 }}>{currencySymbol()}</Text>
        <Input value={otherText} onChangeText={ v => (setOtherText(v) )} onBlur={sanitize} style={{ height: 23, width: 50 }} keyboardType="numeric"/>
      </View>}

    </View>
  );
}
