import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import OrdersScreen from './OrdersScreen'
import OrderDetailScreen from './OrderDetailScreen'
import EditOrderScreen from './EditOrderScreen'
import ConfirmUpdateOrderScreen from './ConfirmEditOrderScreen'

const Stack = createNativeStackNavigator()

export default function OrdersStack () {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='OrdersScreen'
        component={OrdersScreen}
        options={{
          title: 'My Orders'
        }} />
      <Stack.Screen
        name='EditOrderScreen'
        component={EditOrderScreen}
        options={{
          title: 'Edit Order'
        }} />
        <Stack.Screen
        name='OrderDetailScreen'
        component={OrderDetailScreen}
        options={{
          title: 'Edit Order'
        }} />
        <Stack.Screen
        name='ConfirmUpdateOrderScreen'
        component={ConfirmUpdateOrderScreen}
        options={{
          title: 'Edit Order'
        }} />
    </Stack.Navigator>

  )
}
