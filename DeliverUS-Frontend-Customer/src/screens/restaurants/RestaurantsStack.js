import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import RestaurantDetailScreen from './RestaurantDetailScreen'
import RestaurantsScreen from './RestaurantsScreen'
import ConfirmOrderScreen from '../orders/ConfirmOrderScreen'
import ConfirmOrderScreenYes from '../orders/ConfirmOrderScreenYes'

const Stack = createNativeStackNavigator()

export default function RestaurantsStack () {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='RestaurantsScreen'
        component={RestaurantsScreen}
        options={{
          title: 'Restaurants'
        }} />
      <Stack.Screen
        name='RestaurantDetailScreen'
        component={RestaurantDetailScreen}
        options={{
          title: 'Restaurant Detail'
        }} />
        <Stack.Screen
        name='ConfirmOrderScreen'
        component={ConfirmOrderScreen}
        options={{
          title: 'Confirm Order'
        }} />
        <Stack.Screen
        name='ConfirmOrderScreenYes'
        component={ConfirmOrderScreenYes}
        options={{
          title: 'Confirm Order Yes'
        }} />
    </Stack.Navigator>
  )
}
