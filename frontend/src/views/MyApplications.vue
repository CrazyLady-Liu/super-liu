<template>
  <div class="applications-container">
    <el-card class="applications-card">
      <template #header>
        <div class="card-header">
          <span class="title">我的出差申请单</span>
          <el-button type="primary" @click="goToNewApplication">
            <el-icon><Plus /></el-icon>
            新建申请
          </el-button>
        </div>
      </template>
      
      <el-table :data="applications" v-loading="loading" stripe>
        <el-table-column prop="id" label="申请单号" width="100" />
        <el-table-column prop="travelType" label="出差类别" width="120" />
        <el-table-column label="出差时间" width="240">
          <template #default="scope">
            {{ scope.row.startDate }} 至 {{ scope.row.endDate }}
          </template>
        </el-table-column>
        <el-table-column prop="departureCity" label="出发城市" width="100" />
        <el-table-column prop="destinationCity" label="目的地城市" width="100" />
        <el-table-column label="出差人员">
          <template #default="scope">
            <div v-if="scope.row.travelerIds && scope.row.travelerIds.length > 0">
              <el-tag v-for="id in scope.row.travelerIds" :key="id" size="small" style="margin-right: 5px;">
                {{ getEmployeeName(id) }}
              </el-tag>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="120" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" text @click="viewDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && applications.length === 0" description="暂无出差申请单">
        <el-button type="primary" @click="goToNewApplication">立即创建</el-button>
      </el-empty>
    </el-card>
    
    <el-dialog v-model="showDetail" title="申请单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentApplication">
        <el-descriptions-item label="申请单号">{{ currentApplication.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentApplication.status)">
            {{ currentApplication.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="出差类别">{{ currentApplication.travelType }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentApplication.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="出发日期">{{ currentApplication.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束日期">{{ currentApplication.endDate }}</el-descriptions-item>
        <el-descriptions-item label="出发城市">{{ currentApplication.departureCity }}</el-descriptions-item>
        <el-descriptions-item label="目的地城市">{{ currentApplication.destinationCity }}</el-descriptions-item>
        <el-descriptions-item label="出差事由" :span="2">
          {{ currentApplication.reason || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="出差人员" :span="2">
          <div v-if="currentApplication.travelerIds && currentApplication.travelerIds.length > 0">
            <el-tag v-for="id in currentApplication.travelerIds" :key="id" size="small" style="margin-right: 5px;">
              {{ getEmployeeName(id) }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { getApplicationsByEmployee } from '../api/travelApplication'
import { getEmployees } from '../api/employee'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const applications = ref([])
const employees = ref([])
const showDetail = ref(false)
const currentApplication = ref(null)

const getStatusType = (status) => {
  const typeMap = {
    '已提交': 'primary',
    '已审批': 'success',
    '已驳回': 'danger'
  }
  return typeMap[status] || 'info'
}

const getEmployeeName = (id) => {
  const emp = employees.value.find(e => e.id === id)
  return emp ? emp.name : id
}

const loadApplications = async () => {
  if (!userStore.userInfo?.id) return
  
  loading.value = true
  try {
    const response = await getApplicationsByEmployee(userStore.userInfo.id)
    applications.value = response.data.sort((a, b) => b.id - a.id)
  } catch (error) {
    ElMessage.error('加载申请单列表失败')
  } finally {
    loading.value = false
  }
}

const loadEmployees = async () => {
  try {
    const response = await getEmployees()
    employees.value = response.data
  } catch (error) {
    ElMessage.error('加载员工信息失败')
  }
}

const viewDetail = (row) => {
  currentApplication.value = row
  showDetail.value = true
}

const goToNewApplication = () => {
  router.push('/travel-application')
}

onMounted(() => {
  loadEmployees()
  loadApplications()
})
</script>

<style scoped>
.applications-container {
  max-width: 1200px;
  margin: 0 auto;
}

.applications-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header .title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
</style>
