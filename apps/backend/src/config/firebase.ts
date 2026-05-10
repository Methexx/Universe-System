import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase() {
  if (firebaseApp) return firebaseApp;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!serviceAccountKey || !projectId) {
    console.warn('Firebase not configured: FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID missing');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }

  return firebaseApp;
}

export function getFirebaseApp(): admin.app.App | null {
  return firebaseApp;
}

export async function sendFcmNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const app = initializeFirebase();
    if (!app) {
      console.warn('Firebase not initialized, skipping push notification');
      return null;
    }

    const message: admin.messaging.Message = {
      notification: { title, body },
      data,
      token,
      android: {
        priority: 'high',
        notification: {
          channelId: 'high_importance_channel',
          priority: 'max',
          defaultSound: true,
        },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1, contentAvailable: true },
        },
        headers: { 'apns-priority': '10' },
      },
    };

    const response = await admin.messaging(app).send(message);
    console.log('FCM message sent:', response);
    return response;
  } catch (error) {
    console.error('Failed to send FCM notification:', error);
    throw error;
  }
}

export async function sendMulticastFcmNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const app = initializeFirebase();
    if (!app) {
      console.warn('Firebase not initialized, skipping push notification');
      return null;
    }

    const message: admin.messaging.MulticastMessage = {
      notification: { title, body },
      data,
      tokens,
      android: {
        priority: 'high',
        notification: {
          channelId: 'high_importance_channel',
          priority: 'max',
          defaultSound: true,
        },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1, contentAvailable: true },
        },
        headers: { 'apns-priority': '10' },
      },
    };

    const response = await (admin.messaging(app) as any).sendMulticast(message);
    console.log('FCM multicast sent:', {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
    return response;
  } catch (error) {
    console.error('Failed to send multicast FCM notification:', error);
    throw error;
  }
}
