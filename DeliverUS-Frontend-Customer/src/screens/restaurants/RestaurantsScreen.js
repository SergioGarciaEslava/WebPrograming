/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import ImageCard from '../../components/ImageCard'
import { brandPrimary, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { getRestaurants } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import { FlatList, Text } from 'react-native-web'
import { getPopular } from '../../api/ProductEndpoints'

export default function RestaurantsScreen ({ navigation, route }) {
  // TODO: Create a state for storing the restaurants
  const [restaurants, setRestaurants] = useState([])
  const [popular, setPopular] = useState([])

  // FR1
  useEffect(() => {
  // TODO: Fetch all restaurants and set them to state.
  //      Notice that it is not required to be logged in.
    async function fetchRestaurants () {
      try {
      // se llama a la función getRestaurants() para obtener la lista de restaurantes
      // Se espera que getRestaurants() devuelva una lista de restaurantes
        const fetchedRestaurants = await getRestaurants()
        // Una vez que se obtienen los restaurantes, se establecen en el estado utilizando setRestaurants
        setRestaurants(fetchedRestaurants)
      } catch (error) {
      // Si hay algún error al obtener los restaurantes, se muestra un mensaje de error.
        showMessage({
          message: `There was an error while retrieving the restaurants. ${error}`,
          type: 'error',
          style: flashStyle,
          textStyle: flashTextStyle
        })
      }
    }
    // se llama a la función fetchRestaurants() para iniciar la carga de los restaurantes
    fetchRestaurants() // TODO: set restaurants to state
  }, [route])

  // FR7
  useEffect(() => {
    async function fetchPopular () {
      try {
        // se llama a la función getPopular() para obtener la lista de productos populares.
        // Se espera que getPopular() devuelva una lista de productos.
        const fetchedPopular = await getPopular()
        // Una vez que se obtienen los productos populares, se establecen en el estado utilizando setPopular.
        setPopular(fetchedPopular)
      } catch (error) {
        // Si hay algún error al obtener los productos populares, se muestra un mensaje de error.
        showMessage({
          message: `There was an error while retrieving the popular products ${error}`,
          type: 'error',
          style: flashStyle,
          textStyle: flashTextStyle
        })
      }
    }
    // se llama a la función fetchPopular() para iniciar la carga de los productos populares.
    fetchPopular()
  }, [])

  const renderRestaurant = ({ item }) => {
    return (
      // Se renderiza un componente de tarjeta de imagen (ImageCard) para representar un restaurante.
      <ImageCard
        // Se establece la imagen del restaurante. Si el restaurante tiene un logo, se utiliza. De lo contrario, se deja como undefined.
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : undefined}
        // Se establece el título del restaurante como el nombre del restaurante.
        title={item.name}
        // Cuando se presiona la tarjeta de imagen del restaurante, se navega a la pantalla de detalles del restaurante.
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        {/* Se muestra la descripción del restaurante. */}
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {/* Si el restaurante tiene un tiempo de servicio promedio, se muestra junto con el tiempo promedio. */}
        {item.averageServiceTime !== null && <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>}
        {/* Se muestra el costo de envío del restaurante. */}
        <TextSemiBold>Shipping: <TextRegular style={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemiBold>
      </ImageCard>
    )
  }
  // FR7

  const renderPopular = ({ item }) => {
    return (
      // Se renderiza una vista que contiene información sobre el producto popular.
      <View style={styles.cardBody}>
        {/* Se muestra el nombre del producto popular. */}
        <Text style={styles.cardText}>{item.name}</Text>
        {/* Se renderiza una tarjeta de imagen para representar el producto popular. */}
        <ImageCard
          // Se establece la imagen del producto popular. Si el producto tiene una imagen, se utiliza. De lo contrario, se deja como undefined.
          imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
          // Cuando se presiona la tarjeta de imagen del producto popular, se navega a la pantalla de detalles del restaurante.
          onPress={() => {
            navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId })
          }}
        />
        {/* Se muestra la descripción del producto popular. */}
        <TextRegular style={{ marginRight: 100 }} numberOfLines={2}>{item.description}</TextRegular>
        {/* Se muestra el precio del producto popular. */}
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
      </View>
    )
  }

  // Para mostrar el renderizado que creamos previamente crearemos una variable con una lista plana de manera similar con la declaración de retorno de la función predeterminada en la que estamos.
  const renderHeaderPopular = () => {
    return (
      // Se renderiza una lista horizontal de productos populares
      <FlatList
        horizontal={true}
        style={{ flex: 1 }}
        // Se utiliza el estado 'popular' como origen de datos para la lista
        data={popular}
        // Para cada elemento en el estado 'popular', se llama a la función 'renderPopular' para renderizar el elemento
        renderItem={renderPopular}
      />
    )
  }

  const renderEmptyRestaurant = () => {
    return (
      // Se renderiza un mensaje indicando que no se recuperaron restaurantes
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived. Are you logged in?
      </TextRegular>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        ListEmptyComponent={renderEmptyRestaurant}
        ListHeaderComponent={renderHeaderPopular}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  cardBody: {
    flex: 5,
    padding: 10
  },
  cardText: {
    marginLeft: 10,
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Montserrat_600SemiBold'
  }
})
