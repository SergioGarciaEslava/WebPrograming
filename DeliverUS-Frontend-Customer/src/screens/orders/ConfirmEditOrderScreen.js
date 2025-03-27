/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Pressable, ScrollView } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getOrderDetail, update } from '../../api/OrderEndpoints'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { Formik } from 'formik'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import * as yup from 'yup'
import TextError from '../../components/TextError'
import InputItem from '../../components/InputItem'

export default function ConfirmUpdateOrderScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const [products, setProducts] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [order, setOrder] = useState({})
  const initialOrderValues = { address: route.params.address, products: [] }
  const validationSchema = yup.object().shape({
    products: yup
      .array(yup.object({ quantity: yup.number().required().min(0).integer() })),
    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required')
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Llama a la función getDetail con el OrderId proporcionado en route.params
      // y espera a que la promesa se resuelva. Almacena el resultado en fetchOrdertDetail.
      const fetchOrdertDetail = await getOrderDetail(route.params.id)

      // Actualiza el estado 'products' con la lista de productos obtenida del Order.
      setProducts(fetchOrdertDetail.products)

      // Actualiza el estado 'Order' con los detalles completos del Order.
      setOrder(fetchOrdertDetail)

      // Itera sobre el array de cantidades proporcionado en route.params.quantities.
      for (let index = 0; index < route.params.quantities.length; ++index) {
        // Verifica si la cantidad en la posición actual del array es mayor a 0.
        if (route.params.quantities[index] > 0) {
          // Crea un objeto 'product' con las propiedades productId y quantity.
          // productId se obtiene del id del producto correspondiente en fetchOrdertDetail.products.
          // quantity se obtiene de route.params.quantities en la posición actual.
          const product = { productId: fetchOrdertDetail.products[index].id, quantity: route.params.quantities[index] }
          // Agrega el objeto 'product' al array 'products' dentro de initialOrderValues.
          initialOrderValues.products.push(product)
        }
      }
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving the order (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const updateOrder = async (values) => {
    setBackendErrors([])
    try {
      const updatedOrder = await update(route.params.id, values)
      showMessage({
        message: `Order ${updatedOrder.id} successfully updated. Go to My Orders to check it out!`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        textStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('OrdersScreen', { dirty: true })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  return (
    <Formik
      initialValues={initialOrderValues}
      validationSchema={validationSchema}
      onSubmit={updateOrder}>
      {({ handleSubmit }) => (
        <ScrollView>

          <FlatList
            style={styles.container}
            data={products}
            keyExtractor={item => item.id.toString()}
          />

          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='address'
                label='Address' />

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.msg}</TextError>)}

              <Pressable
                onPress={() =>
                  handleSubmit()
                }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccess
                      : GlobalStyles.brandSuccessTap
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20} />
                  <TextRegular textStyle={styles.text}>
                    Confirm update
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>

        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  input: {
    borderRadius: 8,
    height: 15,
    borderWidth: 1,
    padding: 15,
    marginTop: 10,
    marginLeft: 5
  }
})
