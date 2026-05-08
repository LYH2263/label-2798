<template>
  <el-dialog v-model="visible" :title="title" width="650px" destroy-on-close :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="dialog-form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商品编码" prop="productCode"><el-input v-model="form.productCode" placeholder="请输入商品编码" /></el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品名称" prop="name"><el-input v-model="form.name" placeholder="请输入商品名称" /></el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
              <el-option label="电子产品" value="电子产品" /><el-option label="配件" value="配件" />
              <el-option label="存储设备" value="存储设备" /><el-option label="网络设备" value="网络设备" />
              <el-option label="智能设备" value="智能设备" /><el-option label="音频设备" value="音频设备" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品牌" prop="brand"><el-input v-model="form.brand" placeholder="请输入品牌" /></el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="单位" prop="unit">
            <el-select v-model="form.unit" placeholder="请选择" style="width: 100%">
              <el-option label="个" value="个" /><el-option label="台" value="台" /><el-option label="件" value="件" />
              <el-option label="盒" value="盒" /><el-option label="箱" value="箱" /><el-option label="套" value="套" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="售价" prop="price"><el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="成本价" prop="cost"><el-input-number v-model="form.cost" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="初始库存" prop="stock"><el-input-number v-model="form.stock" :min="0" style="width: 100%" /></el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最小库存" prop="minStock"><el-input-number v-model="form.minStock" :min="0" style="width: 100%" /></el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大库存" prop="maxStock"><el-input-number v-model="form.maxStock" :min="0" style="width: 100%" /></el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="仓库" prop="warehouse"><el-input v-model="form.warehouse" placeholder="请输入仓库" /></el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="货位" prop="location"><el-input v-model="form.location" placeholder="请输入货位" /></el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="供应商" prop="supplier"><el-input v-model="form.supplier" placeholder="请输入供应商" /></el-form-item>
      <el-form-item label="描述" prop="description"><el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean, title: String, editData: Object, loading: Boolean
})
const emit = defineEmits(['update:modelValue', 'submit'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, (val) => { visible.value = val })
watch(visible, (val) => { emit('update:modelValue', val) })

const formRef = ref()
const defaultForm = {
  productCode: '', name: '', category: '', brand: '', unit: '个',
  price: 0, cost: 0, stock: 0, minStock: 10, maxStock: 1000,
  warehouse: '', location: '', supplier: '', description: ''
}
const form = reactive({ ...defaultForm })

watch(() => props.editData, (data) => {
  if (data) Object.assign(form, { ...data })
  else Object.assign(form, { ...defaultForm })
}, { immediate: true })

const rules = {
  productCode: [
    { required: true, message: '请输入商品编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (valid) emit('submit', { ...form })
}
</script>
