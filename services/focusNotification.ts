import notifee, {
    AndroidImportance,
    AndroidCategory,
    EventType,
    AndroidColor,
    TimestampTrigger,
    TriggerType
} from '@notifee/react-native';
import { Platform, AppState } from 'react-native';

const CHANNEL_ID = 'focus-timer';
const NOTIFICATION_ID = 'focus-session';

// Create notification channel (Android only)
async function createChannel() {
    if (Platform.OS === 'android') {
        await notifee.createChannel({
            id: CHANNEL_ID,
            name: 'Focus Timer',
            importance: AndroidImportance.DEFAULT,
            vibration: false,
        });
    }
}

// Show persistent timer notification with LIVE chronometer (Android)
// For iOS, we'll need to call this periodically to update
export async function showOrUpdateTimerNotification(startTimeMs: number, goalTitle?: string) {
    await createChannel();

    const elapsedSeconds = Math.floor((Date.now() - startTimeMs) / 1000);
    const hrs = Math.floor(elapsedSeconds / 3600);
    const mins = Math.floor((elapsedSeconds % 3600) / 60);
    const secs = elapsedSeconds % 60;
    const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    await notifee.displayNotification({
        id: NOTIFICATION_ID,
        title: '🔥 Focus Session',
        body: goalTitle ? `Working on: ${goalTitle.substring(0, 30)}` : 'Stay focused!',
        android: {
            channelId: CHANNEL_ID,
            category: AndroidCategory.SERVICE,
            importance: AndroidImportance.DEFAULT,
            ongoing: true,
            onlyAlertOnce: true,
            smallIcon: 'ic_launcher',
            color: '#EF4444',
            // CHRONOMETER - This makes the timer count up live!
            chronometerDirection: 'up',
            showChronometer: true,
            timestamp: startTimeMs,
            pressAction: {
                id: 'default',
                launchActivity: 'default',
            },
            actions: [
                {
                    title: '⏹️ Stop',
                    pressAction: {
                        id: 'stop',
                    },
                },
            ],
        },
    });
}

export async function cancelTimerNotification() {
    await notifee.cancelNotification(NOTIFICATION_ID);
}

// Setup foreground event handler - returns unsubscribe function
export function setupNotificationListeners(onStop: () => void) {
    return notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'stop') {
            onStop();
        }
    });
}

// Background event handler - call this at app startup
export function registerBackgroundHandler() {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'stop') {
            await cancelTimerNotification();
        }
    });
}

// For iOS: Start a timer to update notification every second while in background
let iosUpdateInterval: ReturnType<typeof setInterval> | null = null;

export function startIOSBackgroundUpdates(startTimeMs: number, goalTitle?: string) {
    if (Platform.OS !== 'ios') return;

    // Update notification every second for iOS
    iosUpdateInterval = setInterval(() => {
        if (AppState.currentState !== 'active') {
            showOrUpdateTimerNotification(startTimeMs, goalTitle);
        }
    }, 1000);
}

export function stopIOSBackgroundUpdates() {
    if (iosUpdateInterval) {
        clearInterval(iosUpdateInterval);
        iosUpdateInterval = null;
    }
}
