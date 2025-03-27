import { get, post, destroy, put } from './helpers/ApiRequestsHelper'

function getMyOrders () {
  return get('orders')
}

function getOrderDetail (id) {
  return get(`orders/${id}`)
}

function create (data) {
  return post('orders', data)
}

function deleteOrder (id) {
  return destroy(`orders/${id}`)
}

function update (id, data) {
  return put(`orders/${id}`, data)
}

export { getMyOrders, getOrderDetail, create, deleteOrder, update }
