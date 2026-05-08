import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useDialog(formRef, fetchData, createFn, updateFn) {
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增')
  const submitLoading = ref(false)
  const isEdit = ref(false)
  const currentId = ref(null)

  const resetForm = (defaultForm = {}) => {
    Object.assign(formRef.value || {}, defaultForm)
  }

  const openAdd = (defaultForm = {}) => {
    isEdit.value = false
    dialogTitle.value = '新增'
    currentId.value = null
    resetForm(defaultForm)
    dialogVisible.value = true
  }

  const openEdit = (row, defaultForm = {}) => {
    isEdit.value = true
    dialogTitle.value = '编辑'
    currentId.value = row.id
    Object.assign(formRef.value || {}, { ...defaultForm, ...row })
    dialogVisible.value = true
  }

  const close = () => {
    dialogVisible.value = false
  }

  const handleDelete = async (row, message = '确定要删除吗？') => {
    try {
      await ElMessageBox.confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      if (updateFn) {
        await updateFn(row.id, null, true)
      }
      ElMessage.success('删除成功')
      if (fetchData) {
        fetchData()
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const handleSubmit = async (validateFn, submitData = {}) => {
    if (!validateFn) {
      return false
    }

    try {
      await validateFn()
    } catch {
      return false
    }

    submitLoading.value = true
    try {
      if (isEdit.value) {
        if (updateFn) {
          await updateFn(currentId.value, { ...formRef.value, ...submitData })
        }
        ElMessage.success('更新成功')
      } else {
        if (createFn) {
          await createFn({ ...formRef.value, ...submitData })
        }
        ElMessage.success('创建成功')
      }
      close()
      if (fetchData) {
        fetchData()
      }
      return true
    } catch (error) {
      console.error('提交失败:', error)
      return false
    } finally {
      submitLoading.value = false
    }
  }

  return {
    dialogVisible,
    dialogTitle,
    submitLoading,
    isEdit,
    currentId,
    openAdd,
    openEdit,
    close,
    handleDelete,
    handleSubmit
  }
}
