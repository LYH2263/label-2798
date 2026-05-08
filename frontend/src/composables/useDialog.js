import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useDialog(options = {}) {
  const { form, formRef, fetchData, createFn, updateFn, deleteFn } = options

  const dialogVisible = ref(false)
  const dialogTitle = ref('新增')
  const submitLoading = ref(false)
  const isEdit = ref(false)
  const currentId = ref(null)

  const defaultForm = options.defaultForm || {}

  const resetForm = () => {
    Object.assign(form, defaultForm)
  }

  const openAdd = (customDefault = {}) => {
    isEdit.value = false
    dialogTitle.value = '新增'
    currentId.value = null
    resetForm()
    if (Object.keys(customDefault).length > 0) {
      Object.assign(form, customDefault)
    }
    dialogVisible.value = true
  }

  const openEdit = (row, customDefault = {}) => {
    isEdit.value = true
    dialogTitle.value = '编辑'
    currentId.value = row.id
    resetForm()
    Object.assign(form, { ...defaultForm, ...customDefault, ...row })
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
      if (deleteFn) {
        await deleteFn(row.id)
      }
      ElMessage.success('删除成功')
      if (fetchData) {
        fetchData()
      }
      return true
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
      return false
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
          await updateFn(currentId.value, { ...form, ...submitData })
        }
        ElMessage.success('更新成功')
      } else {
        if (createFn) {
          await createFn({ ...form, ...submitData })
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
