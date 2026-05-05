<template>
  <div class="application-container">
    <el-card class="application-card">
      <template #header>
        <div class="card-header">
          <span class="title">出差申请单</span>
          <el-tag type="info">自动提交</el-tag>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="application-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出差类别" prop="travelType">
              <el-select v-model="form.travelType" placeholder="请选择出差类别" style="width: 100%">
                <el-option label="公务出差" value="公务出差" />
                <el-option label="培训出差" value="培训出差" />
                <el-option label="会议出差" value="会议出差" />
                <el-option label="商务洽谈" value="商务洽谈" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出发日期" prop="startDate">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="选择出发日期"
                style="width: 100%"
                :disabled-date="disabledStartDate"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
                :disabled-date="disabledEndDate"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出发城市" prop="departureCity">
              <el-select
                v-model="form.departureCity"
                placeholder="请选择出发城市"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="city in cities"
                  :key="city"
                  :label="city"
                  :value="city"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目的地城市" prop="destinationCity">
              <el-select
                v-model="form.destinationCity"
                placeholder="请选择目的地城市"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="city in cities"
                  :key="city"
                  :label="city"
                  :value="city"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="出差事由">
          <el-input
            v-model="form.reason"
            type="textarea"
            placeholder="请输入出差事由（非必填）"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="出差人员" prop="travelerIds">
          <el-select
            v-model="form.travelerIds"
            multiple
            filterable
            placeholder="请选择出差人员（可多选）"
            style="width: 100%"
          >
            <el-option
              v-for="emp in employees"
              :key="emp.id"
              :label="`${emp.name} (${emp.department})`"
              :value="emp.id"
            />
          </el-select>
          <div class="form-tip">默认已选择当前登录用户，可添加其他同事</div>
        </el-form-item>
        
        <el-form-item class="submit-section">
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="handleSubmit"
          >
            <el-icon><Check /></el-icon>
            提交申请
          </el-button>
          <el-button size="large" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-dialog
      v-model="showSuccess"
      title="提交成功"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="success-content">
        <el-icon size="64" color="#67C23A"><CircleCheck /></el-icon>
        <h3>出差申请单已成功提交！</h3>
        <p>申请单号：{{ lastApplication?.id }}</p>
        <p>状态：已提交</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="goToMyApplications">
          查看我的申请
        </el-button>
        <el-button @click="continueCreate">
          继续新建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { getCities } from '../api/city'
import { getEmployees } from '../api/employee'
import { createApplication } from '../api/travelApplication'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)
const showSuccess = ref(false)
const lastApplication = ref(null)

const cities = ref([])
const employees = ref([])

const today = computed(() => {
  const d = new Date()
  return d.toISOString().split('T')[0]
})

const form = reactive({
  travelType: '公务出差',
  startDate: today.value,
  endDate: today.value,
  reason: '',
  departureCity: '',
  destinationCity: '',
  travelerIds: []
})

const rules = {
  travelType: [{ required: true, message: '请选择出差类别', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择出发日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  departureCity: [{ required: true, message: '请选择出发城市', trigger: 'change' }],
  destinationCity: [{ required: true, message: '请选择目的地城市', trigger: 'change' }],
  travelerIds: [
    { required: true, message: '请选择出差人员', trigger: 'change' },
    { 
      type: 'array', 
      min: 1, 
      message: '至少选择一名出差人员', 
      trigger: 'change' 
    }
  ]
}

const disabledStartDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

const disabledEndDate = (time) => {
  if (form.startDate) {
    const startDate = new Date(form.startDate).getTime()
    return time.getTime() < startDate - 8.64e7
  }
  return time.getTime() < Date.now() - 8.64e7
}

const loadCities = async () => {
  try {
    const response = await getCities()
    cities.value = response.data
  } catch (error) {
    ElMessage.error('加载城市列表失败')
  }
}

const loadEmployees = async () => {
  try {
    const response = await getEmployees()
    employees.value = response.data
    
    if (userStore.userInfo?.id) {
      form.travelerIds = [userStore.userInfo.id]
    }
  } catch (error) {
    ElMessage.error('加载员工列表失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  if (form.endDate < form.startDate) {
    ElMessage.error('结束日期不能早于出发日期')
    return
  }
  
  submitting.value = true
  
  try {
    const response = await createApplication({
      travelType: form.travelType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
      departureCity: form.departureCity,
      destinationCity: form.destinationCity,
      travelerIds: form.travelerIds
    })
    
    lastApplication.value = response.data
    submitting.value = false
    showSuccess.value = true
  } catch (error) {
    submitting.value = false
    ElMessage.error('提交失败，请重试')
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.travelType = '公务出差'
  form.startDate = today.value
  form.endDate = today.value
  form.reason = ''
  form.departureCity = ''
  form.destinationCity = ''
  if (userStore.userInfo?.id) {
    form.travelerIds = [userStore.userInfo.id]
  }
}

const goToMyApplications = () => {
  showSuccess.value = false
  router.push('/my-applications')
}

const continueCreate = () => {
  showSuccess.value = false
  resetForm()
}

onMounted(() => {
  loadCities()
  loadEmployees()
})
</script>

<style scoped>
.application-container {
  max-width: 900px;
  margin: 0 auto;
}

.application-card {
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

.application-form {
  padding: 20px 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.submit-section {
  text-align: center;
  padding-top: 20px;
  margin-bottom: 0;
}

.submit-section .el-button {
  margin: 0 10px;
  min-width: 120px;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-content h3 {
  margin: 15px 0;
  color: #303133;
}

.success-content p {
  color: #606266;
  margin: 5px 0;
}
</style>
