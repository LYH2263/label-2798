<template>
  <div class="manage-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="姓名/工号" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.department" placeholder="请选择" clearable style="width: 150px">
            <el-option label="技术部" value="技术部" /><el-option label="人事部" value="人事部" />
            <el-option label="财务部" value="财务部" /><el-option label="销售部" value="销售部" />
            <el-option label="市场部" value="市场部" /><el-option label="运营部" value="运营部" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="在职" value="active" /><el-option label="离职" value="resigned" /><el-option label="休假" value="on_leave" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
        <el-form-item class="add-btn-item">
          <el-button type="primary" @click="openAddDialog" class="add-btn"><el-icon><Plus /></el-icon>新增员工</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never" v-loading="loading">
      <el-table :data="employeeList" class="data-table" stripe border style="width: 100%" :header-cell-style="{ background: '#f5f7fa', fontWeight: 600 }">
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="employeeNo" label="工号" width="100" align="center" />
        <el-table-column prop="name" label="姓名" width="100" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.gender === 'male' ? 'primary' : 'danger'" size="small">{{ row.gender === 'male' ? '男' : '女' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="department" label="部门" width="120" align="center">
          <template #default="{ row }"><el-tag type="info" size="small">{{ row.department }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="position" label="职位" width="120" align="center" />
        <el-table-column prop="phone" label="电话" width="130" align="center" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" background />
      </div>
    </el-card>

    <EmployeeDialog v-model="dialogVisible" :title="dialogTitle" :edit-data="currentEditData" :loading="submitLoading" @submit="onDialogSubmit" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEmployee } from '../composables/useEmployee'
import EmployeeDialog from './EmployeeDialog.vue'
import '../styles/manage.css'

const {
  employeeList, total, loading, submitLoading, searchForm, pagination,
  fetchList, handleSearch, handleReset, handleSizeChange, handleCurrentChange,
  handleAdd, handleEdit, handleDelete, getStatusType, getStatusText
} = useEmployee()

const dialogVisible = ref(false)
const dialogTitle = ref('新增员工')
const isEdit = ref(false)
const currentId = ref(null)
const currentEditData = ref(null)

const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增员工'
  currentId.value = null
  currentEditData.value = null
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑员工'
  currentId.value = row.id
  currentEditData.value = { ...row }
  dialogVisible.value = true
}

const onDialogSubmit = async (formData) => {
  let success
  if (isEdit.value) success = await handleEdit(currentId.value, formData)
  else success = await handleAdd(formData)
  if (success) dialogVisible.value = false
}

onMounted(() => fetchList())
</script>
