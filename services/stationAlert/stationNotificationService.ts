/**
 * Service to handle browser notifications and formatting of alerts.
 */

export interface AlertNotificationDetails {
  title: string;
  body: string;
}

export const stationNotificationService = {
  /**
   * Check if browser notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  /**
   * Check current permission status
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  /**
   * Request permission for browser notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'default';
    }
  },

  /**
   * Trigger a browser desktop notification if permitted
   */
  sendBrowserNotification(title: string, body: string): boolean {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return false;
    }

    try {
      new Notification(title, {
        body,
        icon: '/logo.png', // Fallback, or generic system icon
      });
      return true;
    } catch (error) {
      console.error('Browser Notification failed:', error);
      return false;
    }
  },

  /**
   * Formats the notification text based on the threshold breached.
   */
  getAlertDetails(stationName: string, threshold: number): AlertNotificationDetails {
    switch (threshold) {
      case 30:
        return {
          title: `🚆 ${stationName} coming up`,
          body: `Your train is approximately 30 km away.`
        };
      case 10:
        return {
          title: `🔔 Approaching ${stationName}`,
          body: `10 km remaining until arrival.`
        };
      case 5:
        return {
          title: `🚉 Get ready`,
          body: `${stationName} is 5 km away. Please prepare your luggage.`
        };
      case 2:
        return {
          title: `🚨 Arriving soon`,
          body: `Your train is approximately 2 km away from ${stationName}.`
        };
      case 0:
      default:
        return {
          title: `✅ You've arrived`,
          body: `Welcome to ${stationName}.`
        };
    }
  }
};
