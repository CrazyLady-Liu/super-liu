<template>
  <el-container class="main-container">
    <el-header class="header">
      <div class="logo">
        <el-icon size="30" color="#409EFF"><OfficeBuilding /></el-icon>
        <span class="title">出差申请单系统</span>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        class="menu"
        router
      >
        <el-menu-item index="/travel-application">
          <el-icon><Edit /></el-icon>
          <span>出差申请</span>
        </el-menu-item>
        <el-menu-item index="/my-applications">
          <el-icon><Document /></el-icon>
          <span>我的申请</span>
        </el-menu-item>
      </el-menu>
      <div class="user-info">
        <el-dropdown @command="handleCommand">
          <span class="user-dropdown">
            <el-icon><User /></el-icon>
            <span>{{ userStore.userInfo?.name || '用户' }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.main-container {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-left: 10px;
}

.menu {
  flex: 1;
  border-bottom: none;
}

.user-info {
  margin-left: auto;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.user-dropdown:hover {
  color: #409EFF;
}

.user-dropdown > span {
  margin: 0 5px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
