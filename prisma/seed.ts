import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear usuarios
  const user1 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: await bcrypt.hash('password123', 10),
      career: 'Ingeniería en Sistemas',
      skills: 'JavaScript,React,Node.js',
      interests: 'Desarrollo Web,Inteligencia Artificial',
      portfolioLink: 'https://github.com/juanperez'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria@example.com',
      password: await bcrypt.hash('password123', 10),
      career: 'Ingeniería en Software',
      skills: 'Python,Java,SQL',
      interests: 'Desarrollo Móvil,Cloud Computing',
      portfolioLink: 'https://github.com/mariagarcia'
    }
  });

  // Crear proyectos
  const project1 = await prisma.project.create({
    data: {
      title: 'Plataforma de Aprendizaje Online',
      description: 'Desarrollo de una plataforma educativa interactiva',
      objectives: 'Crear una plataforma que facilite el aprendizaje online',
      requiredSkills: 'React,Node.js,MongoDB',
      areaTheme: 'Educación',
      status: 'BUSCANDO_COLABORADORES',
      creatorId: user1.id
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'App de Gestión de Tareas',
      description: 'Aplicación móvil para gestión de tareas y proyectos',
      objectives: 'Desarrollar una app intuitiva para gestión de tareas',
      requiredSkills: 'Flutter,Dart,Firebase',
      areaTheme: 'Productividad',
      status: 'EN_DESARROLLO',
      creatorId: user2.id
    }
  });

  // Crear solicitudes de colaboración
  await prisma.collaborationRequest.create({
    data: {
      message: 'Me interesa colaborar en el proyecto. Tengo experiencia en React y Node.js',
      status: 'PENDIENTE',
      projectId: project1.id,
      applicantId: user2.id
    }
  });

  await prisma.collaborationRequest.create({
    data: {
      message: 'Me gustaría participar en el desarrollo de la app',
      status: 'PENDIENTE',
      projectId: project2.id,
      applicantId: user1.id
    }
  });

  console.log('Datos de prueba creados exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 