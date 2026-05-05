import request from './request'

export function getEmployees() {
  return request({
    url: '/api/employees',
    method: 'get'
  })
}

export function getEmployeeById(id) {
  return request({
    url: `/api/employees/${id}`,
    method: 'get'
  })
}
