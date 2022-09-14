import React from 'react'
import { Text, View, ViewProps, StyleSheet, TextStyle} from 'react-native';
import { pickTextColorBasedOnBgColorAdvanced } from 'utils/helper';
import { wp } from 'utils/responsiveUtil';

type FoodItemTagProps = {
    name: string;
    color?: string;
    style?: ViewProps['style'];
    textStyles?: TextStyle;
}

const DEFAULT_TAG_BACKGROUND = 'black'

const FoodItemTag = ({ name, color, style = {}, textStyles = {} }: FoodItemTagProps): JSX.Element => {
    return (
        <View style={[{ backgroundColor: color || DEFAULT_TAG_BACKGROUND }, style]} >
            <Text style={[{ color: pickTextColorBasedOnBgColorAdvanced(color || DEFAULT_TAG_BACKGROUND) }, styles.tagText, textStyles]}>{name}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    tagText: {
        fontSize: wp(15),
        fontWeight: 'bold'
    }
})

export default FoodItemTag