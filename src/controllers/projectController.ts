import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, objectives, requiredSkills, areaTheme, status } = req.body;
    const creatorId = (req as any).user.id;
    try {
        if (!title || !description || !objectives) {
            return res.status(400).json({ message: 'Título, descripción y objetivos son requeridos.' });
        }
        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                objectives,
                requiredSkills: requiredSkills || '',
                areaTheme,
                status,
                creatorId,
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        res.status(201).json({ message: 'Proyecto creado exitosamente.', data: newProject });
    } catch (error) {
        console.error('Error en createProject:', error);
        next(error);
    }
};

export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
    const { areaTheme, skills, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    try {
        const whereClause: any = {};
        if (areaTheme) {
            whereClause.areaTheme = { contains: areaTheme as string};
        }
        if (skills) {
            const skillsArray = typeof skills === 'string' ? (skills as string).split(',') : [];
            if (skillsArray.length > 0) {
                whereClause.OR = skillsArray.map((skill: string) => ({
                    requiredSkills: { contains: skill.trim() }
                }));
            }
        }
        console.log('whereClause:', JSON.stringify(whereClause, null, 2));
        const projects = await prisma.project.findMany({
            where: whereClause,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: { select: { id: true, name: true, email: true } }
            }
        });
        const totalProjects = await prisma.project.count({ where: whereClause });
        res.status(200).json({
            message: 'Lista de proyectos obtenida.',
            data: projects,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalProjects / limitNum),
                totalItems: totalProjects,
                itemsPerPage: limitNum
            }
        });
    } catch (error: any) {
        console.error('Error en getAllProjects:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    const projectId = parseInt(req.params.id, 10);
    try {
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'ID de proyecto inválido.' });
        }
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                collaborators: { select: { id: true, name: true, email: true } }
            }
        });
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        res.status(200).json({ message: 'Detalle del proyecto obtenido.', data: project });
    } catch (error) {
        console.error('Error en getProjectById:', error);
        next(error);
    }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    const projectId = parseInt(req.params.id, 10);
    const userId = (req as any).user.id;
    const { title, description, objectives, requiredSkills, areaTheme, status } = req.body;
    try {
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'ID de proyecto inválido.' });
        }
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        if (project.creatorId !== userId) {
            return res.status(403).json({ message: 'No autorizado para actualizar este proyecto.' });
        }
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title,
                description,
                objectives,
                requiredSkills: requiredSkills || '',
                areaTheme,
                status,
            },
            include: {
                creator: { select: { id: true, name: true, email: true } }
            }
        });
        res.status(200).json({ message: 'Proyecto actualizado exitosamente.', data: updatedProject });
    } catch (error) {
        console.error('Error en updateProject:', error);
        next(error);
    }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    const projectId = parseInt(req.params.id, 10);
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
            return res.status(403).json({ message: 'No autorizado para eliminar este proyecto.' });
        }
        await prisma.project.delete({ where: { id: projectId } });
        res.status(200).json({ message: 'Proyecto eliminado exitosamente.' });
    } catch (error) {
        console.error('Error en deleteProject:', error);
        next(error);
    }
};

export const getMyProjects = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    try {
        const projects = await prisma.project.findMany({
            where: { creatorId: userId },
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: { select: { id: true, name: true, email: true } }
            }
        });

        // Para cada proyecto, contar las solicitudes (collaborationRequest)
        const projectsWithApplications = await Promise.all(
          projects.map(async (project) => {
            const applicationsCount = await prisma.collaborationRequest.count({
              where: { projectId: project.id }
            });
            return { ...project, applicationsCount };
          })
        );

        const totalProjects = await prisma.project.count({ where: { creatorId: userId } });
        res.status(200).json({
            message: 'Mis proyectos obtenidos.',
            data: projectsWithApplications,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalProjects / limitNum),
                totalItems: totalProjects,
                itemsPerPage: limitNum
            }
        });
    } catch (error) {
        console.error('Error en getMyProjects:', error);
        next(error);
    }
}; 