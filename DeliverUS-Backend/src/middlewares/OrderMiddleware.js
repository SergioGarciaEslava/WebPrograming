import { Order, Restaurant } from '../models/models.js'

// TODO: Implement the following function to check if the order belongs to current loggedIn customer (order.userId equals or not to req.user.id)
const checkOrderCustomer = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id // Guardo en loggedInUserId la id del usuario que está realizando la petición

    const orderId = req.params.orderId // Guardo en orderId la id del pedido

    const order = await Order.findByPk(orderId) // Guardo en order el pedido con la id que estoy comprobando

    if (order.userId === loggedInUserId) { // Compruebo si la id del usuario que ha hecho el pedido es la misma que la del usuario que está conectado
      return next() // Si es la misma, paso al siguiente middleware
    } else { // Si no es la misma id, mensaje de no tener permiso
      return res.status(403).send('Forbidden: You are not authorized to access this resource.')
    }
  } catch (err) { // Excepción por si no se encuentra el pedido que se busca
    return res.status(500).send(err)
  }
}

// TODO: Implement the following function to check if the restaurant of the order exists
const checkRestaurantExists = async (req, res, next) => {
  try {
    const restaurantId = req.body.restaurantId // Guardo en restaurantId la id del restaurante del pedido que quiero buscar

    const restaurant = await Restaurant.findByPk(restaurantId) // Guardo en restaurant el restaurante cuya id corresponde a la buscada

    if (restaurant) { // Si el restaurante existe, pasa al siguiente middleware
      return next()
    } else { // Si el restaurante no existe, devuelve un error
      return res.status(409).send('The order cannot be sent')
    }
  } catch (err) { // Excepción por si hay un error
    return res.status(500).send(err)
  }
}

const checkOrderOwnership = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: {
        model: Restaurant,
        as: 'restaurant'
      }
    })
    if (req.user.id === order.restaurant.userId) {
      return next()
    } else {
      return res.status(403).send('Not enough privileges. This entity does not belong to you')
    }
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkOrderVisible = (req, res, next) => {
  if (req.user.userType === 'owner') {
    checkOrderOwnership(req, res, next)
  } else if (req.user.userType === 'customer') {
    checkOrderCustomer(req, res, next)
  }
}

const checkOrderIsPending = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isPending = !order.startedAt
    if (isPending) {
      return next()
    } else {
      return res.status(409).send('The order has already been started')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderCanBeSent = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isShippable = order.startedAt && !order.sentAt
    if (isShippable) {
      return next()
    } else {
      return res.status(409).send('The order cannot be sent')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
const checkOrderCanBeDelivered = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isDeliverable = order.startedAt && order.sentAt && !order.deliveredAt
    if (isDeliverable) {
      return next()
    } else {
      return res.status(409).send('The order cannot be delivered')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderIsConfirmed = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order.status === 'in process') {
      return res.status(409).send('The order is already confirmed')
    }
    next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderIsSent = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order.status === 'sent') {
      return res.status(409).send('The order is already sent')
    }
    next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderIsDelivered = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order.status === 'delivered') {
      return res.status(409).send('The order is already delivered')
    }
    next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export { checkOrderOwnership, checkOrderCustomer, checkOrderVisible, checkOrderIsPending, checkOrderCanBeSent, checkOrderCanBeDelivered, checkRestaurantExists, checkOrderIsConfirmed, checkOrderIsSent, checkOrderIsDelivered }
