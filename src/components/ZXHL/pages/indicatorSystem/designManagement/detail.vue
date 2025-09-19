<template>
  <div class="indicator-system-detail">
    <div class="detail-header">
      <ZxButton @click="goBack" style="margin-right: 16px;">
        <template #icon>
          <ZxIcon icon="ArrowLeft" />
        </template>
        返回
      </ZxButton>
      <h1 class="detail-title">指标体系设计</h1>
    </div>
    

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ZxButton from '@/components/ZXHL/comp/pure/ZxButton'
import ZxIcon from '@/components/ZXHL/comp/pure/ZxIcon'

const router = useRouter()



// 返回列表
const goBack = () => {
  router.push({ name: 'IndicatorSystemList' })
}


</script>

<style lang="scss" scoped>
.indicator-system-detail {
  padding: 20px;
  height: 100%;
  overflow-y: auto;

  .detail-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .detail-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }


}
</style>