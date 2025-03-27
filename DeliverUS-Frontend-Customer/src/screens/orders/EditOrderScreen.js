import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getOrderDetail } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function EditOrderScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const [quantities, setQuantities] = useState([])
  const [address, setAddress] = useState({})

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  const fetchOrderDetail = async () => {
    try {
      // Llama a la función getOrderDetail con el id de la orden proporcionado en route.params
      // y espera a que la promesa se resuelva. Almacena el resultado en fetchedOrderDetail.
      const fetchedOrderDetail = await getOrderDetail(route.params.id)

      // Inicializa dos arrays vacíos para almacenar las cantidades y precios de los productos de la orden.
      const quantitiesOrder = []
      const pricesOrder = []
      let presente = false // Variable para indicar si un producto está presente en la orden.

      // Itera sobre la lista de productos del restaurante.
      for (let i = 0; i < fetchedOrderDetail.products.length; i++) {
        // Itera sobre los productos en los detalles de la orden.
        for (const product of fetchedOrderDetail.products) {
          // Verifica si el id del producto en la orden coincide con el id del producto en el restaurante.
          if (product.id === (fetchedOrderDetail.products[i].id)) {
            presente = true // Marca que el producto está presente en la orden.
            // Agrega la cantidad del producto a quantitiesOrder.
            quantitiesOrder.push(product.OrderProducts.quantity)
            // Agrega el precio total del producto (cantidad * precio) a pricesOrder.
            pricesOrder.push(product.OrderProducts.quantity * fetchedOrderDetail.products[i].price)
            break // Sale del bucle interno.
          }
        }
        if (!presente) {
          // Si el producto no está presente en la orden, agrega 0 a quantitiesOrder y pricesOrder.
          quantitiesOrder.push(0)
          pricesOrder.push(0)
        }
        presente = false // Resetea la variable para el próximo producto.
      }

      // Actualiza el estado quantities con el array quantitiesOrder.
      setQuantities(quantitiesOrder)
      // Actualiza el estado order con los detalles de la orden obtenidos.
      setOrder(fetchedOrderDetail)
      // Actualiza el estado address con la dirección de la orden obtenida.
      setAddress(fetchedOrderDetail.address)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderFooter = () => {
    return (
      <View>
            <Pressable
              onPress={() => {
                navigation.navigate('ConfirmUpdateOrderScreen',
                  { quantities, id: route.params.id, address, order: order.id })
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandSuccessTap
                    : GlobalStyles.brandSuccess
                },
                styles.button
              ]}>
              <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <TextRegular textStyle={styles.text}>
                  Update
                </TextRegular>
              </View>
            </Pressable>
      </View>
    )
  }

  function updateQuantity ({ index, quantity }) {
    if (quantity < 0) {
      return
    }
    const auxQuantity = [...quantities]
    auxQuantity[index] = quantity
    setQuantities(auxQuantity)
  }

  const renderProduct = ({ item, index }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextSemiBold>Price: <TextRegular style={{ color: GlobalStyles.brandPrimary }}>{item.price.toFixed(2)} €</TextRegular></TextSemiBold>
        <TextSemiBold>Quantity: <TextRegular style={{ color: GlobalStyles.brandPrimary }}>{quantities[index]} </TextRegular></TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability}>Not available</TextRegular>
        }
        {item.availability && <View style={styles.actionButtonsContainer}>
        <Pressable
            onPress={() => updateQuantity({ quantity: quantities[index] - 1, index })}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.actionButton
            ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='minus-circle' color={'white'} size={20}/>
          </View>
        </Pressable>
        <Pressable
            onPress={() => updateQuantity({ quantity: quantities[index] + 1, index })}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandSecondaryTap
                  : GlobalStyles.brandSecondary
              },
              styles.actionButton
            ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='plus-circle' color={'white'} size={20}/>
          </View>
        </Pressable>
        </View>}
      </ImageCard>
    )
  }

  return (
    <FlatList
    ListFooterComponent={renderFooter}
    style={styles.container}
    data={order.products}
    renderItem={renderProduct}
    keyExtractor={item => item.id.toString()}
  />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    marginBottom: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '15%'
  }
}
)
