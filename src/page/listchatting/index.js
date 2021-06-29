import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { Profile } from '../../assets'
import { Header } from '../../component'
import { FIREBASE } from '../../config'
import { colors } from '../../utils'

const Item =(props)=>{
    return (
        <TouchableOpacity style={{flex:1, flexDirection : 'row', alignItems : 'center', borderBottomWidth : 1, paddingBottom : 8, marginVertical : 10}}>
            <View >
                <Image source={Profile} style={styles.profile} />
            </View>
            <View style={{marginRight : 10}}/>
            <View>
                <Text>{props.name}</Text>
                <Text style={{color:'grey'}}>{props.text}</Text>
                {/* <Text>{props.date}</Text> */}
            </View>
        </TouchableOpacity>
    )
}

const ListChatting = ({navigation}) => {

    const USER = useSelector((state) => state.UserReducer);

    const [historyChat, setHistoryChat] = useState([])

    useEffect(() => {
        let isAmmouted = false
        const urlHistoryMessages = `messages/${USER.id}/`

        FIREBASE.database()
            .ref(urlHistoryMessages)
            .on('value', snapshot => {
                // console.log('data history chat ',snapshot.val());

                if(snapshot.val()) {
                    const oldData = snapshot.val();
                    const data = [];

                    Object.keys(oldData).map(key => {
                        data.push({
                            id : key,
                            ...oldData[key]
                        })
                    })

                    // console.log('data history chat : ',data);

                    setHistoryChat(data)
                }
            })

        return () => {
            isAmmouted = true
        }

    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                    <Header
                        title = 'Your Message'
                        navigation = {() => navigation.goBack()}
                    />
                    <View style={styles.body}>
                        <ScrollView>
                            {historyChat && historyChat.map(itemHistory => {
                                return (
                                    <Item
                                        key ={itemHistory.id}
                                        text = {itemHistory.lastContentChat}
                                        date = {itemHistory.lastChatDate}
                                        name = {itemHistory.uidPartner}
                                    />
                                )
                            })}
                        </ScrollView>
                    </View>
            </View>
        </View>
    )
}

export default ListChatting

const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor : '#ffffff'
    },
    wrapper : {
        flex : 1
    },
    body : {
        paddingHorizontal : 20,
        paddingTop:20,
    }, 
    hr : {
        borderBottomColor: colors.shadow,
        borderBottomWidth: 3,
        width:'100%',
        marginVertical : 10
    },
    profile : {
        width : 50,
        height : 50
    }
})
