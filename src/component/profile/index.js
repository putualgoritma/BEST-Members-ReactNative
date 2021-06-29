import { faCopy, faShare, faStreetView } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React,{useEffect, useState} from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, Linking, ScrollView, Share, Dimensions, PermissionsAndroid } from 'react-native'
import QRCode from 'react-native-qrcode-svg';
import { useDispatch, useSelector } from 'react-redux';
import {colors} from '../../utils'
import Header from '../header'
import Input from '../input'
import Spinner from '../spinner'
import Button from '../button'
import Footer from '../footer'
import {Product} from '../../assets'
import Config from 'react-native-config';
import Clipboard from '@react-native-clipboard/clipboard'
import MapView, { Marker } from 'react-native-maps';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import Geolocation from '@react-native-community/geolocation';
import API from '../../service';
import { SET_DATA_USER } from '../../redux/action';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = (props) => {
    const USER = useSelector((state) => state.UserReducer);
    const TOKEN = useSelector((state) => state.TokenReducer);
    const dispatch = useDispatch();
    const { width, height } = Dimensions.get('window');
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 1.0922;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
    const LATITUDE = -8.3978769;
    const LONGITUDE = 115.2141418;
    var defaultLoc = {};
    const [loading, setLoading] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [form, setForm] = useState({
        id :USER.id,
        name : USER.name,
        password : null,
        phone :USER.phone,
        email:USER.email,
        address:USER.address,
        lat : USER.lat ==null ? 0.00000 : parseFloat(USER.lat),
        lng : USER.lng  ==null ? 0.00000 : parseFloat(USER.lng),
    })
    const [location, setLocation] = useState({
        latitude: 0.00000,
        longitude: 0.0000
    })


    useEffect(() => {
        let isAmounted  = false
    
        if(!isAmounted){
        console.log(typeof USER.lat);
          LocationServicesDialogBox.checkLocationServicesIsEnabled({
            message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
            ok: "YES",
            cancel: "NO",
          }).then(function(success) {
                requestLocationPermission().then(() => {
                    Geolocation.getCurrentPosition(
                        (position) => {
                            setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude, 
                            })
                            defaultLoc ={
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude, 
                            }
                            console.log( typeof (position.coords.latitude));
                            setLoading(false)
                        },
                        (error) => {
                            console.log(error);    
                        },
                            { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 },
                        );
                })
          }).catch((error) => {
              console.log(error.message); // error.message => "disabled"
              navigation.navigate('Register')
          });
        
        }
    
        return () => {
          isAmounted = true
        }
      }, [])

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
               console.log("Location permission granted")
           } else {
               console.log("Location permission denied")
           }
        } catch (err) {
           console.warn(err)
        }
      }
    
    //   const _getCurrentLocation = () =>{
    //     Geolocation.getCurrentPosition(
    //        (position) => {
    //         setLocation({
    //           latitude: position.coords.latitude,
    //           longitude: position.coords.longitude, 
    //        })
    //        setLoading(false)
    //     },
    //     (error) => {
    //         console.log(error);    
    //     },
    //         { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 },
    //     );
    //   }

    const handleProfile = () => {
        if(form.password !== null) {
              if(form.password === confirmPassword){
                    if(form.id !== null && form.name !=='' && form.email !=='' && form.address !=='' && form.phone !==''){
                            if(form.lat == 0.00000 || form.lng == 0.00000 ){
                                setForm({
                                    ...form,
                                    lat : location,
                                    lng : location
                                })
                            }
                            setLoading(true)
                            API.updateProfile(form, TOKEN).then((result) => {
                                    // window.location.reload();
                                    console.log(result.data);
                                    dispatch(SET_DATA_USER(result.data))
                                    storeDataUser(result.data)
                                    props.navigation.navigate('Info', {notif : 'Update Berhasil', navigasi : 'Home'})
                            }).catch((e) => {
                                    console.log(e);
                                    let mes = JSON.parse(e.request._response)
                                    alert(mes.message)
                                    setLoading(false)
                            })
                        }else{
                            alert('mohon lengkapi data anda')
                        }
                }
                else{
                        alert('password tidak sama')
                }
            }else{
                alert('mohon isi password')
            }
    }

    const onChangeForm = (name, value) => {
        setForm({
                ...form,
                [name] : value
        })
        
    }

    const onShare = async () => {
        try {
          const result = await Share.share({
            message:USER.ref_link,
          });
        } catch (error) {
          alert(error.message);
        }
      };

    
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
                        title = 'Profile'
                        navigation = {() => props.navigation.goBack()}
                />
                <ScrollView>
                    <View style={styles.body}>
                            <View style={{alignItems:'center'}}>
                                <QRCode
                                    value={String(USER.id)}
                                    logoSize={30}
                                    logoBackgroundColor='transparent'
                                />
                            </View>

                            <View style={{flexDirection:'row', marginVertical : 15, justifyContent:'space-between', paddingRight:50}}>
                                <Text>Link Referal</Text>
                                <View style={{marginLeft:50}}>
                                    <Text onPress={() => Linking.openURL(USER.ref_link)}>{USER.ref_link}</Text>
                                    <View style={{flexDirection:'row', marginVertical : 10}}>
                                        <TouchableOpacity style={{alignItems:'center'}} onPress={() =>{ Clipboard.setString(USER.ref_link); alert('link is copy')}}>
                                            <FontAwesomeIcon icon={faCopy}  style={{marginHorizontal : 20}} size={25} color={colors.default}/>
                                            <Text>Copy</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{alignItems:'center'}} onPress={onShare}>
                                            <FontAwesomeIcon icon={faShare}  style={{marginHorizontal : 20}} size={25} color='orange'/>
                                            <Text>Copy</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <>
                                <Text style={styles.title}>Edit Profile</Text>
                                {/* foto */}
                                <View style = {{flexDirection:'row', alignItems:'center'}}>
                                    {/* <Image source={Product} /> */}
                                    {USER.img == null || USER.img == '' ?  
                                        <Image
                                            source={Product}
                                            style={{height: 50, width: 50, marginRight: 20}}
                                            /> : 
                                        <Image
                                            source = {{uri : Config.REACT_APP_BASE_URL + `${String(USER.img).replace('public/', '')}?time="` + new Date()}}
                                            style={{height: 50, width: 50, marginRight: 20}}
                                        />
                                    }
                                    <TouchableOpacity style={{borderWidth:1, borderColor:colors.default, padding:5, borderRadius:5}} onPress={() => props.navigation.navigate('UploadImage')} ><Text>Edit Profile</Text></TouchableOpacity>
                                </View>
                                <Input
                                    title = 'Nama Lengkap'
                                    placeholder = 'Nama Lengkap'
                                    value ={form.name}
                                    onChangeText={(value) => onChangeForm('name', value)}
                                />
                                <Input
                                    title = 'Password'
                                    placeholder = 'Password'
                                    secureTextEntry={true}
                                    onChangeText={(value) => onChangeForm('password', value)}
                                />
                                <Input
                                    title = 'Confirm Password'
                                    placeholder = 'Confirm Password'
                                    secureTextEntry={true}
                                    onChangeText={(value) => setConfirmPassword(value)}
                                />
                                <Input
                                    title = 'Email'
                                    placeholder = 'Email'
                                    value ={form.email}
                                    onChangeText={(value) => onChangeForm('email', value)}
                                />
                                <Input
                                    title = 'Phone'
                                    placeholder = 'Phone'
                                    value ={form.phone}
                                    onChangeText={(value) => onChangeForm('phone', value)}
                                />
                                <Input
                                    title = 'Alamat'
                                    placeholder = 'Alamat'
                                    value ={form.address}
                                    onChangeText={(value) => onChangeForm('address', value)}
                                />
                                <Text>Type</Text>
                                <View style={{borderWidth:1, padding:10, width :'40%', marginVertical : 10, borderRadius:5, alignItems : 'center',backgroundColor:colors.default}}><Text style={{color:'#ffffff'}}>{USER.type}</Text></View>
                            </>
                    </View>
                    <Button
                        title = 'Update'
                        width = '80%'
                        onPress= {handleProfile}
                    />
                       <View style={{marginTop:40}}>
                            <MapView
                                style={styles.map}
                                //  provider={PROVIDER_GOOGLE}
                                // showsUserLocation
                                initialRegion={{
                                latitude: LATITUDE,
                                longitude: LONGITUDE,
                                latitudeDelta: 1.0922,
                                longitudeDelta: 0.0421}}
                            >
                                <Marker
                                    coordinate={{latitude : (form.lat == 0.00000 ?  location.latitude : form.lat), longitude:(form.lng == 0.00000 ?location.longitude : form.lng)}}
                                    // onDragEnd={e => console.log('onDragEnd', e.nativeEvent.coordinate.latitude)}
                                    onDragEnd={(e) => setForm({
                                        ...form,
                                        lat : e.nativeEvent.coordinate.latitude,
                                        lng : e.nativeEvent.coordinate.longitude
                                    })}
                                    draggable
                                >
                                </Marker>
                            </MapView>
                            {/* <View style={{position:'absolute', bottom:10, right:10}} >
                                <TouchableOpacity onPress={() => setLocation({latitude : defaultLoc.latitude, longitude : defaultLoc.longitude})} >
                                    <FontAwesomeIcon icon={faStreetView} size={50}/>
                                </TouchableOpacity>
                            </View> */}
                       </View>
                </ScrollView>
            </View>
                <Footer
                focus = 'Profile'
                navigation = {props.navigation}
                />
        </View>
    )
}

export default Profile

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
        paddingTop:20
    }, 
    hr : {
        borderBottomColor: colors.shadow,
        borderBottomWidth: 3,
        width:'100%',
        marginVertical : 20
    },
    qrCode : {
        backgroundColor:colors.shadow,
        height : 120,
        width : 120
    },
    title : {
        fontSize : 20,
        fontWeight : 'bold',
        marginBottom:20
    },
    map: {
        height : 300,
        width : '100%',
      },
})
