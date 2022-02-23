import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';



export default function More(){
    const Navigation = useNavigation();
     return(
        <View>
            <Text>
                More Page
            </Text>
        </View>

     );
}
