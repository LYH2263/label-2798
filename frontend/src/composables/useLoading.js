import { ref, onUnmounted } from 'vue'

export function useLoading() {
  const loading = ref(false)

  const runWithLoading = async (fn) => {
    loading.value = true
    try {
      const result = await fn()
      return result
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    runWithLoading
  }
}
