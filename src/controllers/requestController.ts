import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const createCollaborationRequest = async (req: Request, res: Response, next: NextFunction) => {
    const applicantId = (req as any).user.id;
    const projectId = parseInt(req.params.projectId, 10);
    const { message } = req.body;
    try {
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'ID de proyecto inválido.' });
        }
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        if (project.status !== 'BUSCANDO_COLABORADORES') {
            return res.status(400).json({ message: 'Este proyecto no está aceptando solicitudes actualmente.' });
        }
        if (project.creatorId === applicantId) {
            return res.status(400).json({ message: 'No puedes postularte a tu propio proyecto.' });
        }
        const existingRequest = await prisma.collaborationRequest.findFirst({
            where: {
                projectId,
                applicantId,
                status: { in: ['PENDIENTE', 'ACEPTADA'] },
            },
        });
        if (existingRequest) {
            return res.status(409).json({ message: 'Ya tienes una solicitud pendiente o aceptada para este proyecto.' });
        }
        const newRequest = await prisma.collaborationRequest.create({
            data: {
                message,
                projectId,
                applicantId,
            },
            include: {
                project: { select: { title: true } },
                applicant: { select: { name: true, email: true } }
            }
        });
        res.status(201).json({ message: 'Solicitud de colaboración enviada exitosamente.', data: newRequest });
    } catch (error) {
        console.error('Error en createCollaborationRequest:', error);
        next(error);
    }
};

export const getProjectCollaborationRequests = async (req: Request, res: Response, next: NextFunction) => {
    const projectId = parseInt(req.params.projectId, 10);
    const userId = (req as any).user.id;
    try {
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'ID de proyecto inválido.' });
        }
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        if (project.creatorId !== userId) {
            return res.status(403).json({ message: 'No autorizado para ver las solicitudes de este proyecto.' });
        }
        const requests = await prisma.collaborationRequest.findMany({
            where: { projectId },
            include: {
                applicant: { select: { id: true, name: true, email: true, skills: true, career: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ message: 'Solicitudes para el proyecto obtenidas.', data: requests });
    } catch (error) {
        console.error('Error en getProjectCollaborationRequests:', error);
        next(error);
    }
};

export const updateCollaborationRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
    const requestId = parseInt(req.params.requestId, 10);
    const { status } = req.body;
    const userId = (req as any).user.id;
    try {
        if (isNaN(requestId)) {
            return res.status(400).json({ message: 'ID de solicitud inválido.' });
        }
        if (!status || !['ACEPTADA', 'RECHAZADA'].includes(status.toUpperCase())) {
            return res.status(400).json({ message: "Estado inválido. Debe ser 'ACEPTADA' o 'RECHAZADA'." });
        }
        const validStatus = status.toUpperCase();
        const collaborationRequest = await prisma.collaborationRequest.findUnique({
            where: { id: requestId },
            include: { project: true }
        });
        if (!collaborationRequest) {
            return res.status(404).json({ message: 'Solicitud no encontrada.' });
        }
        if (collaborationRequest.project.creatorId !== userId) {
            return res.status(403).json({ message: 'No autorizado para modificar esta solicitud.' });
        }
        const updatedRequest = await prisma.collaborationRequest.update({
            where: { id: requestId },
            data: { status: validStatus },
        });
        if (validStatus === 'ACEPTADA') {
            try {
                await prisma.project.update({
                    where: { id: collaborationRequest.projectId },
                    data: {
                        collaborators: {
                            connect: { id: collaborationRequest.applicantId }
                        }
                    }
                });
            } catch (err: any) {
                // Si ya es colaborador, ignorar el error
                if (err.code !== 'P2002') {
                    console.error('Error al conectar colaborador:', err);
                    return res.status(409).json({ message: 'El usuario ya es colaborador o la solicitud no pudo ser procesada.' });
                }
            }
        }
        res.status(200).json({ message: 'Estado de la solicitud actualizado exitosamente.', data: updatedRequest });
    } catch (error: any) {
        console.error('Error en updateCollaborationRequestStatus:', error);
        if (error.code === 'P2016' || error.code === 'P2025') {
            return res.status(409).json({ message: 'El usuario ya es colaborador o la solicitud no pudo ser procesada.' });
        }
        next(error);
    }
};

export const getMySentCollaborationRequests = async (req: Request, res: Response, next: NextFunction) => {
    const applicantId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    try {
        const requests = await prisma.collaborationRequest.findMany({
            where: { applicantId },
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    select: { id: true, title: true, status: true, areaTheme: true, creator: { select: { name: true } } }
                }
            }
        });
        const totalRequests = await prisma.collaborationRequest.count({ where: { applicantId } });
        res.status(200).json({
            message: 'Mis solicitudes enviadas obtenidas.',
            data: requests,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalRequests / limitNum),
                totalItems: totalRequests,
                itemsPerPage: limitNum
            }
        });
    } catch (error) {
        console.error('Error en getMySentCollaborationRequests:', error);
        next(error);
    }
}; 