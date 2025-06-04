import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, career, skills, interests, portfolioLink } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                career,
                skills,
                interests,
                portfolioLink,
            },
        });
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );
        const { password: _, ...userResponse } = user;
        res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            token,
            data: userResponse
        });
    } catch (error) {
        console.error('Error en registerUser:', error);
        next(error);
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas (usuario no encontrado).' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas (contraseña incorrecta).' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );
        const { password: _, ...userResponse } = user;
        res.status(200).json({
            message: 'Login exitoso.',
            token,
            data: userResponse
        });
    } catch (error) {
        console.error('Error en loginUser:', error);
        next(error);
    }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                career: true,
                skills: true,
                interests: true,
                portfolioLink: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ message: 'Perfil de usuario obtenido.', data: user });
    } catch (error) {
        console.error('Error en getUserProfile:', error);
        next(error);
    }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { name, career, skills, interests, portfolioLink } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                career,
                skills,
                interests,
                portfolioLink,
            },
            select: {
                id: true,
                name: true,
                email: true,
                career: true,
                skills: true,
                interests: true,
                portfolioLink: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(200).json({ message: 'Perfil actualizado exitosamente.', data: updatedUser });
    } catch (error) {
        console.error('Error en updateUserProfile:', error);
        next(error);
    }
}; 