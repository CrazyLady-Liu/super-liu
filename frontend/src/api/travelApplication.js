import request from './request'

export function createApplication(data) {
  return request({
    url: '/api/travel-applications',
    method: 'post',
    data
  })
}

export function getApplications() {
  return request({
    url: '/api/travel-applications',
    method: 'get'
  })
}

export function getApplicationsByEmployee(employeeId) {
  return request({
    url: `/api/travel-applications/employee/${employeeId}`,
    method: 'get'
  })
}

export function getApplicationById(id) {
  return request({
    url: `/api/travel-applications/${id}`,
    method: 'get'
  })
}
