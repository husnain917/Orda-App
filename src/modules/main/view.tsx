import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { View } from 'native-base';
import { Image, Text } from 'react-native';
import styles from './style';
import foodCore from "../../core/food";
import get from 'lodash/get'

const NotifyTemplate = () => {
  const appSettings = useSelector(state => foodCore.selectors.getAppSettings(state));
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    setLogoUrl(get(appSettings, 'general.logoUrl'))
  }, [appSettings])

  return <View style={{ flex: 1, padding: 0, margin: 0 }}>
    <View style={{ flex: .3 }}>
   </View>

    <View style={{ flex: .6 }}>
      <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 200, height: 200 }}
          />
        </View>

      </View>
    </View>
    <View style={{ flex: .1, padding: 0, margin: 0  }}>
      <Text style={{ fontSize: 16, bottom: 50, textAlign: 'center' }}>⚡ Powered by GetOrda.com</Text>
    </View>
  </View>
};

export const RenderView = () => {
  return <View style={styles.container}>
    <NotifyTemplate />
  </View>;
};
export default RenderView;
