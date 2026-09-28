import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@petshop.com'
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.create({
      data: {
        name: 'Admin Geral',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Administrador criado com sucesso: admin@petshop.com / admin123')
  } else {
    console.log('⚠️ Administrador já existe no banco.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
