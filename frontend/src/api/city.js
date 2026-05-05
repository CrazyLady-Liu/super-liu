import request from './request'

export function getCities() {
  return request({
    url: '/api/cities',
    method: 'get'
  })
}
