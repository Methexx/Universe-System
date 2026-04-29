import cron from 'node-cron';
import { prisma } from '../../config/prisma';

/**
 * Runs every day at 18:00 (6 PM server local time).
 * For every student who checked IN today but has no OUT event,
 * inserts a synthetic OUT event timestamped at exactly 18:00.
 * This keeps the attendance log clean and prevents "currently inside"
 * from carrying over stale counts into the next day.
 */
export function startGateScheduler() {
  cron.schedule('0 18 * * *', async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const checkoutTime = new Date();
      checkoutTime.setHours(18, 0, 0, 0);

      // Students who have an IN event today
      const checkedInToday = await prisma.gateEvent.findMany({
        where: { direction: 'IN', timestamp: { gte: todayStart } },
        distinct: ['student_id'],
        select: { student_id: true },
      });

      if (checkedInToday.length === 0) return;

      const studentIds = checkedInToday.map(e => e.student_id);

      // Among those, find which already have an OUT event today
      const alreadyCheckedOut = await prisma.gateEvent.findMany({
        where: {
          direction: 'OUT',
          timestamp: { gte: todayStart },
          student_id: { in: studentIds },
        },
        distinct: ['student_id'],
        select: { student_id: true },
      });

      const checkedOutSet = new Set(alreadyCheckedOut.map(e => e.student_id));
      const stillInside = studentIds.filter(id => !checkedOutSet.has(id));

      if (stillInside.length === 0) return;

      // Bulk-insert auto-checkout events
      await prisma.gateEvent.createMany({
        data: stillInside.map(student_id => ({
          student_id,
          scanned_by_id: null,
          direction: 'OUT',
          method: 'auto',
          manual_reason: 'Auto-checkout at 6 PM',
          timestamp: checkoutTime,
        })),
      });

      console.log(`[GateScheduler] Auto-checked out ${stillInside.length} student(s) at 6 PM.`);
    } catch (err) {
      console.error('[GateScheduler] Auto-checkout failed:', err);
    }
  });

  console.log('[GateScheduler] Auto-checkout job registered (runs daily at 18:00).');
}
