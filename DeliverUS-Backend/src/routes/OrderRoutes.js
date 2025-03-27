import OrderController from '../controllers/OrderController.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as OrderMiddleware from '../middlewares/OrderMiddleware.js'
import { Order, Restaurant } from '../models/models.js'
import * as OrderValidation from '../controllers/validation/OrderValidation.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'

const loadFileRoutes = function (app) {
  // TODO: Include routes for:
  // 1. Retrieving orders from current logged-in customer
  app.route('/orders')
    .get(
      isLoggedIn,
      hasRole('customer'),
      OrderController.indexCustomer
    )
  // 2. Creating a new order (only customers can create new orders)
    .post( // crea nuevas orders si el rol es customer, ya que es la funcion POST a la ruta /orders
      isLoggedIn,
      hasRole('customer'),
      OrderMiddleware.checkRestaurantExists,
      OrderValidation.create,
      handleValidation,
      OrderController.create
    )

  // Otras funciones
  app.route('/orders/:orderId')
    .get( // simplemente sirve para mostrar y visualizar los detalles de un order especificado por su orderId
      isLoggedIn,
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderVisible,
      OrderController.show)

  app.route('/orders/:orderId/confirm')
    .patch(
      isLoggedIn, // Verifica si el usuario está autenticado
      hasRole('owner'), // Verifica si el usuario tiene el rol de "owner"
      checkEntityExists(Order, 'orderId'), // Verifica si el pedido con el ID proporcionado existe en la base de datos
      OrderMiddleware.checkOrderOwnership, // Verifica si el usuario autenticado es el propietario del pedido
      OrderMiddleware.checkOrderIsPending,
      OrderController.confirm // Controlador que maneja la lógica de confirmación del pedido
    )

  app.route('/orders/:orderId/send')
    .patch(
      isLoggedIn, // Verifica si el usuario está autenticado
      hasRole('owner'), // Verifica si el usuario tiene el rol de "owner"
      checkEntityExists(Order, 'orderId'), // Verifica si el pedido con el ID proporcionado existe en la base de datos
      OrderMiddleware.checkOrderOwnership, // Verifica si el usuario autenticado es el propietario del pedido
      OrderMiddleware.checkOrderCanBeSent,
      OrderController.send // Controlador que maneja la lógica de envío del pedido
    )

  app.route('/orders/:orderId/deliver')
    .patch(
      isLoggedIn, // Verifica si el usuario está autenticado
      hasRole('owner'), // Verifica si el usuario tiene el rol de "owner"
      checkEntityExists(Order, 'orderId'), // Verifica si el pedido con el ID proporcionado existe en la base de datos
      OrderMiddleware.checkOrderOwnership, // Verifica si el usuario autenticado es el propietario del pedido
      OrderMiddleware.checkOrderCanBeDelivered,
      OrderController.deliver // Controlador que maneja la lógica de entrega del pedido
    )

  // TODO: Include routes for:
  // 3. Editing order (only customers can edit their own orders)
  app.route('/orders/:orderId')
    .put( // Editar pedidos
      isLoggedIn, // Verifica si el usuario está autenticado
      hasRole('customer'), // Verifica si el usuario tiene el rol de "customer"
      checkEntityExists(Order, 'orderId'), // Verifica si el pedido con el ID proporcionado existe en la base de datos
      OrderMiddleware.checkOrderCustomer, // Verifica si el usuario autenticado es el propietario del pedido
      OrderValidation.update, // Valida los datos del pedido que se va a actualizar
      OrderMiddleware.checkOrderIsConfirmed,
      OrderMiddleware.checkOrderIsDelivered,
      OrderMiddleware.checkOrderIsSent,
      handleValidation, // Maneja los errores de validación
      OrderController.update // Controlador que maneja la lógica de actualización del pedido
    )
  // 4. Remove order (only customers can remove their own orders)
    .delete( // Eliminar pedidos
      isLoggedIn, // Verifica si el usuario está autenticado
      hasRole('customer'), // Verifica si el usuario tiene el rol de "customer"
      checkEntityExists(Order, 'orderId'), // Verifica si el pedido con el ID proporcionado existe en la base de datos
      OrderMiddleware.checkOrderCustomer, // Verifica si el usuario autenticado es el propietario del pedido
      OrderMiddleware.checkOrderVisible,
      OrderMiddleware.checkOrderIsConfirmed,
      OrderMiddleware.checkOrderIsDelivered,
      OrderMiddleware.checkOrderIsSent,
      OrderController.destroy // Controlador que maneja la lógica de eliminación del pedido

    )
}

export default loadFileRoutes
