import { ref } from 'vue'

export function usePagination(fetchFn, initialParams = {}) {
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const list = ref([])
  const loading = ref(false)

  const fetchData = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: page.value,
        pageSize: pageSize.value,
        ...initialParams,
        ...params
      }
      const res = await fetchFn(queryParams)
      if (res && res.data) {
        list.value = res.data.list || []
        total.value = res.data.total || 0
        page.value = res.data.page || page.value
        pageSize.value = res.data.pageSize || pageSize.value
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    page.value = 1
    pageSize.value = 10
  }

  const handleSizeChange = (val) => {
    pageSize.value = val
    page.value = 1
    fetchData()
  }

  const handleCurrentChange = (val) => {
    page.value = val
    fetchData()
  }

  return {
    page,
    pageSize,
    total,
    list,
    loading,
    fetchData,
    reset,
    handleSizeChange,
    handleCurrentChange
  }
}
