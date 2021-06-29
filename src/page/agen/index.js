import AsyncStorage from '@react-native-async-storage/async-storage'
import Geolocation from '@react-native-community/geolocation'
import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, Image, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box"
import { ScrollView } from 'react-native-gesture-handler'
import MapView, { Callout, Marker } from 'react-native-maps'
import { useDispatch, useSelector } from 'react-redux'
import { Profile } from '../../assets'
import { Button, Header, Spinner } from '../../component'
import { SET_DATA_USER } from '../../redux/action'
import API from '../../service'
import { Source } from '../../service/Config'
import { colors } from '../../utils'
import { getDistance } from 'geolib';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 1.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const LATITUDE = -8.3978769;
const LONGITUDE = 115.2141418;

const Item = (props) => {
    return (
       <TouchableOpacity style={[styles.boxItem, {backgroundColor : (props.select === props.id ? colors.active : '#ffffff')}]} onPress={props.click} >
           <Image source={Profile} style={styles.img} />
           <Text style={styles.text}>{props.name}</Text>
           <Text style={styles.text}>{props.email}</Text>
           <Text style={styles.text}>{props.phone}</Text>
           {/* <TouchableOpacity style={styles.button} onPress={props.checkout}><Text style={styles.buttonText}>Pilih Agen</Text></TouchableOpacity> */}
       </TouchableOpacity>
    )
}



