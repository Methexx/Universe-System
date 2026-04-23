import { prisma } from '../../config/prisma';
import { UpdateProfileInput, PromoteUserInput } from './users.schema';

export class UsersService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        full_name: true,
        avatar_url: true,
        is_active: true,
        created_at: true,
      }
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        role: true,
        full_name: true,
        avatar_url: true,
      }
    });
    return updated;
  }

  static async getPendingUsers() {
    return prisma.user.findMany({
      where: { role: 'pending' },
      select: {
        id: true,
        email: true,
        full_name: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  static async promoteUser(targetUserId: string, role: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    
    if (!user) throw new Error('User not found');
    if (user.role !== 'pending' && user.role === 'admin') {
         throw new Error('Cannot demote an existing admin this way');
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        full_name: true,
      }
    });

    return updated;
  }

  static async suspendUser(targetUserId: string) {
    return prisma.user.update({
      where: { id: targetUserId },
      data: { is_suspended: true, is_active: false },
      select: { id: true, email: true, is_suspended: true }
    });
  }

  static async unsuspendUser(targetUserId: string) {
    return prisma.user.update({
      where: { id: targetUserId },
      data: { is_suspended: false, is_active: true },
      select: { id: true, email: true, is_suspended: true }
    });
  }
}
