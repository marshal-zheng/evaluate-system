<template>
  <el-drawer
    v-model="open"
    title="组件信息"
    :with-header="true"
    :append-to-body="true"
    :destroy-on-close="true"
    :modal="false"
    size="300px"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
      <el-form-item label="组件名" prop="label">
        <el-input v-model="formData.label" placeholder="请填写组件名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dag-config__footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useGraphEvent } from '../../ZxFlow/composables/useGraphEvent';
import { useGraphStore } from '../../ZxFlow/composables/useGraphStore';

const graphStore = useGraphStore();

const open = ref(false);
const currentNodeId = ref(null);
const formRef = ref(null);
const formData = reactive({
  label: '',
});

const rules = {
  label: [{ required: true, message: '请填写组件名称', trigger: 'blur' }],
};

const resetForm = () => {
  formRef.value?.resetFields();
  formData.label = '';
};

const handleCancel = () => {
  open.value = false;
  currentNodeId.value = null;
  resetForm();
};

const handleSave = () => {
  formRef.value?.validate((valid) => {
    if (!valid || !currentNodeId.value) {
      return;
    }
    graphStore.updateNode(currentNodeId.value, {
      data: {
        label: formData.label,
      },
    });
    handleCancel();
  });
};

useGraphEvent('node:click', ({ node }) => {
  const data = node?.getData?.() || {};
  currentNodeId.value = node?.id;
  formData.label = data.label || '';
  open.value = true;
});

useGraphEvent('blank:click', () => {
  if (open.value) {
    handleCancel();
  }
});
</script>

<style scoped lang="scss">
.dag-config__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
