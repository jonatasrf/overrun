
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const tractors = await prisma.tractorModel.findMany()
    console.log('Tractors found:', tractors.length)
    console.log(JSON.stringify(tractors, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
