// server/api/cargo/save.post.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { trackingNumber, cargo, user } = body
  
  if (!trackingNumber) {
    throw createError({
      statusCode: 400,
      message: 'Tracking number is required'
    })
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // First, get the existing cargo to preserve user association and price
      const existingCargo = await tx.cargoTracking.findUnique({
        where: { trackingNumber }
      })
      
      let userId = existingCargo?.userId || null

      if (user?.phoneNumber) {
        const dbUser = await tx.user.findUnique({
          where: { phoneNumber: user.phoneNumber }
        })
       
        if (dbUser) {
          userId = dbUser.id
        } else {
          const newUser = await tx.user.create({
            data: {
              phoneNumber: user.phoneNumber,
              name: user.name || null,
              userType: 'TEMPORARY'
            }
          })
          userId = newUser.id
        }
      }

      // Prepare update data
      const updateData = {
        currentStatus: cargo.currentStatus,
        preRegisteredDate: cargo.preRegisteredDate,
        receivedAtErenhotDate: cargo.receivedAtErenhotDate,
        inTransitDate: cargo.inTransitDate,
        deliveredToUBDate: cargo.deliveredToUBDate,
        deliveredDate: cargo.deliveredDate
      }

      // Only update price if it's explicitly provided or if there's no existing price
      if (cargo.price !== undefined) {
        updateData.price = Number(cargo.price)
      } else if (existingCargo) {
        // Preserve existing price
        updateData.price = existingCargo.price
      } else {
        updateData.price = null
      }

      // Only include optional fields if they're provided or it's a new entry
      if (!existingCargo || cargo.nickname !== undefined) {
        updateData.nickname = cargo.nickname
      }
      if (!existingCargo || cargo.cargoType !== undefined) {
        updateData.cargoType = cargo.cargoType
      }
     
      // Always preserve existing userId unless new user data is provided
      updateData.userId = userId

      // Create or update cargo
      const dbCargo = await tx.cargoTracking.upsert({
        where: { trackingNumber },
        update: updateData,
        create: {
          trackingNumber: trackingNumber.trim(),
          ...updateData,
          cargoType: cargo.cargoType || 'NORMAL'
        }
      })
      return dbCargo
    })
  } catch (error) {
    console.error('Error saving cargo:', error)
    throw createError({
      statusCode: 500,
      message: 'Error saving cargo information'
    })
  }
})