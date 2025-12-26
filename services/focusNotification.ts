import notifee, { AndroidImportance, AndroidCategory, EventType } from '@notifee/react-native';
import { AppState, Platform, AppStateStatus } from 'react-native';

const CHANNEL_ID = 'focus-timer';
const NOTIFICATION_ID = 'focus-session';

// Create notification channel (Android only)
async function createChannel() {
    if (Platform.OS === 'android') {
        await notifee.createChannel({
            id: CHANNEL_ID,
            name: 'Focus Timer',
            importance: AndroidImportance.LOW, // No sound
            vibration: false,
        });
    }
}

// Format seconds to HH:MM:SS
function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function showTimerNotification(elapsedSeconds: number, goalTitle?: string) {
    await createChannel();

    await notifee.displayNotification({
        id: NOTIFICATION_ID,
        title: '🔥 Focus Session Active',
        body: `${formatTime(elapsedSeconds)} ${goalTitle ? `• ${goalTitle.substring(0, 30)}` : ''}`,
        android: {
            channelId: CHANNEL_ID,
            category: AndroidCategory.PROGRESS,
            importance: AndroidImportance.LOW,
            ongoing: true, // Can't be dismissed
            pressAction: {
                id: 'default',
            },
            actions: [
                {
                    title: 'End Session',
                    pressAction: {
                        id: 'stop',
                    },
                },
            ],
        },
        ios: {
            categoryId: 'timer',
        },
    });
}

export async function updateTimerNotification(elapsedSeconds: number, goalTitle?: string) {
    await notifee.displayNotification({
        id: NOTIFICATION_ID,
        title: '🔥 Focus Session Active',
        body: `${formatTime(elapsedSeconds)} ${goalTitle ? `• ${goalTitle.substring(0, 30)}` : ''}`,
        android: {
            channelId: CHANNEL_ID,
            category: AndroidCategory.PROGRESS,
            importance: AndroidImportance.LOW,
            ongoing: true,
            pressAction: {
                id: 'default',
            },
            actions: [
                {
                    title: 'End Session',
                    pressAction: {
                        id: 'stop',
                    },
                },
            ],
        },
        ios: {
            categoryId: 'timer',
        },
    });
}

export async function cancelTimerNotification() {
    await notifee.cancelNotification(NOTIFICATION_ID);
}

// Setup foreground event handler
export function setupNotificationListeners(onStop: () => void) {
    return notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'stop') {
            onStop();
        }
    });
}

// Background event handler (needs to be called at app entry point)
export function setupBackgroundHandler(onStop: () => void) {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'stop') {
            onStop();
            await cancelTimerNotification();
        }
    });
}
