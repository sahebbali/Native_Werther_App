import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon } from 'react-native-heroicons/solid'
import {theme} from '../theme/index'
import { useCallback, useEffect, useState } from "react";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from '../constants';
import { getData, storeData } from '../utils/asyncStorage';
import { debounce } from "lodash";
import * as Progress from 'react-native-progress';


const HomeScreen=()=>{
  const [showSearch, setShowSearch]= useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState({})


   const handleSearch = search=>{
    // console.log('value: ',search);
    if(search && search.length>2)
      fetchLocations({cityName: search}).then(data=>{
        console.log('got locations: ',data);
        setLocations(data);
      })
  }

  const handleLocation = loc=>{
    setLoading(true);
    setShowSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data=>{
      setLoading(false);
      setWeather(data);
      storeData('city',loc.name);
    })
  }

  useEffect(()=>{
    fetchMyWeatherData();
  },[]);

  const fetchMyWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'Dhaka';
    if(myCity){
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data=>{
      console.log('got data: ',data?.forecast?.forecastday);
      setWeather(data);
      setLoading(false);
    })
    
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const {location, current} = weather;
    return(
        <View style={{flex: 1, position: "relative"}}>
        <StatusBar style="light" />
      <Image 
        blurRadius={40} 
         style={{position: 'absolute',  width: '100%',  height: '100%',}}
         source={require('../assets/images/weather.jpg')} 
         />
         {
          loading ? (
            <View style={styles.loading}>
              <Image source={require('../assets/icons/loading.gif')} />
            </View>
          ): (
            <SafeAreaView style={{flex: 1,}}>
            <View style={{ height: '20%',  margin: 30, position: 'relative', zIndex: 50, }}>
                <View style={[styles.innerView(showSearch),
                   
                ]}>
                    { showSearch ? (
                        <TextInput 
                          onChangeText={handleTextDebounce} 
                          placeholder="Search city" 
                          placeholderTextColor={'lightgray'} 
                          style={styles.textInput}
                        />
                      ):null}
                    <TouchableOpacity
                     onPress={()=> setShowSearch(!showSearch)} 
                     style={styles.iconButton}
                    >
                    {
                      showSearch ? (
                        <XMarkIcon size="25" color="red" />
                      ) : (
                         <MagnifyingGlassIcon size={25} color={'#1E293B'} />
                      )
                    }
                       
                    </TouchableOpacity>
                </View>
                  {
                  locations.length > 0 && showSearch ? (
                    <View style={styles.locationsContainer}>
                      {locations.map((loc, index) => {
                        let showBorder = index + 1 !== locations.length;
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleLocation(loc)}
                            style={[styles.locationItem(showBorder),]}
                          >
                            <MapPinIcon style={styles.locationIcon} />
                            <Text style={styles.locationText}>{loc?.name}, {loc?.country}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null
                }
            </View>

            <View style={styles.container}>
              {/* Location */}
              <Text style={styles.locationText}>
                {location?.name},{' '}
                <Text style={styles.countryText}>
                  {location?.country}
                </Text>
              </Text>

              {/* Weather icon */}
              <View style={styles.weatherIconContainer}>
                <Image
                  source={weatherImages[current?.condition?.text || 'other']}
                  //  source={require('../assets/images/partlycloudy.png')}
                  style={styles.weatherIcon}
                />
              </View>

                 <View style={styles.containerTempeture}>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.temperatureText}>
                      {current?.temp_c}&#176;
                    </Text>
                  </View>
                  <Text style={styles.conditionText}>
                    {current?.condition?.text} 
                  </Text>
                </View>


                 <View style={styles.containericon}>
                    <View style={styles.infoContainer}>
                      <Image source={require('../assets/icons/wind.png')} style={styles.icon} />
                      <Text style={styles.text}>
                      {current?.wind_kph}km
                      </Text>
                    </View>
                    <View style={styles.infoContainer}>
                      <Image source={require('../assets/icons/drop.png')} style={styles.icon} />
                      <Text style={styles.text}>
                      {current?.humidity}%
                      </Text>
                    </View>
                    <View style={styles.infoContainer}>
                      <Image source={require('../assets/icons/sun.png')} style={styles.icon} />
                      <Text style={styles.text}>
                        {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                      
                      </Text>
                    </View>
                  </View>
            </View>


             <View style={styles.containerotherstar}>
          <View style={styles.header}>
             <CalendarDaysIcon size="22" color="white" />
            <Text style={styles.headerText}>Daily forecast</Text>
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingHorizontal: 15 }}
            showsHorizontalScrollIndicator={false}
          >
            {weather?.forecast?.forecastday?.map((item, index) => {
              const date = new Date(item.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).split(',')[0];

              return (
                <View
                  key={index}
                  style={[
                    styles.forecastCard,
                    { backgroundColor: theme.bgWhite(0.15) },
                  ]}
                >
                  <Image
                    source={weatherImages[item?.day?.condition?.text || 'other']}
                    style={styles.forecastImage}
                  />
                  <Text style={styles.forecastDay}>{dayName}</Text>
                  <Text style={styles.forecastTemp}>{item?.day?.avgtemp_c}&#176;</Text>
                </View>
              );
            })}
          </ScrollView>
         </View>
            
    
         </SafeAreaView>
          )
         }
         
            
        </View>

    )
}
export default HomeScreen;

const styles = StyleSheet.create({  
  innerView: (showSearch)=> (
    {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: showSearch? theme.bgWhite(0.2): 'transparent',
    
  }
  ),
  textInput: {
    paddingLeft: 6,
    paddingBottom: 1,
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  iconButton: {
    borderRadius: 50,
    padding: 3,
    margin: 1,
    backgroundColor:'white',
  },
  icon: {
    size: 25,
    color: 'white',
  },
    locationsContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#CBD5E1',
    marginTop: 20,
    top: 16,
    borderRadius: 30,
  },
  locationItem: (showBorder) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    border: showBorder && {borderBottomWidth: '2px',
  borderBottomColor: '#061D1C',},
    padding: '3px',
    paddingLeft: '4px',
    marginBottom: '1px',
  }),
  locationIcon: {
    size: 20,
    color: 'gray',
  },
  locationText: {
    color: 'black',
    fontSize: 'lg',
    marginLeft: '2px',
  },
  container: {
    marginHorizontal: 4,
    justifyContent: 'space-around',
    flex: 1,
    marginBottom: 2,
  },
  locationText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  countryText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  weatherIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  weatherIcon: {
    width: 130,
    height: 130,
  },
   containerTempeture: {
    marginHorizontal: 5,
    marginBottom: 2,
  },
  temperatureText: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  conditionText: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
    letterSpacing: 2,
  },
   containericon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    spaceX: 2,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  containerotherstar: {
    marginBottom: 2,
    spaceY: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    spaceX: 2,
  },
  headerIcon: {
    width: 22,
    height: 22,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
  },
  forecastCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    paddingVertical: 15,
    marginRight: 4,
    borderRadius: 20,
  },
  forecastImage: {
    width: 44,
    height: 44,
  },
  forecastDay: {
    color: 'white',
  },
  forecastTemp: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loading:{
   display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 50
  }

})