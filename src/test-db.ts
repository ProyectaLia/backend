import prisma from './lib/prisma';

async function testDatabase() {
  try {
    // Consultar usuarios
    const users = await prisma.user.findMany();
    console.log('Usuarios en la base de datos:', users);

    // Consultar proyectos
    const projects = await prisma.project.findMany();
    console.log('Proyectos en la base de datos:', projects);

    // Consultar solicitudes
    const requests = await prisma.collaborationRequest.findMany();
    console.log('Solicitudes en la base de datos:', requests);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 