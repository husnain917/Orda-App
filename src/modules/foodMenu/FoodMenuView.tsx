import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  PixelRatio,
  TouchableHighlight,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Container, Card, CardItem, Text, Button } from 'native-base';
import SectionList from 'react-native-tabs-section-list';
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import SMHeader from "../../components/SMHeader";
import { trimPrice, thumbnail, formatSearchTextIgnoreQuotes, splitTextIgnoreQuotes, formatToTitleCase } from "../../utils/helper";
import { colors } from '../../styles';
import { styles } from './FoodMenuStyle';
import { useSelector } from "react-redux";
import foodCore from "../../core/food";
import HTML from "react-native-render-html";
import SMFooter from "components/SMFooter";
import get from 'lodash/get'
import includes from 'lodash/includes'
import map from 'lodash/map'
import ViewCart from 'modules/viewCart/ViewCart';
import StorePauseModal from './StorePauseModal';
import Icon from 'components/Icon';
import { deviceWidth, wp } from 'utils/responsiveUtil';
import Animated, { Easing } from 'react-native-reanimated'
import SearchTagBottomSheet from 'components/SearchTagBottomSheet';
import { StoreItemTags } from 'components/FoodItemTag';
import { getItemTag, getUserStoreTags } from '../../core/food/helper';
import FoodItemTag from 'modules/foodMenu/FoodItemTag';
import take from 'lodash/take'

const { Value, timing } = Animated;
// Animation values
let input_box_translate_x = new Value(deviceWidth)
let back_button_opacity = new Value(0);
let search_icon_opacity = new Value(1);

const FoodItem = ({ data, onSetData, currency, storeTagKeys }) => {
  const getTag = (tagName: string) => {
    return storeTagKeys[tagName?.trim().toLowerCase()]
  }
  return <Card transparent style={{ marginTop: 0, marginBottom: 0, paddingVertical: 10, borderBottomWidth: 0.4, borderColor: colors.lightGray }}>
    <CardItem bordered={false}>
      <TouchableOpacity style={{ backgroundColor: colors.white, flexDirection: 'row' }} onPress={() => onSetData()}>
        <View style={{ flex: 1, marginHorizontal: 3, justifyContent: 'space-between', minHeight: 80 }}>
          <View style={{}}>
            <Text numberOfLines={1} style={{ fontWeight: '500', fontSize: 17 }}>{data.name}</Text>
          </View>
          <View>
            <HTML source={{ html: `<div>${data.description || ''}</div>` }} tagsStyles={{ div: { fontWeight: '400', fontSize: 14, lineHeight: 18, maxHeight: 36, color: colors.lightGray, overflow: 'hidden' } }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ alignSelf: 'flex-end', fontSize: 13, color: colors.darkGray }}>
              {currency}{trimPrice(data.priceMin)}
              {data.priceMin !== data.priceMax ? ` - ${currency}${trimPrice(data.priceMax)}` : ``}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              {
                data?.tags?.map((tag, index) => {
                  let itemTag = getTag(tag) || null;
                  if (itemTag) {
                    return (
                      <React.Fragment key={index.toString()}>
                        <FoodItemTag name={itemTag.name} color={itemTag.color} style={styles.foodItemTag} textStyles={styles.foodItemText} />
                      </React.Fragment>
                    )
                  }
                  else {
                    return (
                      <React.Fragment key={index.toString()}>
                        <FoodItemTag name={formatToTitleCase(tag)} style={styles.foodItemTag} textStyles={styles.foodItemText} />
                      </React.Fragment>
                    )
                  }
                })
              }
            </View>
          </View>
        </View>
        {!!data.image && <Image source={{ uri: thumbnail(data.image, '512x512') }} style={{ width: 95, height: 95 }} />}
      </TouchableOpacity>
    </CardItem>
  </Card>
};

const foodItemEqual = (prev, next) => {
  return get(prev, 'data.id') === get(next, 'data.id')
}

const FoodItemMemo = React.memo(FoodItem, foodItemEqual);

