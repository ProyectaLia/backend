import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('🧪 Iniciando pruebas de la API...\n');

    // 1. Probar registro de usuario
    console.log('1. Probando registro de usuario...');
    const registerResponse = await axios.post(`${API_URL}/users/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      career: 'Ingeniería en Sistemas',
      skills: 'JavaScript,React,Node.js',
      interests: 'Desarrollo Web,Inteligencia Artificial',
      portfolioLink: 'https://github.com/testuser'
    });
    console.log('✅ Registro exitoso:', registerResponse.data, '\n');

    // 2. Probar login
    console.log('2. Probando login...');
    const loginResponse = await axios.post(`${API_URL}/users/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login exitoso:', loginResponse.data, '\n');

    // 3. Probar creación de proyecto
    console.log('3. Probando creación de proyecto...');
    const projectResponse = await axios.post(`${API_URL}/projects`, {
      title: 'Proyecto de Prueba',
      description: 'Este es un proyecto de prueba',
      objectives: 'Probar la API',
      requiredSkills: 'TypeScript,Node.js',
      areaTheme: 'Desarrollo Web'
    });
    console.log('✅ Proyecto creado:', projectResponse.data, '\n');

    // 4. Probar obtención de proyectos
    console.log('4. Probando obtención de proyectos...');
    const projectsResponse = await axios.get(`${API_URL}/projects`);
    console.log('✅ Proyectos obtenidos:', projectsResponse.data, '\n');

    // 5. Probar creación de solicitud de colaboración
    console.log('5. Probando creación de solicitud de colaboración...');
    const requestResponse = await axios.post(`${API_URL}/requests/project/1`, {
      message: 'Me interesa colaborar en este proyecto'
    });
    console.log('✅ Solicitud creada:', requestResponse.data, '\n');

    // 6. Probar obtención de solicitudes
    console.log('6. Probando obtención de solicitudes...');
    const requestsResponse = await axios.get(`${API_URL}/requests/project/1/solicitudes`);
    console.log('✅ Solicitudes obtenidas:', requestsResponse.data, '\n');

  } catch (error: any) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Iniciar el servidor antes de ejecutar las pruebas
import { spawn } from 'child_process';
import { join } from 'path';

// Iniciar el servidor
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Esperar 5 segundos para que el servidor inicie
setTimeout(async () => {
  console.log('🚀 Iniciando pruebas...');
  await testAPI();
  server.kill();
  process.exit(0);
}, 5000); 