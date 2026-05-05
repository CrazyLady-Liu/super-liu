import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getCurrentUser } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  async function doLogin(username, password) {
    try {
      const response = await login(username, password)
      token.value = response.data.token
      userInfo.value = response.data.employee
      
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '登录失败' }
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    
    try {
      const response = await getCurrentUser()
      userInfo.value = response.data
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    } catch (error) {
      logout()
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    doLogin,
    fetchCurrentUser,
    logout
  }
})
