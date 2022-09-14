import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, Linking, ImageBackground, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CardItem } from 'native-base';
import SMHeader from "../../components/SMHeader";
import moment from 'moment';
import ReadMore from 'react-native-read-more-text';
import { styles } from './InstagramStyle';
import Icon from "../../components/Icon";
import get from 'lodash/get'
import take from 'lodash/take'
import { useSelector } from "react-redux";
import foodCore from "../../core/food";

const { width } = Dimensions.get('window');
const url = 'https://www.instagram.com/'

const InstagramPost = ({ data, index, currentVisibleIndex, openInstagram }) => {

  const _renderTruncatedFooter = (handlePress) => {
    return (
      <Text style={styles.button} onPress={handlePress}>
        Read more
      </Text>
    );
  }

  const _renderRevealedFooter = (handlePress) => {
    return (
      <Text style={styles.button} onPress={handlePress}>
        Show less
      </Text>
    );
  }

  return <CardItem style={styles.card}>
    <TouchableOpacity onPress={openInstagram}>
      <ImageBackground source={{ uri: data.media_type == 'IMAGE' ? data.media_url : data.thumbnail_url }} style={styles.img} >
        <TouchableOpacity onPress={openInstagram} style={styles.insta}>
          <Icon name={"instagram"} module={'MaterialCommunityIcons'} size={30} />
        </TouchableOpacity>
      </ImageBackground>
    </TouchableOpacity>

    <View style={{ width: '100%' }}>
      <TouchableOpacity onPress={openInstagram} style={{ paddingVertical: 4 }}>
        <Icon name={"heart-outline"} module={'MaterialCommunityIcons'} size={30} color={'black'} />
      </TouchableOpacity>
      <ReadMore
        numberOfLines={3}
        renderTruncatedFooter={_renderTruncatedFooter}
        renderRevealedFooter={_renderRevealedFooter}>
        <Text
          style={styles.caption}>{data.caption}
        </Text>
      </ReadMore >

      <Text
        style={styles.timestamp}>{moment(data.timestamp).format("MMM D YYYY")}</Text>

    </View>

  </CardItem >
};

const InstagramScreen = props => {

  const [isLoading, setIsLoading] = useState(true);
  const [currentVisibleIndex, setcurrentVisibleIndex] = useState(0)
  const [posts, setPost] = useState([])
  const masterMerchantId = useSelector(state => foodCore.selectors.masterMerchant(state));

  const getPosts = async () => {
    const url = 'https://us-central1-fav-ordering.cloudfunctions.net/instagramPosts'
    const response = await fetch(url, {
      method: 'post',
      body: JSON.stringify({ merchantId: masterMerchantId }),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    return take(get(data, 'data'), 12)
  }

  const loadPosts = async () => {
    const posts = await getPosts()
    setPost(posts)
    setIsLoading(false)
  }

  useEffect(() => {
    loadPosts()
  }, [masterMerchantId]);

  const getscrollposition = ({ nativeEvent }: any) => {
    const index = Math.round(nativeEvent.contentOffset.y / (width + 80));
    setcurrentVisibleIndex(index)
  };

  const openInstagram = (username) => {
    if (Linking.canOpenURL(url)) {
      Linking.openURL(`${url}${username}`)
    }
  }
  const openPostinInstagram = (url) => {
    if (Linking.canOpenURL(url)) {
      Linking.openURL(url)
    }
  }
  return (
    <View style={styles.container}>
      <SMHeader title="Follow Us" navigation={props.navigation} isMenu={false} isRefresh={false} isBack={true} />
      {isLoading &&
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>}
      {posts && posts.length > 0 &&
        <ScrollView
          scrollEventThrottle={16}
          style={styles.container}
          onScroll={event => getscrollposition(event)}>
          <Text style={styles.following} onPress={() => openInstagram(posts && posts[0].username)}>
            <Icon name={"instagram"} module={'MaterialCommunityIcons'} size={30} color={'black'} /> Follow us @{posts && posts[0].username}
          </Text >
          {posts.map((item, index) => {
            return <InstagramPost data={item} currentVisibleIndex={currentVisibleIndex} index={index} openInstagram={() => openPostinInstagram(item.permalink)} />
          })}
        </ScrollView>
      }
    </View>
  );
}

export default InstagramScreen;


