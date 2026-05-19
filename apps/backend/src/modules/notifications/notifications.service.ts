import { prisma } from '../../config/prisma';
import { sendFcmNotification, sendMulticastFcmNotification } from '../../config/firebase';

export type NotifType = 'gate' | 'message' | 'announcement' | 'attendance' | 'result';

export interface NotifPayload {
  type: NotifType;
  title: string;
  body: string;
  /** Deep-link / metadata payload. All values must be strings (FCM requirement). */
  data?: Record<string, string>;
}

interface NotifSettings {
  pushNotifications: boolean;
  attendanceAlerts: boolean;
  examAlerts: boolean;
  generalAnnouncements: boolean;
}

/**
 * Maps a notification type to the UserSettings flag that gates its PUSH.
 * `null` means only the global `pushNotifications` toggle applies.
 * The in-app notification row is ALWAYS stored regardless of settings —
 * toggles only suppress the push, never the record.
 */
const PUSH_TOGGLE: Record<NotifType, keyof NotifSettings | null> = {
  gate: null,
  message: null,
  announcement: 'generalAnnouncements',
  attendance: 'attendanceAlerts',
  result: 'examAlerts',
};

function pushAllowed(type: NotifType, settings: NotifSettings | null): boolean {
  if (!settings) return true; // no settings row → all defaults are on
  if (!settings.pushNotifications) return false;
  const toggle = PUSH_TOGGLE[type];
  if (toggle && settings[toggle] === false) return false;
  return true;
}

const SETTINGS_SELECT = {
  pushNotifications: true,
  attendanceAlerts: true,
  examAlerts: true,
  generalAnnouncements: true,
} as const;

/**
 * Persists an in-app notification for a single user and sends an FCM push
 * (push gated by the user's settings). Never throws — failures are logged so
 * the calling event handler is never blocked.
 */
export async function notifyUser(recipientId: string, payload: NotifPayload): Promise<void> {
  if (!recipientId) return;

  let notificationId: string | undefined;
  try {
    const record = await prisma.notification.create({
      data: {
        recipient_id: recipientId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? undefined,
      },
      select: { id: true },
    });
    notificationId = record.id;
  } catch (err) {
    console.error('[notifications] failed to persist notification:', err);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { fcm_token: true, settings: { select: SETTINGS_SELECT } },
    });
    if (user?.fcm_token && pushAllowed(payload.type, user.settings)) {
      await sendFcmNotification(user.fcm_token, payload.title, payload.body, {
        type: payload.type,
        ...(notificationId ? { notificationId } : {}),
        ...(payload.data ?? {}),
      });
    }
  } catch (err) {
    console.error('[notifications] failed to send push:', err);
  }
}

/**
 * Persists in-app notifications for many users and sends a multicast FCM push
 * (per-user push gated by settings). Never throws.
 */
export async function notifyUsers(recipientIds: string[], payload: NotifPayload): Promise<void> {
  const uniqueIds = [...new Set(recipientIds.filter(Boolean))];
  if (uniqueIds.length === 0) return;

  // createManyAndReturn gives us the IDs back so we can include them in FCM.
  // We build a map from recipientId → notificationId for the FCM step.
  const recipientToNotifId = new Map<string, string>();
  try {
    const records = await prisma.notification.createManyAndReturn({
      data: uniqueIds.map((id) => ({
        recipient_id: id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? undefined,
      })),
      select: { id: true, recipient_id: true },
    });
    for (const r of records) {
      recipientToNotifId.set(r.recipient_id, r.id);
    }
  } catch (err) {
    console.error('[notifications] failed to persist notifications:', err);
  }

  try {
    const users = await prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, fcm_token: true, settings: { select: SETTINGS_SELECT } },
    });
    const tokens = users
      .filter((u) => u.fcm_token && pushAllowed(payload.type, u.settings))
      .map((u) => u.fcm_token as string);
    if (tokens.length > 0) {
      // For multicast we cannot attach per-user notificationId, so we omit it.
      // Individual pushes (notifyUser) carry the notificationId.
      await sendMulticastFcmNotification(tokens, payload.title, payload.body, {
        type: payload.type,
        ...(payload.data ?? {}),
      });
    }
  } catch (err) {
    console.error('[notifications] failed to send multicast push:', err);
  }
}
