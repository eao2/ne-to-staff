<template>
    <div class="cargo-management">
        <SideBar />
        <div class="main-content">
            <div class="search-section">
                <div class="search-group">
                    <label>Утасны Дугаар:</label>
                    <div class="search-container">
                    <input 
                      v-model="phoneNumber"
                      placeholder="Утасны дугаар оруулах"
                      @input="debouncedSearchUser"
                      autofocus
                    />
                    <button @click="searchUser" class="btn-search">Хайх</button>
                    <button @click="clearUserDataAll" class="btn-search">Цэвэрлэх</button>
                    </div>
                </div>
                
                <div class="search-group">
                    <label>Захиалагчийн Нэр:</label>
                    <input 
                      v-model="userData.name"
                      :disabled="isExistingUser"
                      placeholder="Захиалагчийн нэр"
                    />
                </div>
            </div>
    
            <form
              @submit.prevent
              class="cargo-form">
              <div class="form-section">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Төрөл:</label>
                    <div class="cargo-type-options">
                    <input 
                      id="normal"
                      type="radio" 
                      v-model="cargoData.cargoType" 
                      value="NORMAL"
                      tabindex="1"
                      name="cargoType"
                    />
                    <label for="normal" class="radio-box">
                      <span class="radio-label">Энгийн</span>
                    </label>
                    <input
                      id="quick"
                      type="radio" 
                      v-model="cargoData.cargoType" 
                      value="QUICK"
                      tabindex="2"
                      name="cargoType"
                    />
                    <label for="quick" class="radio-box">
                      <span class="radio-label">Шуурхай</span>
                    </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Төлөх дүн:</label>
                    <input 
                      type="number"
                      v-model="cargoData.price"
                      placeholder="Төлөх дүн оруулах"
                      required
                      id="cargoDataPrice"
                      @keydown.enter.prevent="$refs.trackingNumber.focus()"
                      ref="cargoPrice"
                      name="cargoPrice"
                    />
                  </div>

                  <div class="form-group">
                    <label>Трак Код:</label>
                    <input
                      type="text"
                      v-model="cargoData.trackingNumber"
                      required
                      placeholder="Трак код оруулах"
                      @keydown.enter.prevent="submitCargo"
                      ref="trackingNumber"
                      name="cargotrackingNumber"
                    />
                  </div>
                  <button 
                    type="submit"
                    class="btn-submit"
                    :disabled="!phoneNumber || !cargoData.trackingNumber"
                    tabindex="5"
                    @click="submitCargo"
                  >
                    Ачааны мэдээлэл нэмэх
                  </button>
                </div>
                
              </div>
            </form>
    
            <div v-if="userCargos.length > 0" class="cargos-table-container">
            <h2>{{ userCargosName }}</h2>
            <h4 v-if="totalPrice > 0">Нийт Дүн: {{ numberWithCommas(totalPrice) }}₮</h4>
            <table class="cargos-table">
                <thead>
                <tr>
                    <th>Трак Код</th>
                    <th>Нэр</th>
                    <th>Төрөл</th>
                    <th>Төлөв</th>
                    <th>Үнэ</th>
                    <th>Сүүлийн Шинэчлэл</th>
                    <th>Үйлдэл</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="cargo in sortedUserCargos" :key="cargo.id">
                    <td>{{ cargo.trackingNumber }}</td>
                    <td>{{ cargo.nickname }}</td>
                    <td>{{ cargo.cargoType === 'NORMAL' ? 'Энгийн' : 'Шуурхай' }}</td>
                    <td>{{ formatStatus(cargo.currentStatus) }}</td>
                    <td>{{ cargo.price ? `${numberWithCommas(cargo.price)} ₮` : '-' }}</td>
                    <td>{{ formatDate(getLatestDate(cargo)) }}</td>
                    <td>
                    <button @click="editCargo(cargo)" class="btn-edit">Засах</button>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>
        </div>
</template>

<style lang="scss" scoped>
$primary-color: #1a73e8;
$secondary-color: #4285f4;
$background-color: #f8f9fa;
$border-color: #e0e0e0;
$text-color: #202124;
$sidebar-width: 280px;

// Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin button-base {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.cargo-management {
  display: flex;

  .main-content {
    margin-left: $sidebar-width;
    width: calc(100% - #{$sidebar-width});
    background-color: $background-color;
  }
}

// Form Styles
.search-section {
  padding: 12px 1.5rem;
  display: flex;
  background-color: #F6F6F6;
  border-bottom: 1px dashed #DBE0E0;
  align-items: center;
  gap: 1.5rem;
    .search-group {
      display: flex;
      align-items: center;
      gap: 8px;
      .search-container{
        display: flex;
        gap: 1rem;
      }
        &:last-child {
        margin-bottom: 0;
        }
    }
}

.form-grid{
  padding: 12px 1.5rem;
  display: flex;
  background-color: #F6F6F6;
  border-bottom: 1px dashed #DBE0E0;
  align-items: center;
  gap: 1.5rem;
  .form-group{
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.cargo-type-options {
  display: flex;
  
  input[type="radio"] {
      display: none;
    &:checked + .radio-box {
      color: #fff;
      background-color: $primary-color;
    }
  }

  .radio-box {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    width: 7.5rem;
    height: 2.5rem;
    background-color: #fff;

    .radio-label {
      display: block;
      text-align: center;
      font-weight: 500;
    }
  }
}

input{
  max-width: 15rem;
  height: 2.5rem;
  border-radius: 8px;
  border: 1px solid $border-color;
  color: $text-color;
  padding: 8px;
  background-color: #ffffff;
}

// Table Styles
.cargos-table-container {
  background-color: white;
  padding: 24px;
  border-radius: 8px;

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid $border-color;
    }

    th {
      font-weight: 500;
      color: $text-color;
      background-color: rgba($primary-color, 0.05);
    }
  }
}

