<template>
  <div class="cargo-management">
    <h1>NE-TO beta</h1>
    
    <div class="search-section">
      <label>Tracking Number</label>
      <div class="search-container">
        <input 
          v-model="trackingNumber"
          placeholder="Enter tracking number"
        />
        <button 
          @click="searchCargo"
          class="btn-search"
        >
          Search
        </button>
      </div>
    </div>

    <form @submit.prevent="submitCargo" class="cargo-form">
      <!-- User Information -->
      <div class="form-section">
        <h2>User Information</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Phone Number</label>
            <input 
              v-model="userData.phoneNumber"
              :readonly="isExistingUser"
              required
            />
          </div>
          <div class="form-group">
            <label>Name (Optional)</label>
            <input 
              v-model="userData.name"
              :readonly="isExistingUser"
            />
          </div>
        </div>
      </div>

      <!-- Cargo Information -->
      <div class="form-section">
        <h2>Cargo Information</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Nickname (Optional)</label>
            <input 
              v-model="cargoData.nickname"
            />
          </div>
          <div class="form-group">
            <label>Cargo Type</label>
            <select 
              v-model="cargoData.cargoType"
            >
              <option value="NORMAL">Normal</option>
              <option value="QUICK">Quick</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select 
              v-model="cargoData.currentStatus"
              @change="handleStatusChange"
            >
              <option value="PRE_REGISTERED">Pre-registered</option>
              <option value="RECEIVED_AT_ERENHOT">Received at Erenhot</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED_TO_UB">Delivered to UB</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
          <div v-if="cargoData.currentStatus === 'DELIVERED_TO_UB'" class="form-group">
            <label>Price</label>
            <input 
              v-model="cargoData.price"
              type="number"
              step="1"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit"
        class="btn-submit"
      >
        Save Cargo Information
      </button>
    </form>
    
    <!-- Phone Number Search -->
    <div class="search-section">
      <label>Search by Phone Number</label>
      <div class="search-container">
        <input 
          v-model="searchPhoneNumber"
          placeholder="Enter phone number"
        />
        <button 
          @click="searchUserCargos"
          class="btn-search"
        >
          Search Cargos
        </button>
      </div>
    </div>

    <!-- User Cargos Table -->
    <div v-if="userCargos.length > 0" class="cargos-table-container">
      <h2>User Cargos</h2>
      <table class="cargos-table">
        <thead>
          <tr>
            <th>Tracking Number</th>
            <th>Nickname</th>
            <th>Type</th>
            <th>Status</th>
            <th>Price</th>
            <th>Latest Update</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cargo in sortedUserCargos" :key="cargo.id">
            <td>{{ cargo.trackingNumber }}</td>
            <td>{{ cargo.nickname || '-' }}</td>
            <td>{{ cargo.cargoType }}</td>
            <td>{{ formatStatus(cargo.currentStatus) }}</td>
            <td>{{ cargo.price ? `$${cargo.price}` : '-' }}</td>
            <td>{{ formatDate(getLatestDate(cargo)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const trackingNumber = ref('')
const searchPhoneNumber = ref('')
const isExistingUser = ref(false)
const userCargos = ref([])

const userData = ref({
  phoneNumber: '',
  name: ''
})

const cargoData = ref({
  nickname: '',
  cargoType: 'NORMAL',
  currentStatus: 'PRE_REGISTERED',
  price: null,
  preRegisteredDate: null,
  receivedAtErenhotDate: null,
  inTransitDate: null,
  deliveredToUBDate: null,
  deliveredDate: null
})

// Status priority for sorting
const statusPriority = {
  'PRE_REGISTERED': 1,
  'RECEIVED_AT_ERENHOT': 2,
  'IN_TRANSIT': 3,
  'DELIVERED_TO_UB': 4,
  'DELIVERED': 5
}

const sortedUserCargos = computed(() => {
  return [...userCargos.value].sort((a, b) => {
    return statusPriority[a.currentStatus] - statusPriority[b.currentStatus]
  })
})

function formatStatus(status) {
  return status.replace(/_/g, ' ').toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase())
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

function getLatestDate(cargo) {
  const dates = [
    cargo.deliveredDate,
    cargo.deliveredToUBDate,
    cargo.inTransitDate,
    cargo.receivedAtErenhotDate,
    cargo.preRegisteredDate
  ]
  return dates.find(date => date) || null
}

async function searchUserCargos() {
  if (!searchPhoneNumber.value) return
  
  try {
    const response = await $fetch('/api/cargo/user-cargos', {
      method: 'POST',
      body: {
        phoneNumber: searchPhoneNumber.value
      }
    })
    
    userCargos.value = response.cargos || []
  } catch (error) {
    console.error('Error searching user cargos:', error)
    alert('Error searching user cargos')
  }
}

function handleStatusChange(event) {
  const newStatus = event.target.value
  const currentDate = new Date().toISOString()

  // Update corresponding date based on status
  switch (newStatus) {
    case 'PRE_REGISTERED':
      cargoData.value.preRegisteredDate = currentDate
      break
    case 'RECEIVED_AT_ERENHOT':
      cargoData.value.receivedAtErenhotDate = currentDate
      break
    case 'IN_TRANSIT':
      cargoData.value.inTransitDate = currentDate
      break
    case 'DELIVERED_TO_UB':
      cargoData.value.deliveredToUBDate = currentDate
      break
    case 'DELIVERED':
      cargoData.value.deliveredDate = currentDate
      break
  }
}

// Reset price when status changes from DELIVERED_TO_UB
watch(() => cargoData.value.currentStatus, (newStatus) => {
  if (newStatus !== 'DELIVERED_TO_UB') {
    cargoData.value.price = null
  }
})

async function submitCargo() {
  try {
    const submissionData = {
      trackingNumber: trackingNumber.value.trim(),
      cargo: cargoData.value,
      user: userData.value.phoneNumber ? userData.value : null
    }

    await $fetch('/api/cargo/save', {
      method: 'POST',
      body: submissionData
    })
    
    alert('Cargo information saved successfully')
    await searchUserCargos() // Refresh the cargos table
  } catch (error) {
    console.error('Error saving cargo:', error)
    alert('Error saving cargo information')
  }
}

function clearUserData() {
  userData.value = {
    phoneNumber: '',
    name: ''
  }
  isExistingUser.value = false
}

async function searchCargo() {
  try {
    const response = await $fetch('/api/cargo/search', {
      method: 'POST',
      body: {
        trackingNumber: trackingNumber.value.trim()
      }
    })
    
    if (response.cargo) {
      const currentStatus = cargoData.value.currentStatus
      
      cargoData.value = {
        ...response.cargo,
        currentStatus: currentStatus || response.cargo.currentStatus
      }
      
      if (response.cargo.user) {
        userData.value = {
          phoneNumber: response.cargo.user.phoneNumber,
          name: response.cargo.user.name
        }
        isExistingUser.value = true
      } else {
        clearUserData()
      }
    } else {
      clearUserData()
      cargoData.value = {
        nickname: '',
        cargoType: 'NORMAL',
        currentStatus: 'PRE_REGISTERED',
        price: null,
        preRegisteredDate: null,
        receivedAtErenhotDate: null,
        inTransitDate: null,
        deliveredToUBDate: null,
        deliveredDate: null
      }
    }
  } catch (error) {
    console.error('Error searching cargo:', error)
    alert('Error searching cargo')
  }
}
</script>

<style lang="scss">
@use './index.scss'
</style>