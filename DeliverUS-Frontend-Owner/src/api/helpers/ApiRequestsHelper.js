import axios from 'axios'
import { handleError } from './Errors'
import { Platform } from 'react-native'
import { prepareData } from './FileUploadHelper'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const API_BASE_URL =
  (Constants.expoConfig?.extra?.API_BASE_URL) ??
  (Constants.manifest?.extra?.API_BASE_URL) ??
  'http://localhost:8081' // fallback por si nada existe

axios.defaults.baseURL = API_BASE_URL

const get = route => {
  return new Promise(function (resolve, reject) {
    axios.get(route)
      .then(function (response) {
        resolve(response.data)
      })
      .catch(error => {
        try {
          handleError(error)
        } catch (error) {
          reject(error)
        }
      })
  })
}

const post = (route, data = null) => {
  const { config, preparedData } = prepareData(data)

  return new Promise(function (resolve, reject) {
    axios.post(route, preparedData, config)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        try {
          handleError(error)
        } catch (error) {
          reject(error)
        }
      })
  })
}

const put = (route, data = null) => {
  const { config, preparedData } = prepareData(data)

  return new Promise(function (resolve, reject) {
    axios.put(route, preparedData, config)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        try {
          handleError(error)
        } catch (error) {
          reject(error)
        }
      })
  })
}

const destroy = (route) => {
  return new Promise(function (resolve, reject) {
    axios.delete(route)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        try {
          handleError(error)
        } catch (error) {
          reject(error)
        }
      })
  })
}

const patch = (route, data = null) => {
  const { config, preparedData } = prepareData(data)

  return new Promise(function (resolve, reject) {
    axios.patch(route, preparedData, config)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        try {
          handleError(error)
        } catch (error) {
          reject(error)
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

export { get, post, put, destroy, patch }
