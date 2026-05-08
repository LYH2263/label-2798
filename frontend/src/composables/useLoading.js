import { ref } from 'vue'

export const useLoading = (initialState = false) => {
  const loading = ref(initialState)

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = () => {
    loading.value = false
  }

  const withLoading = async (fn) => {
    loading.value = true
    try {
      return await fn()
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading
  }
}
