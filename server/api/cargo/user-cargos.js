// pages/api/cargo/user-cargos.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phoneNumber } = body

  try {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        cargos: true
      }
    })

    return {
      cargos: user?.cargos || []
    }
  } catch (error) {
    console.error('Error fetching user cargos:', error)
    throw createError({
      statusCode: 500,
      message: 'Error fetching user cargos'
    })
  }
})