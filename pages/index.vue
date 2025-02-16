<template>
  <div>
    redirecting
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()
router.push({path: '/delivered-to-ub'})
</script>