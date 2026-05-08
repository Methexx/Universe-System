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
        phone_number: true,
        gender: true,
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
        phone_number: true,
        gender: true,
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
        requested_role: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      where: { role: { not: 'pending' } },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        is_suspended: true,
        created_at: true,
        avatar_url: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  static async getTeachers() {
    return prisma.user.findMany({
      where: { role: 'teacher' },
      select: {
        id: true,
        full_name: true,
        email: true,
        user_id_no: true,
        gender: true,
        phone_number: true,
        avatar_url: true,
        is_active: true,
        is_suspended: true,
        classes_taught: {
          select: {
            id: true,
            name: true,
            school_grade: { select: { id: true, name: true } },
          }
        },
      },
      orderBy: { full_name: 'asc' }
    });
  }

  static async promoteUser(targetUserId: string, role: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!user) throw new Error('User not found');
    if (user.role === 'admin') {
      throw new Error('Cannot change the role of an existing admin this way');
    }

    let user_id_no: string | undefined;
    if (role === 'teacher' && !user.user_id_no) {
      const existing = await prisma.user.findMany({
        where: { user_id_no: { startsWith: 'T-' } },
        select: { user_id_no: true },
      });
      const maxNum = existing.reduce((max, u) => {
        const n = parseInt(u.user_id_no?.replace('T-', '') ?? '0', 10);
        return n > max ? n : max;
      }, 0);
      user_id_no = `T-${String(maxNum + 1).padStart(4, '0')}`;
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role, requested_role: null, ...(user_id_no ? { user_id_no } : {}) },
      select: {
        id: true,
        email: true,
        role: true,
        full_name: true,
        user_id_no: true,
      }
    });

    return updated;
  }

  static async suspendUser(targetUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new Error('User not found');
    if (user.role === 'admin') throw new Error('Cannot suspend an admin account');
    return prisma.user.update({
      where: { id: targetUserId },
      data: { is_suspended: true, is_active: false },
      select: { id: true, email: true, is_suspended: true }
    });
  }

  static async unsuspendUser(targetUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new Error('User not found');
    return prisma.user.update({
      where: { id: targetUserId },
      data: { is_suspended: false, is_active: true },
      select: { id: true, email: true, is_suspended: true }
    });
  }

  static async deleteUser(targetUserId: string, actingUserId?: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new Error('User not found');
    
    // Only block if trying to delete an admin and it's NOT yourself
    if (user.role === 'admin' && actingUserId !== targetUserId) {
      throw new Error('Cannot delete an admin account');
    }

    return prisma.$transaction(async (tx) => {
      // Nullify optional FK references that don't cascade
      await tx.complaint.updateMany({
        where: { assigned_to_id: targetUserId },
        data: { assigned_to_id: null },
      });
      await tx.complaint.updateMany({
        where: { resolved_by_id: targetUserId },
        data: { resolved_by_id: null },
      });
      await tx.gateEvent.updateMany({
        where: { scanned_by_id: targetUserId },
        data: { scanned_by_id: null },
      });
      await tx.attendanceRecord.updateMany({
        where: { marked_by_id: targetUserId },
        data: { marked_by_id: null },
      });
      // Now delete the user (cascade handles the rest)
      return tx.user.delete({
        where: { id: targetUserId },
        select: { id: true, email: true }
      });
    });
  }
}
