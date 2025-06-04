import express from 'express';
import * as requestController from '../controllers/requestController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/project/:projectId', authMiddleware, requestController.createCollaborationRequest);
router.get('/project/:projectId/solicitudes', authMiddleware, requestController.getProjectCollaborationRequests);
router.put('/:requestId/status', authMiddleware, requestController.updateCollaborationRequestStatus);
router.get('/my-applications', authMiddleware, requestController.getMySentCollaborationRequests);

export default router; 