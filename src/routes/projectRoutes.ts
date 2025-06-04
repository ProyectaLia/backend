import express from 'express';
import * as projectController from '../controllers/projectController';
import authMiddleware from '../middlewares/authMiddleware';
// import { authMiddleware } from '../middlewares/authMiddleware';
// import * as requestController from '../controllers/requestController';

const router = express.Router();

router.post('/', authMiddleware, projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/my-projects', authMiddleware, projectController.getMyProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', authMiddleware, projectController.updateProject);
router.delete('/:id', authMiddleware, projectController.deleteProject);

// Rutas anidadas para requests (alternativamente en requestRoutes.ts)
// router.post('/:projectId/requests', /* authMiddleware, */ requestController.createCollaborationRequest);
// router.get('/:projectId/requests', /* authMiddleware, */ requestController.getProjectCollaborationRequests);

export default router; 