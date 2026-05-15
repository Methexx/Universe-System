import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import {
  createItemSchema,
  createReportSchema,
  updateStatusSchema,
  updateReportStatusSchema,
  getItemsSchema,
  getReportsSchema,
  createCommentSchema
} from './lost-found.schema';
import { delCacheByPattern, getOrSetCache } from '../../common/utils/cache';

// ===== FOUND ITEMS (Teacher/Admin posts) =====

export const postItem = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = createItemSchema.parse(request.body);
    const user = (request as any).user;

    // Only teacher and admin can post items
    if (!['teacher', 'admin'].includes(user.role)) {
      return reply.status(403).send({ success: false, message: 'Only teachers and admins can post items' });
    }

    const item = await prisma.lostFoundItem.create({
      data: {
        item_name: data.item_name,
        description: data.description,
        photo_url: data.photo_url,
        found_at: data.found_at,
        found_date: new Date(data.found_date),
        posted_by: user.userId
      },
      include: {
        poster: { select: { id: true, full_name: true, role: true, avatar_url: true } }
      }
    });

    await delCacheByPattern('lost_found_items:*');

    return reply.status(201).send({
      success: true,
      message: 'Item posted successfully',
      data: item
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    console.error('LOST_FOUND POST ITEM ERROR:', error);
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to post item' });
  }
};