const SearchBarIcon = ({ onPress }) => {
  return (
    <Animated.View style={{ opacity: search_icon_opacity }}>
      <TouchableHighlight activeOpacity={1} underlayColor={"#ccd0d5"} onPress={onPress} style={styles.searchIconBox}>
        <Icon module='Feather' name='search' color='#090909' size={wp(20)} />
      </TouchableHighlight>
    </Animated.View>
  )
}

const SearchBarIconMemo = React.memo(SearchBarIcon);

const SearchBar = ({ inputRef, onBlur, value, handleTextChange, onPressFilter, placeholder = "Search", enableFilter = false }) => {
  return (
    <SafeAreaView style={styles.searchBarContainer}>
      <SafeAreaView>
        <Animated.View style={[styles.inputBox, { transform: [{ translateX: input_box_translate_x, }], opacity: back_button_opacity }]}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              placeholder={placeholder}
              value={value}
              onChangeText={handleTextChange}
              style={styles.input}
            />
            {
              enableFilter ?
                <TouchableHighlight activeOpacity={1} underlayColor={"#ccd0d5"} onPress={onPressFilter} style={styles.searchFilterIcon}>
                  <Icon name='filter' color='090909' size={wp(20)} />
                </TouchableHighlight>
                : <></>
            }

          </View>
          <TouchableHighlight activeOpacity={1} underlayColor={"#ccd0d5"} onPress={onBlur} style={styles.searchIconBox} >
            <Icon name='close' color='a9a9a9' size={wp(23)} />
          </TouchableHighlight>
        </Animated.View>
      </SafeAreaView>
    </SafeAreaView>
  )
}

const SearchBarMemo = React.memo(SearchBar);


