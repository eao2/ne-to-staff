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
                step="0.01"
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
    </div>
  </template>
  
  <script setup>
  const trackingNumber = ref('')
  const isExistingUser = ref(false)
  
  const userData = ref({
    phoneNumber: '',
    name: '',
    surName: ''
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
      // Create submission data based on whether phone number exists
      const submissionData = {
        trackingNumber: trackingNumber.value,
        cargo: cargoData.value,
        user: userData.value.phoneNumber ? userData.value : null
      }
  
      await $fetch('/api/cargo/save', {
        method: 'POST',
        body: submissionData
      })
      
      alert('Cargo information saved successfully')
    } catch (error) {
      console.error('Error saving cargo:', error)
    }
  }
  
  // Modified clearUserData to be manually triggered
  function clearUserData() {
    userData.value = {
      phoneNumber: '',
      name: '',
      surName: ''
    }
    isExistingUser.value = false
  }
  
  // Modified searchCargo to handle null user data
  async function searchCargo() {
    try {
      const response = await $fetch('/api/cargo/search', {
        method: 'POST',
        body: {
          trackingNumber: trackingNumber.value
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
            name: response.cargo.user.name,
            surName: response.cargo.user.surName
          }
          isExistingUser.value = true
        } else {
          clearUserData()
        }
      } else {
        clearUserData()
        // Reset cargo data...
      }
    } catch (error) {
      console.error('Error searching cargo:', error)
    }
  }
  </script>
<style lang="scss">
@use './index.scss'
</style>