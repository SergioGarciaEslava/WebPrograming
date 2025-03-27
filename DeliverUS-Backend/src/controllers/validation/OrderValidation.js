// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

import { Order, Product, Restaurant } from '../../models/models.js'
import { check } from 'express-validator'

// value es un array de productos
// req es la request

const checkRestaurantExists = async (value, { req }) => { // FIRST CHECK
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant === null) {
      return Promise.reject(new Error('The restaurant does not exist.'))
    } else { return Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkProductsNotEmpty = async (value, { req }) => { // SECOND CHECK
  try {
    for (const product of value) {
      if (product === null || value.length === 0) {
        throw new Error('The product does not exist or is empty')
      } else if (product.productId === null || product.productId < 1) {
        throw new Error('The product does not have a valid Id')
      } else if (product.quantity < 0) {
        throw new Error('The quantity is not greater than 0')
      }
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkProductsAvailable = async (value, { req }) => { // THIRD CHECK
  try {
    for (const products of value) {
      const product = await Product.findByPk(products.productId)
      if (!product.availability) {
        throw new Error('Products are not available.')
      }
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkAllProductsBelongToSameRestaurant = async (value, { req }) => { // FOURTH CHECK
  try {
    const firstProductInArray = await Product.findByPk(value[0].productId) // Primer producto del array como referencia para los restaurantId del resto
    for (const products of value) {
      const restOfProducts = await Product.findByPk(products.productId)
      if (firstProductInArray.restaurantId !== restOfProducts.restaurantId) {
        throw new Error('Products do not belong to the same Restaurant')
      }
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkOrderIsInPendingState = async (value, { req }) => { // FIFTH CHECK
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order.status !== 'pending') {
      return Promise.reject(new Error('The order is not pending'))
    } else { return Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const create = [
  check('restaurantId').custom(checkRestaurantExists), // First Check
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('products').custom(checkProductsNotEmpty), // Second Check
  check('products').custom(checkProductsAvailable), // Third Check
  check('products').custom(checkAllProductsBelongToSameRestaurant), // Fourth Check
  check('products.*.quantity').isInt({ min: 1 }).toInt()
]

// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
  check('restaurantId').not().exists(), // First Check
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('products').custom(checkProductsNotEmpty), // Second Check
  check('products').custom(checkProductsAvailable), // Third Check
  check('products').custom(checkAllProductsBelongToSameRestaurant), // Fourth Check
  check('status').custom(checkOrderIsInPendingState), // Fifth Check
  check('products.*.quantity').isInt({ min: 1 }).toInt()

]

export { create, update }