export default function FoodMenuScreen(props) {
  const isOpen = props.navigation.getParam('isOpen');
  const [isMenu, setIsMenu] = useState(false);
  const [locationName, setLocationName] = useState('')
  const [currency, setCurrency] = useState('$')
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [isChanged, setIsChanged] = useState(false);
  const [isVisible, setModalVisibility] = useState(isOpen);
  const [isStoreModalVisible, setStoreModalVisible] = useState(false);
  const [isSearchBottomSheetVisible, setIsSearchBottomSheetVisible] = useState(false);
  const [storeTags, setStoreTags] = useState<StoreItemTags[]>([]);
  const [storeTagKeys, setStoreTagKeys] = useState({});
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearchTextAvailable, setIsSearchTextAvailable] = useState<Boolean>(false);
  const loading = useSelector(state => foodCore.selectors.loading(state));
  const foods: any = useSelector(state => foodCore.selectors.getFoods(state));
  const categories: any = useSelector(state => foodCore.selectors.getCategories(state));
  const unstagedSubtotal = useSelector(state => foodCore.selectors.getUnstagedSubtotal(state));
  const flatList = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setModalVisibility(isOpen);
  }, [props.navigation])

  useEffect(() => {
    if (props.storePause) {
      setStoreModalVisible(true)
    }
  }, [props.storePause])

  const hiddenItems = () => {
    const hideNotOnline = get(props.appSettings, 'apps.apps-items-availability.mustBeAvailableOnline')
    if (hideNotOnline) {
      const listToHide = get(props.appSettings, 'apps.apps-items-availability.listToHide')
      return map(listToHide, 'id')
    }
    return null
  }

  useEffect(() => {
    if (loading || !foods || !props.locationId) {
      return
    }

    setIsMenu(get(props.appSettings, 'theme.hideLocationsScreen', false))
    setLocationName(get(props.appSettings, `locationsMetadata.${props.locationId}.name`))
    setCurrency(get(props.appSettings, `locations[0].currency`) === 'GBP' ? '£' : '$')

    const hideNotOnline = hiddenItems()

    if (!categories.length) {
      setSections([{ id: 1, name: 'All', data: foods }])
      return
    }
    let storeTags: StoreItemTags[] = getUserStoreTags(props.appSettings)
    setStoreTags(storeTags);

    let storeTagKeys = {};
    for (let i = 0; i < storeTags.length; i++) {
      storeTagKeys[storeTags[i].name?.trim().toLowerCase()] = storeTags[i];
    }
    setStoreTagKeys(storeTagKeys);

    const sections = categories.map(category => {
      const data = foods.filter(food => {
        if (hideNotOnline && includes(hideNotOnline, food.id)) { // hide if not online app
          return false
        }
        if (food.categoryId !== category.id) {
          return false
        }
        if (food.present_at_all_locations === true) {
          return !includes(food.absent_at_location_ids, props.locationId)
        }
        if (food.present_at_all_locations === false) {
          return includes(food.present_at_location_ids, props.locationId)
        }
        return true
      })
      return { ...category, data }
    })
    setSections(sections)
  }, [loading, props.locationId, props.appSettings])

  useEffect(() => {
    if (isChanged) {
      setIsChanged(false);
    }
  }, [isChanged]);

  const goToDetail = (item) => {
    props.navigation.navigate('FoodDetailScreen', { item, isEdit: false });
  }

  const onPressSearchIcon = () => {
    const input_box_translate_x_config = {
      duration: 200,
      toValue: 0,
      easing: Easing.inOut(Easing.ease),
    }
    const back_button_opacity_config = {
      duration: 200,
      toValue: 1,
      easing: Easing.inOut(Easing.ease),
    }
    const search_icon_opacity_config = {
      duration: 200,
      toValue: 0,
      easing: Easing.inOut(Easing.ease),
    }

    // Runing animation
    timing(input_box_translate_x, input_box_translate_x_config).start();
    timing(back_button_opacity, back_button_opacity_config).start();
    timing(search_icon_opacity, search_icon_opacity_config).start();

    // Force focus
    inputRef?.current?.focus();
  }

  const onBlurSearchInput = () => {
    const input_box_translate_x_config = {
      duration: 200,
      toValue: deviceWidth,
      easing: Easing.inOut(Easing.ease),
    }
    const back_button_opacity_config = {
      duration: 200,
      toValue: 0,
      easing: Easing.inOut(Easing.ease),
    }
    const search_icon_opacity_config = {
      duration: 200,
      toValue: 1,
      easing: Easing.inOut(Easing.ease),
    }

    // Runing animation
    timing(input_box_translate_x, input_box_translate_x_config).start();
    timing(back_button_opacity, back_button_opacity_config).start();
    timing(search_icon_opacity, search_icon_opacity_config).start();

    // Force Blur
    inputRef.current.blur();

    // Clear search value and show all menu items
    handleSearchQuery('');
    setSearchValue('')
  }

  const onPressSearchFilter = () => {
    toggleSearchBottomSheet()
  }

  const toggleSearchBottomSheet = useCallback(() => {
    setIsSearchBottomSheetVisible(prev => !prev);
  }, [setIsSearchBottomSheetVisible])

  const handleSearch = (searchQuery: string) => {
    let results = JSON.parse(JSON.stringify(sections));
    let query = formatSearchTextIgnoreQuotes(String(searchQuery?.toLowerCase()?.trim()));
    results = results.map(each => {
      if (each?.name?.toLowerCase().includes(query)) {
        return each
      }
      else {
        each.data = each.data.filter(item => {
          for (let i = 0; i < query.length; i++) {
            let eachQueryWord = query[i];
            if (item?.name?.toLowerCase().includes(eachQueryWord)) {
              return true
            }
            else if (item?.description?.toLowerCase().includes(eachQueryWord)) {
              return true
            }
            else if (item?.tags?.join(" ")?.toLowerCase().includes(eachQueryWord)) {
              return true
            }
          }

        })
        return each
      }
    });
    results = results.filter(each => {
      return each?.data.length;
    });

    setFilteredSections(results);
  }
  const toggleSearchAvailable = useCallback((flag: boolean): void => {
    setIsSearchTextAvailable(flag);
  }, [setIsSearchTextAvailable]);

  const handleSearchQuery = (searchQuery: string) => {
    if (handleSearch) {
      if (searchQuery.length >= 3) {
        toggleSearchAvailable(true);
        handleSearch(searchQuery);
      }
      else {
        toggleSearchAvailable(false);
      }
    }
  }
  const handleSearchChange = useCallback((text) => {
    setSearchValue(text);
    handleSearchQuery(text);
  }, [setSearchValue, handleSearchQuery]);

  const handleTagItemClick = useCallback((name: string) => {
    let currentSearchVal: any = searchValue;
    let addedQuotes = `"${name}"`;
    currentSearchVal = splitTextIgnoreQuotes(currentSearchVal.trim());
    let isAlreadyExists = currentSearchVal.find(each => {
      return each?.trim()?.toLowerCase() === addedQuotes?.trim()?.toLowerCase()
    });
    if (!!isAlreadyExists) {
      return
    }
    currentSearchVal = [...currentSearchVal, addedQuotes].join(" ").trim();
    handleSearchChange(currentSearchVal);
  }, [searchValue, handleSearchChange])

  const getSectionsToRender = useCallback(() => {
    return isSearchTextAvailable ? filteredSections : sections;
  }, [sections, filteredSections, isSearchTextAvailable]);

  const storeTagsPlaceholder = useMemo(() => take(storeTags, 2).map(each => each?.name)?.join(", "), [storeTags]);

  return (
    <Container>
      <SMHeader title={locationName} navBarImg={props.navBarLogo} navigation={props.navigation} hasTabs isMenu={isMenu} isBack={!isMenu} isRefresh={false}
        searchIcon={<SearchBarIconMemo onPress={onPressSearchIcon} />}
        searchBar={<SearchBarMemo placeholder={storeTagsPlaceholder?.length ? `Search ${storeTagsPlaceholder}...` : `Search`} enableFilter={storeTags.length > 0} value={searchValue} handleTextChange={handleSearchChange} inputRef={inputRef} onBlur={onBlurSearchInput} onPressFilter={onPressSearchFilter} />}
      />
      <StorePauseModal show={isStoreModalVisible} onClose={setStoreModalVisible} />
      <SectionList
        testID="items-list"
        ref={flatList}
        sections={getSectionsToRender()}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled={false}
        scrollToLocationOffset={50}
        initialNumToRender={10}
        getItemLayout={sectionListGetItemLayout({
          // see https://medium.com/@jsoendermann/sectionlist-and-getitemlayout-2293b0b916fb
          getItemHeight: (rowData, sectionIndex, rowIndex) => 140,
          getSeparatorHeight: () => 1 / PixelRatio.get(), // The height of your separators
          getSectionHeaderHeight: () => 40, // The height of your section headers
          getSectionFooterHeight: () => 8, // The height of your section footers
        })}
        ListEmptyComponent={() => {
          return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text>No Products Found 😔</Text>
            </View>
          )
        }}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 1000));
          wait.then(() => {
            flatList.current?.scrollToIndex({
              animated: true,
              itemIndex: -1,
              sectionIndex: info.index,
              viewPosition: 0
            });
          });
        }}
        tabBarStyle={styles.tabBar}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderSectionFooter={() => <View style={styles.sectionFooter} />}
        renderTab={({ name, isActive }) => (
          <View
            style={[
              styles.tabContainer
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? 'white' : '#9e9e9e',
                  backgroundColor: isActive ? 'black' : 'white',
                }
              ]}
            >
              {name}
            </Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View>
            <Text style={styles.sectionHeaderText}>{section.name}</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <FoodItemMemo storeTagKeys={storeTagKeys} currency={currency} data={item} onSetData={() => goToDetail(item)} />
        )}
      />
      {(!!props.orderLength || !!unstagedSubtotal) && <SMFooter style={{ paddingHorizontal: 10, marginBottom: 1, marginTop: 5 }}>
        <Button full rounded style={{ backgroundColor: colors.black, height: 50, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setModalVisibility(true)}
        >
          <Text style={{ color: colors.ButtonTextColor, fontWeight: 'bold', fontSize: 18 }}>{"View Cart"}</Text>
          {!!unstagedSubtotal && <Text style={{ color: colors.ButtonTextColor, fontSize: 14 }}>{`${currency}${trimPrice(unstagedSubtotal)}`}</Text>}
        </Button>
      </SMFooter>}
      <ViewCart isVisible={isVisible} onCloseModal={() => setModalVisibility(false)}
        fulfillmentType={props.fulfillmentType} orderAt={props.orderAt} navigation={props.navigation} />
      <SearchTagBottomSheet
        isVisible={isSearchBottomSheetVisible}
        onClose={() => setIsSearchBottomSheetVisible(false)}
        storeTags={storeTags}
        handleTagItemClick={handleTagItemClick}
      />
    </Container>
  );
}
