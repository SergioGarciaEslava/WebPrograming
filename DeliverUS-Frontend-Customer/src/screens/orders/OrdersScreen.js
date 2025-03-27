import React, { useEffect, useContext, useState } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemibold from '../../components/TextSemibold'
import { brandPrimary, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import { getMyOrders, deleteOrder } from '../../api/OrderEndpoints'
import { FlatList } from 'react-native-web'
import ImageCard from '../../components/ImageCard'
import { MaterialCommunityIcons } from '@expo/vector-icons' // import necesario para Pressable
import * as GlobalStyles from '../../styles/GlobalStyles' // import necesario para Pressable
import DeleteModal from '../../components/DeleteModal'

export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  // FR5: Listing my confirmed orders. A Customer will be able to check his/her confirmed orders, sorted from the most recent to the oldest.

  useEffect(() => {
    async function fetchOrders () {
      try {
        const fetchedOrders = await getMyOrders()
        setOrders(fetchedOrders)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the orders. ${error}`,
          type: 'error',
          style: flashStyle,
          textStyle: flashTextStyle
        })
      }
    }
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route])

  const renderOrders = ({ item }) => {
    const isEditable = item.status === 'pending'

    return (
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : undefined}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id, dirty: true })
        }}
      >
        { isEditable && (
        <Pressable
        onPress={() => navigation.navigate('EditOrderScreen', { id: item.id })}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? GlobalStyles.brandBlueTap : GlobalStyles.brandBlue
            },
            styles.actionButton
          ]}
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="pencil" color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>Edit</TextRegular>
          </View>
        </Pressable>
        )}

      {/* Botón de eliminación */}
      { isEditable && (
        <Pressable
        onPress={() => { setOrderToBeDeleted(item) }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? GlobalStyles.brandPrimaryTap : GlobalStyles.brandPrimary
            },
            styles.actionButton
          ]}
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="delete" color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>Delete</TextRegular>
          </View>
        </Pressable>
      )}

      <View style={{ marginLeft: 10 }}>
        <TextSemibold textStyle={{ fontSize: 16, color: 'black' }}>Order {item.id}</TextSemibold>
        <TextSemibold>Created at: <TextRegular numberOfLines={2}>{item.createdAt}</TextRegular></TextSemibold>
        <TextSemibold>Price: <TextRegular style={{ color: brandPrimary }}>{item.price.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Shipping: <TextRegular style={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Status: <TextRegular style={{ color: brandPrimary }}>{item.status}</TextRegular></TextSemibold>
      </View>
      </ImageCard>

    )
  }

  const removeOrder = async (order) => {
    try {
      await deleteOrder(order.id)
      await fetchOrders()
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.name} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.name} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getMyOrders()
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving orders. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderEmptyOrder = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retreived. Are you logged in?
      </TextRegular>
    )
  }

  return (

    <View style={styles.container}>
          <DeleteModal
      isVisible={orderToBeDeleted !== null}
      onCancel={() => setOrderToBeDeleted(null)}
      onConfirm={() => removeOrder(orderToBeDeleted)}>
        <TextRegular>The products of this restaurant will be deleted as well</TextRegular>
        <TextRegular>If the restaurant has orders, it cannot be deleted.</TextRegular>
    </DeleteModal>
      <FlatList
        style={styles.container}
        data={orders}
        renderItem={renderOrders}
        ListEmptyComponent={renderEmptyOrder}
        keyExtractor={item => item.id.toString()}
        />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center'
  },
  textTitle: {
    fontSize: 20,
    color: 'black'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
