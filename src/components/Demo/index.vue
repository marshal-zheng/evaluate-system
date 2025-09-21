<template>
  <div class="demo-showcase">
    <main class="demo-content">
      <!-- <Demo1 /> -->
      <!-- <Demo2 />
      <Demo3 />
      <Demo4 /> -->
      <!-- <Demo5 />
      <Demo6 /> -->
      <!-- <Demo7 /> -->
      <!-- <Demo8 /> -->
        <!-- <Demo9 /> -->
        <!-- <Demo10 /> -->
        <!-- <Demo11 /> -->
        <!-- <Demo12 /> -->
        <Demo13 />
    </main>
  </div>
</template>

<script setup>
import Demo1 from './Demo1.vue'
import Demo2 from './Demo2.vue'
import Demo3 from './Demo3.vue'
import Demo4 from './Demo4.vue'
import Demo5 from './Demo5.vue'
import Demo6 from './Demo6.vue'
import Demo7 from './Demo7.vue'
import Demo8 from './Demo8.vue'
import Demo9 from './Demo9.vue'
import Demo10 from './Demo10.vue'
import Demo11 from './Demo11.vue'
import Demo12 from './Demo12.vue'
import Demo13 from './Demo13.vue'
</script>

<style scoped>
.demo-showcase {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.showcase-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.showcase-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  font-weight: 300;
}

.subtitle {
  margin: 0;
  font-size: 1.1em;
  opacity: 0.9;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.showcase-footer {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.showcase-footer a {
  color: #42b883;
  text-decoration: none;
  font-weight: bold;
}

.showcase-footer a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-showcase {
    padding: 10px;
  }
  
  .showcase-header h1 {
    font-size: 2em;
  }
  
  .subtitle {
    font-size: 1em;
  }
}
</style>