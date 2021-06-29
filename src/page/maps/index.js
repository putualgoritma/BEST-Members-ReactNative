import React, { useEffect, useState } from 'react'
import { Dimensions, PermissionsAndroid, StyleSheet, Text, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps';
import { BackHandler, DeviceEventEmitter } from 'react-native';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import Geolocation from '@react-native-community/geolocation';
import { Spinner } from '../../component';
const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = -8.4553172;
const LONGITUDE = 114.7913479;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;

function log(eventName, e) {
  console.log(eventName, e.nativeEvent);
}

const Maps = ({navigation}) => {
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null
  })


  useEffect(() => {
    let isAmounted  = false

    if(!isAmounted){
      LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
        ok: "YES",
        cancel: "NO",
      }).then(function(success) {
          requestLocationPermission()
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
            _getCurrentLocation()
           console.log("Location permission granted")
       } else {
           console.log("Location permission denied")
       }
    } catch (err) {
       console.warn(err)
    }
  }

  const _getCurrentLocation = () =>{
    Geolocation.getCurrentPosition(
       (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude, 
       })
       setLoading(false)
    },
    (error) => {
        console.log(error);    
    },
        { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 },
    );
  }

  if(loading){
    return (
      <Spinner/>
    )
  }

  return (
    <View style={styles.container}>
        <MapView
          // provider={this.props.provider}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
        >
          <Marker
            coordinate={location}
            onSelect={e => log('onSelect', e)}
            onDrag={e => log('onDrag', e)}
            onDragStart={e => log('onDragStart', e)}
            onDragEnd={e => log('onDragEnd', e)}
            onPress={e => log('onPress', e)}
            draggable
          >
          </Marker>
        </MapView>
    </View>
  )
}

export default Maps

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})
