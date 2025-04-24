import axios from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { handleError } from './Errors'
import { prepareData } from './FileUploadHelper'

// Obtener IP o URL desde extra en app.config.js o app.json

const API_BASE_URL =
  (Constants.expoConfig?.extra?.API_BASE_URL) ??
  (Constants.manifest?.extra?.API_BASE_URL) ??
  'http://localhost:8081' // fallback por si nada existe

axios.defaults.baseURL = API_BASE_URL
const get = route => {
  return new Promise(function (resolve, reject) {
    axios.get(route)
      .then(response => resolve(response.data))
      .catch(error => {
        try {
          handleError(error)
        } catch (err) {
          reject(err)
        }
      })
  })
}

const post = (route, data = null) => {
  const { config, preparedData } = prepareData(data)
  return new Promise(function (resolve, reject) {
    axios.post(route, preparedData, config)
      .then(response => resolve(response.data))
      .catch(error => {
        try {
          handleError(error)
        } catch (err) {
          reject(err)
        }
      })
  })
}

const put = (route, data = null) => {
  const { config, preparedData } = prepareData(data)
  return new Promise(function (resolve, reject) {
    axios.put(route, preparedData, config)
      .then(response => resolve(response.data))
      .catch(error => {
        try {
          handleError(error)
        } catch (err) {
          reject(err)
        }
      })
  })
}

const destroy = (route) => {
  return new Promise(function (resolve, reject) {
    axios.delete(route)
      .then(response => resolve(response.data))
      .catch(error => {
        try {
          handleError(error)
        } catch (err) {
          reject(err)
        }
      })
  })
}

axios.interceptors.request.use(
  async (config) => {
    let user
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      user = await SecureStore.getItemAsync('user')
    } else {
      user = await AsyncStorage.getItem('user')
    }

    if (user) {
      const parsed = JSON.parse(user)
      config.headers.Authorization = `Bearer ${parsed.token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

export { get, post, put, destroy }
