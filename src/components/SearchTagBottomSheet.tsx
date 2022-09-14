import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback } from 'react'
import Icon from 'react-native-vector-icons/AntDesign';
import { colors } from 'styles'
import Modal from 'react-native-modal';
import { hp, wp } from 'utils/responsiveUtil';
import { StoreItemTags } from './FoodItemTag';
import FoodItemTag from 'modules/foodMenu/FoodItemTag';

type SearchTagBottomSheetProps = {
    isVisible: boolean,
    onClose: () => void,
    storeTags: StoreItemTags[],
    handleTagItemClick: (name: string) => void,
}

const BottomSheetHeader = ({ onClose }) => {
    return (
        <View style={styles.content}>
            <Text style={styles.title}>{"Filter By"}</Text>
            <TouchableOpacity onPress={onClose}>
                <Icon name='close' size={wp(20)} color={"gray"} />
            </TouchableOpacity>
        </View>

    )
}

const BottomSheetHeaderMemo = React.memo(BottomSheetHeader);

const TagListing = ({ tags, handleTagItemClick }) => {
    const renderItem = useCallback(({ item }) => {
        return (
            <TouchableOpacity onPress={() => handleTagItemClick(item?.name)} >
                <FoodItemTag name={item?.name} color={item?.color} style={styles.itemTag} />
            </TouchableOpacity>
        )
    }, [handleTagItemClick])
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={tags}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.tagsFlatListContentContainer}
            />
        </View>
    )
}

const TagListingMemo = React.memo(TagListing);

const SearchTagBottomSheet = ({ isVisible, onClose, storeTags, handleTagItemClick }: SearchTagBottomSheetProps) => {

    const onSelectItemTag = useCallback((name: string) => {
        onClose();
        handleTagItemClick(name);
    }, [onClose, handleTagItemClick])
    return (
        <>
            <Modal
                isVisible={isVisible}
                style={styles.bottomModal}
            >
                <View style={styles.container}>
                    <TouchableOpacity style={styles.upperContainer} onPress={onClose}></TouchableOpacity>
                    <View style={styles.subContainer}>
                        <BottomSheetHeaderMemo onClose={onClose} />
                        <TagListingMemo tags={storeTags} handleTagItemClick={onSelectItemTag} />
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default SearchTagBottomSheet

const styles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    upperContainer: {
        height: "60%"
    },
    container: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
    },
    subContainer: {
        flex: 1,
        backgroundColor: "#fff",
        padding: wp(20),

    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(10)
    },
    title: {
        color: colors.black,
        fontSize: wp(24),
        textAlign: "center",
        fontWeight: "bold",
    },
    tagsFlatListContentContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    itemTag: {
        marginRight: wp(10),
        paddingHorizontal: wp(20),
        paddingVertical: wp(10),
        marginBottom: wp(10),
        borderRadius: wp(20),
        borderColor: colors.gray,
        borderWidth: 0.1,
        overflow: 'hidden'
    }
})