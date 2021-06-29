import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux';
import {ProfileComponent,Activasi} from '../../component'

const Profile = ({navigation}) => {
    const USER = useSelector((state) => state.UserReducer);
    return (
        <View style={{flex:1}}>
            {USER.status === 'active' ? <ProfileComponent navigation = {navigation}/> : <Activasi  navigation = {navigation}/>}
        </View>
    )
}

export default Profile

const styles = StyleSheet.create({})
