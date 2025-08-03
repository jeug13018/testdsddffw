<template>
  <Sonner v-bind="toasterConfig" />
  <router-view />
  <LoginModal />
  <UserModal />
  <AntiFraudGuide />
  <QrCertificate />
  <QA />
</template>

<script setup lang="ts">
import LoginModal from '@/components/LoginModal.vue'
import UserModal from '@/components/UserModal.vue'
import AntiFraudGuide from '@/components/AntiFraudGuide.vue'
import QrCertificate from '@/components/QrCertificate.vue'
import QA from '@/components/QA.vue'
import { Toaster as Sonner } from '@/components/ui/sonner'

const toasterConfig = {
  position: 'top-center',
  // richColors: true,
}
</script>
