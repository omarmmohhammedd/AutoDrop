export async function sendNotification(data: { message: string }) {
  try {
    let notification: Notification;
    const allowed = await requestNotificationPermission();

    if (!allowed) await requestNotificationPermission();

    notification = new Notification('New alert', {
      body: data.message
    });
    notification.addEventListener('click', () => notification.close());
  } catch (error) {
    console.log(error);
  }
}

export async function requestNotificationPermission() {
  let permission: NotificationPermission;
  let granted = false;
  permission = await Notification.requestPermission();

  if (permission === 'granted') {
    granted = true;
  } else if (permission !== 'denied') {
    permission = await Notification.requestPermission();
    granted = permission === 'granted' ? true : false;
  }

  return granted;
}