const Agen = ({navigation, route}) => {
    const [agen, setAgen] = useState(null)
    const [loading, setLoading] = useState(true)
    var arrayAgen = [];
    var location= {
        latitude: null,
        longitude: null
    }
    const dispatch = useDispatch();
    const USER = useSelector((state) => state.UserReducer);
    const TOKEN = useSelector((state) => state.TokenReducer);
    const [agenDistance, setAgenDistance] = useState(null)
    const [form, setForm] = useState({
        id :USER.id,
        package_id : route.params.idPackage ? route.params.idPackage : null,
        agents_id : null
    })
    const [formDownline, setFormDownline] = useState({
        register : route.params.dataMember ? route.params.dataMember.register : null ,
        password : route.params.dataMember? route.params.dataMember.password : null ,
        name : route.params.dataMember ? route.params.dataMember.name : null ,
        phone : route.params.dataMember ? route.params.dataMember.phone : null ,
        email : route.params.dataMember ? route.params.dataMember.email : null ,
        address : route.params.dataMember ? route.params.dataMember.address : null ,
        ref_id : route.params.dataMember ? route.params.dataMember.ref_id : null ,
        package_id : route.params ? route.params.idPackage : null,
        agents_id : null
    })
    useEffect(() => {
        let isAmounted = false
            if(!isAmounted) { 
                // console.log('focues', isFocused);
                LocationServicesDialogBox.checkLocationServicesIsEnabled({
                    message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
                    ok: "YES",
                    cancel: "NO",
                }).then(function(success) {
                    Promise.all([API.agents(), requestLocationPermission()])
                    .then((result) => {
                        setAgen(result[0].data)
                        console.log('location', result);
                        // console.log('agen', result[0].data);
                        var dataAgen = result[0].data;
                        Geolocation.getCurrentPosition( 
                            (position) => {
                                location.latitude = position.coords.latitude;
                                location.longitude = position.coords.longitude;
                            // setLoading(false) 
                                dataAgen.map((item, index) => {
                                    var distance = getDistance(
                                        {latitude: position.coords.latitude, longitude:  position.coords.longitude},
                                        {latitude: parseFloat(item.lat), longitude: parseFloat(item.lng)},
                                        );
                                        arrayAgen[index] = {
                                            id : item.id,
                                            name : item.name,
                                            phone  : item.phone,
                                            email : item.email,
                                            img : item.img, 
                                            distance : distance
                                        }
                                    })
                                    // console.log(arrayAgen.sort(compare));
                                    setAgenDistance(arrayAgen.sort(compare))
                                    setLoading(false)
                        },
                        (error) => {
                            console.log(error);    
                        },
                        { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 },
                        );
                    }).catch((e) => {
                        console.log(e);
                        setLoading(false)
                    })
                }).catch((error) => {
                    console.log(error.message); // error.message => "disabled"
                    // navigation.navigate('Register')
                });
        }
        return () => {
                Source.cancel('home cancel axios')
                isAmounted = true;
                // console.log('cancel home');
        }
    }, [])


    function compare(a, b) {
        // Use toUpperCase() to ignore character casing
        const distance1 = a.distance
        const distance2 = b.distance
      
        let comparison = 0;
        if (distance1 > distance2) {
          comparison = 1;
        } else if (distance1 < distance2) {
          comparison = -1;
        }
        return comparison;
    }

    const requestLocationPermission =  async () => {
        try {
            const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              'title': 'Location Permission',
              'message': 'MyMapApp needs access to your location'
            }
            )
    
           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // console.log('lo log',_getCurrentLocation())
             return 'sukses'
           } else {
               return false
               console.log("Location permission denied")
           }
        } catch (err) {
            return false
           console.warn(err)
        }
      }

    //   get location
    

    // activasi
    const handleActivasi = () => {
        if (form.id !== null && form.agents_id !==null  && form.package_id !== null) {
            setLoading(true)
            API.activasi(form, TOKEN).then((result) => {
                console.log(result);
                dispatch(SET_DATA_USER(result.data))
                storeDataUser(result.data)
                navigation.navigate('Info', {notif : 'Activasi Berhasil', navigasi : 'Home'})
                setLoading(false)
            }).catch((e) => {
                console.log(e.request);
                alert('Activasi Gagal')
                setLoading(false)
            })
        }else{
            alert('mohon lengkapi data pilihan ')
        }

        console.log(form);
    }

    const handleRegisterDownline = () => {
        if(formDownline.agents_id !==null){
            setLoading(true)
            API.registerdownline(formDownline, TOKEN).then((result) => {
                    console.log(result);
                    navigation.navigate('Info', {notif : 'registrasi Downline Berhasil', navigasi : 'Home'})
            }).catch((e) => {
                console.log(e.response);
                alert('Registarsi gagal')
                setLoading(false)
            })
        }
    }

    const storeDataUser = async (value) => {
        try {
          const jsonValue = JSON.stringify(value)
          await AsyncStorage.setItem('@LocalUser', jsonValue)
        } catch (e) {
          console.log('no save')
        }
    }

    if(loading){
        return (
                <Spinner/>
        )
    }
    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                    <Header
                            title = 'Agen'
                            navigation = {() => navigation.goBack()}
                    />
                    <View style={{flex:1}}>
                        <View style={{flex:1, backgroundColor:"blue"}}>
                            <MapView
                                // provider={this.props.provider}
                                showsUserLocation
                                style={styles.map}
                                initialRegion={{
                                    latitude: LATITUDE,
                                    longitude: LONGITUDE,
                                    latitudeDelta: LATITUDE_DELTA,
                                    longitudeDelta: LONGITUDE_DELTA,
                                    }}
                                >

                                {agen && agen.map((item) => {
                                    return (
                                        <Marker
                                            key ={item.id}
                                            coordinate={{latitude :item.lat !==null ? parseFloat(item.lat) : 0.00000 , longitude : item.lng !== null ? parseFloat(item.lng) : 0.00000}}
                                            // onSelect={e => console.log('onSelect', e)}
                                            // onDrag={e => console.log('onDrag', e)}
                                            // onDragStart={e => console.log('onDragStart', e)}
                                            // onDragEnd={e => console.log('onDragEnd', e)}
                                            // onPress={e => console.log('onPress', e)}
                                            // draggable
                                        >
                                            <Callout style={styles.plainView}>
                                                <View>
                                                    <Text>{item.name}</Text>
                                                </View>
                                            </Callout>
                                        </Marker>
                                    )
                                })}

                            </MapView>
                        </View>
                        <View style={{flex:1}}>
                            <ScrollView>
                                <View style={styles.body}>
                                    {agenDistance && agenDistance.map((item, index) =>{
                                        return (
                                            <Item
                                                id = {item.id}
                                                key= {index}
                                                name = {item.name}
                                                email ={item.email}
                                                phone = {item.phone}
                                                click = {() => {
                                                    setForm({...form, agents_id : item.id});
                                                    setFormDownline({...formDownline, agents_id : item.id})
                                                }}
                                                select = {form.agents_id}
                                                // checkout ={() => navigation.navigate(page, {idAgen : item.id})}
                                            />
                                        )
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                {route.params.idPackage && !route.params.dataMember?     
                    <Button
                        title = 'Activasi'
                        width = '80%'
                        onPress= {() => form.agents_id !==null ? 
                            Alert.alert(
                                'Peringatan',
                                `Activasi sekarang ? `,
                                [
                                    {
                                        text : 'Tidak',
                                        onPress : () => console.log('tidak')
                                    },
                                    {
                                        text : 'Ya',
                                        onPress : () => handleActivasi  ()
                                    }
                                ]
                            )
                            :  alert('pilih agen terlebih dahulu')}
                    /> : null}
                {route.params.page ? 
                    <Button
                        title = 'Pilih Agen'
                        width = '80%'
                        onPress= {() => form.agents_id !==null ? navigation.navigate('Checkout', {idAgen : form.agents_id})  : alert('pilih agen terlebih dahulu')}
                    /> : null
                }
                {route.params.idPackage && route.params.dataMember ? 
                    <Button
                        title = 'registri downline'
                        width = '80%'
                        onPress= {() => formDownline.agents_id !==null ? handleRegisterDownline()  : alert('pilih agen terlebih dahulu')}
                    /> : null
                }
            </View>
        </View>
    )
}

export default Agen

const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor : '#ffffff',
    },  
    map: {
        ...StyleSheet.absoluteFillObject,
      },
    wrapper : {
        flex : 1
    },
    body : {
        paddingHorizontal : 20,
        paddingTop:20
    }, 
    hr : {
        borderBottomColor: colors.shadow,
        borderBottomWidth: 3,
        width:'100%',
        marginVertical : 20
    },
    img : {
        height : 100,
        width : 100
    },
    boxItem : {
        alignItems : 'center',
        elevation: 1,
        padding : 20,
        borderWidth : 1,
        borderColor : colors.shadow,
        marginVertical : 5,
    },
    text : {
        backgroundColor  : '#F9F9FA',
        width : '100%',
        marginVertical :5,
        padding:8,
        fontSize : 12
    },
    button : {
        backgroundColor : colors.default,
        width : '100%',
        padding : 10,
        borderRadius : 5
    },
    buttonText : {
        textAlign :'center',
        fontSize : 15,
        color : '#ffffff'
    }
})
