
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN' // Ensure role is ADMIN
    },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log({ admin })

  // Create Sample Tractor Model
  const tractor = await prisma.tractorModel.upsert({
    where: { name: 'Tractor Model X' },
    update: {},
    create: {
      name: 'Tractor Model X',
      gearRatio: 1.5177
    }
  })

  console.log({ tractor })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