export const getItems = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = getItemsSchema.parse(request.query);
    const user = (request as any).user;

    const skip = (query.page - 1) * query.limit;
    const whereClause: any = { status: query.status || 'unclaimed' };

    const cacheKey = `lost_found_items:${query.status || 'unclaimed'}:${query.page}:${query.limit}`;
    const cachedPayload = await getOrSetCache(cacheKey, async () => {
      const items = await prisma.lostFoundItem.findMany({
        where: whereClause,
        include: {
          poster: { select: { id: true, full_name: true, role: true, avatar_url: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: query.limit
      });

      const total = await prisma.lostFoundItem.count({ where: whereClause });
      return { items, total };
    });

    return reply.status(200).send({
      success: true,
      data: cachedPayload.items,
      meta: {
        total: cachedPayload.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(cachedPayload.total / query.limit)
      }
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to fetch items' });
  }
};

export const markCollected = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const data = updateStatusSchema.parse(request.body);
    const user = (request as any).user;

    const item = await prisma.lostFoundItem.findUnique({ where: { id } });

    if (!item) {
      return reply.status(404).send({ success: false, message: 'Item not found' });
    }

    // Only admin or original poster can mark as collected
    if (user.role !== 'admin' && item.posted_by !== user.userId) {
      return reply.status(403).send({ success: false, message: 'Forbidden' });
    }

    const updated = await prisma.lostFoundItem.update({
      where: { id },
      data: {
        status: data.status,
        collected_at: data.status === 'collected' ? new Date() : null
      },
      include: {
        poster: { select: { id: true, full_name: true, role: true, avatar_url: true } }
      }
    });

    await delCacheByPattern('lost_found_items:*');

    return reply.status(200).send({
      success: true,
      message: 'Item status updated',
      data: updated
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to update item' });
  }
};

export const deleteItem = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const item = await prisma.lostFoundItem.findUnique({ where: { id } });

    if (!item) {
      return reply.status(404).send({ success: false, message: 'Item not found' });
    }

    // Only admin can delete
    if (user.role !== 'admin') {
      return reply.status(403).send({ success: false, message: 'Only admins can delete items' });
    }

    await prisma.lostFoundItem.delete({ where: { id } });
    await delCacheByPattern('lost_found_items:*');

    return reply.status(200).send({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to delete item' });
  }
};

// ===== LOST REPORTS (Parents file) =====

export const postReport = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = createReportSchema.parse(request.body);
    const user = (request as any).user;

    // Only parents can file reports
    if (user.role !== 'parent') {
      return reply.status(403).send({ success: false, message: 'Only parents can file lost reports' });
    }

    const report = await prisma.lostFoundReport.create({
      data: {
        item_name: data.item_name,
        description: data.description,
        photo_url: data.photo_url,
        date_lost: data.date_lost ? new Date(data.date_lost) : null,
        parent_id: user.userId,
        student_id: data.student_id
      },
      include: {
        parent: { select: { id: true, full_name: true, avatar_url: true } },
        student: { select: { id: true, full_name: true, student_id_no: true } }
      }
    });

    await delCacheByPattern('lost_found_reports:*');

    return reply.status(201).send({
      success: true,
      message: 'Report filed successfully',
      data: report
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    console.error('LOST_FOUND POST REPORT ERROR:', error);
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to file report' });
  }
};

export const getMyReports = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = getReportsSchema.parse(request.query);
    const user = (request as any).user;

    const skip = (query.page - 1) * query.limit;
    const whereClause: any = { parent_id: user.userId };

    if (query.status) {
      whereClause.status = query.status;
    }

    const cacheKey = `lost_found_reports:${user.userId}:${query.status || 'all'}:${query.page}:${query.limit}`;
    const cachedPayload = await getOrSetCache(cacheKey, async () => {
      const reports = await prisma.lostFoundReport.findMany({
        where: whereClause,
        include: {
          parent: { select: { id: true, full_name: true, avatar_url: true } },
          student: { select: { id: true, full_name: true, student_id_no: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: query.limit
      });

      const total = await prisma.lostFoundReport.count({ where: whereClause });
      return { reports, total };
    });

    return reply.status(200).send({
      success: true,
      data: cachedPayload.reports,
      meta: {
        total: cachedPayload.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(cachedPayload.total / query.limit)
      }
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to fetch reports' });
  }
};

export const markRecovered = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const data = updateReportStatusSchema.parse(request.body);
    const user = (request as any).user;

    const report = await prisma.lostFoundReport.findUnique({ where: { id } });

    if (!report) {
      return reply.status(404).send({ success: false, message: 'Report not found' });
    }

    // Only the parent who filed the report can update it
    if (report.parent_id !== user.userId) {
      return reply.status(403).send({ success: false, message: 'Forbidden' });
    }

    const updated = await prisma.lostFoundReport.update({
      where: { id },
      data: { status: data.status },
      include: {
        parent: { select: { id: true, full_name: true, avatar_url: true } },
        student: { select: { id: true, full_name: true, student_id_no: true } }
      }
    });

    await delCacheByPattern(`lost_found_reports:${user.userId}:*`);

    return reply.status(200).send({
      success: true,
      message: 'Report status updated',
      data: updated
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to update report' });
  }
};

export const getAllReports = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = getReportsSchema.parse(request.query);
    const user = (request as any).user;

    // Only admin can view all reports
    if (user.role !== 'admin') {
      return reply.status(403).send({ success: false, message: 'Only admins can view all reports' });
    }

    const skip = (query.page - 1) * query.limit;
    const whereClause: any = {};

    if (query.status) {
      whereClause.status = query.status;
    }

    const cacheKey = `lost_found_reports:admin:${query.status || 'all'}:${query.page}:${query.limit}`;
    const cachedPayload = await getOrSetCache(cacheKey, async () => {
      const reports = await prisma.lostFoundReport.findMany({
        where: whereClause,
        include: {
          parent: { select: { id: true, full_name: true, avatar_url: true } },
          student: { select: { id: true, full_name: true, student_id_no: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: query.limit
      });

      const total = await prisma.lostFoundReport.count({ where: whereClause });
      return { reports, total };
    });

    return reply.status(200).send({
      success: true,
      data: cachedPayload.reports,
      meta: {
        total: cachedPayload.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(cachedPayload.total / query.limit)
      }
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to fetch reports' });
  }
};

export const getCommunityBoard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = getItemsSchema.parse(request.query); // Reusing getItemsSchema for pagination
    const skip = (query.page - 1) * query.limit;

    // Fetch Found Items (unclaimed)
    const foundItems = await prisma.lostFoundItem.findMany({
      where: { status: 'unclaimed' },
      include: {
        poster: { select: { id: true, full_name: true, role: true, avatar_url: true } },
        comments: {
          include: { author: { select: { id: true, full_name: true, role: true, avatar_url: true } } },
          orderBy: { created_at: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' },
      take: query.limit
    });

    // Fetch Lost Reports (open)
    const lostReports = await prisma.lostFoundReport.findMany({
      where: { status: 'open' },
      include: {
        parent: { select: { id: true, full_name: true, avatar_url: true } },
        student: { select: { id: true, full_name: true, student_id_no: true } },
        comments: {
          include: { author: { select: { id: true, full_name: true, role: true, avatar_url: true } } },
          orderBy: { created_at: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' },
      take: query.limit
    });

    // Map to a unified structure
    const boardPosts = [
      ...foundItems.map(item => ({
        id: item.id,
        type: 'found',
        title: item.item_name,
        description: item.description,
        location: item.found_at,
        timeAgo: item.created_at,
        status: item.status,
        authorName: item.poster.full_name || 'Staff',
        role: item.poster.role,
        classOrDept: item.poster.role === 'teacher' ? 'Staff' : 'Administration',
        photo_url: item.photo_url,
        comments: item.comments.map(c => ({
          authorName: c.author.full_name,
          role: c.author.role,
          classOrDept: c.author.role === 'teacher' ? 'Staff' : 'Administration',
          text: c.content,
          timeAgo: c.created_at
        }))
      })),
      ...lostReports.map(report => ({
        id: report.id,
        type: 'lost',
        title: `LOST: ${report.item_name}`,
        description: report.description,
        location: 'Unknown',
        timeAgo: report.created_at,
        status: report.status,
        authorName: report.parent.full_name || 'Parent',
        role: 'parent',
        classOrDept: `Parent · Student: ${report.student.full_name}`,
        photo_url: report.photo_url,
        comments: report.comments.map(c => ({
          authorName: c.author.full_name,
          role: c.author.role,
          classOrDept: c.author.role === 'parent' ? 'Parent' : 'Staff',
          text: c.content,
          timeAgo: c.created_at
        }))
      }))
    ].sort((a, b) => new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime());

    return reply.status(200).send({
      success: true,
      data: boardPosts.slice(0, query.limit),
    });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to fetch community board' });
  }
};

export const postComment = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = createCommentSchema.parse(request.body);
    const user = (request as any).user;

    const comment = await prisma.lostFoundComment.create({
      data: {
        content: data.content,
        author_id: user.userId,
        item_id: data.item_id,
        report_id: data.report_id
      },
      include: {
        author: { select: { id: true, full_name: true, role: true, avatar_url: true } }
      }
    });

    return reply.status(201).send({
      success: true,
      message: 'Comment posted successfully',
      data: comment
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to post comment' });
  }
};
