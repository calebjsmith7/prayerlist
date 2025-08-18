import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';



export default function BackButton(){
    const Navigation = useNavigation();
     return(
        <TouchableOpacity style={{backgroundColor: '#1e2427', width: 400, paddingRight: 300, paddingLeft: 8, paddingBottom: 5}} onPress={() => Navigation.navigate({
            name: 'Home'})}>
            <Icon name="arrow-back-outline" color={'white'} size={30} />
        </TouchableOpacity>

     );
}