// Button Styles
.btn-search {
  @include button-base;
  background-color: $primary-color;
  color: white;

  &:hover {
    filter: brightness(0.9)
  }
}

.btn-submit {
  @include button-base;
  background-color: $secondary-color;
  color: white;

  &:disabled {
    background-color: $border-color;
    cursor: not-allowed;
  }
}

.btn-edit {
  @include button-base;
  background-color: transparent;
  color: $primary-color;

  &:hover {
    filter: brightness(0.9)
  }
}
</style>

<script setup>
  import { ref, computed, watch, onUnmounted } from 'vue'
  
  const phoneNumber = ref('')
  const isExistingUser = ref(false)
  const userCargos = ref([])
  const userCargosName = ref('')
  const userCargosMessage = ref('')
  let searchTimeout = null
  
  const userData = ref({
    phoneNumber: '',
    name: ''
  })
  
  const cargoData = ref({
    trackingNumber: '',
    cargoType: 'NORMAL',
    currentStatus: 'DELIVERED_TO_UB',
    price: null,
    preRegisteredDate: null,
    receivedAtErenhotDate: null,
    inTransitDate: null,
    deliveredToUBDate: null,
    deliveredDate: null
  })

  // Create a debounced search function
  function debouncedSearchUser() {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    searchTimeout = setTimeout(() => {
      if (phoneNumber.value.trim()) {
        searchUser()
      } else {
        clearUserDataAll()
      }
    }, 500)
  }
  
  const totalPrice = computed(() => {
    return userCargos.value
      .filter(cargo => cargo.currentStatus === 'DELIVERED_TO_UB' && cargo.price)
      .reduce((sum, cargo) => sum + Number(cargo.price), 0)
  })

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatStatus(status) {
    const statusMap = {
      'PRE_REGISTERED': 'Бүртгэгдсэн',
      'RECEIVED_AT_ERENHOT': 'Эрээнд ирсэн',
      'IN_TRANSIT': 'Замд яваа',
      'DELIVERED_TO_UB': 'УБ-д ирсэн',
      'DELIVERED': 'Хүлээлгэж өгсөн'
    }
    return statusMap[status] || status
  }

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
  
  function formatDate(date) {
    if (!date) return '-'
    return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString({hourCycle: 'h24'})}`
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

  
  async function searchUser() {
    if (!phoneNumber.value.trim()) {
      clearUserDataAll()
      return
    }
  
    try {
      const response = await $fetch('/api/cargo/user-cargos', {
        method: 'POST',
        body: {
          phoneNumber: phoneNumber.value.trim()
        }
      })
      
      userCargos.value = response.cargos || []
      userCargosName.value = response.name || ''
      userCargosMessage.value = response.message || ''
      
      if (response.name) {
        userData.value.name = response.name
        userData.value.phoneNumber = phoneNumber.value.trim()
        isExistingUser.value = true
      } else {
        userData.value.name = ''
        userData.value.phoneNumber = phoneNumber.value.trim()
        isExistingUser.value = false
      }
    } catch (error) {
      console.error('Error searching user:', error)
      alert('Error searching user')
    }
  }
  
  async function submitCargo() {
    if (!phoneNumber.value.trim() || !cargoData.value.trackingNumber.trim()) {
      alert('Phone number and tracking number are required')
      return
    }
  
    try {
      const submissionData = {
        trackingNumber: cargoData.value.trackingNumber.trim(),
        cargo: {
          nickname: cargoData.value.nickname,
          cargoType: cargoData.value.cargoType,
          currentStatus: cargoData.value.currentStatus,
          price: cargoData.value.price,
          preRegisteredDate: cargoData.value.preRegisteredDate,
          receivedAtErenhotDate: cargoData.value.receivedAtErenhotDate,
          inTransitDate: cargoData.value.inTransitDate,
          deliveredToUBDate: cargoData.value.deliveredToUBDate,
          deliveredDate: cargoData.value.deliveredDate
        },
        user: {
          phoneNumber: phoneNumber.value.trim(),
          name: userData.value.name
        }
      }
  
      await $fetch('/api/cargo/save', {
        method: 'POST',
        body: submissionData
      })

      clearCargoForm()
      await searchUser()
    } catch (error) {
      console.error('Error saving cargo:', error)
      alert('Error saving cargo information')
    }
  }
  
  function clearCargoForm() {
    cargoData.value.trackingNumber = ''
    cargoData.value.price = null
  }
  
  function clearUserDataAll() {
    phoneNumber.value = ''
    userData.value = {
      phoneNumber: '',
      name: ''
    }
    isExistingUser.value = false
    userCargos.value = []
    userCargosName.value = ''
    userCargosMessage.value = ''
  }
  
  async function editCargo(cargo) {
    cargoData.value = { ...cargo }
  }
  
  onUnmounted(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  })
</script>