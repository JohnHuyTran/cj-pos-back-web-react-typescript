import { getegid } from "process";
import { env } from "../adapters/environmentConfigs";
import { get, post } from "../adapters/posback-adapter";
import { environment } from "../environment-base";
import { getPathUrl } from "./base-service";

export async function getNotificationTasks(page: number) {
  try {
    const response = await get(
      `${environment.task.notification.tasks.url}?page=${page + 1}&perPage=10`,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getNotificationReminders(page: number) {
  try {
    const response = await get(
      `${environment.task.notification.reminders.url}?page=${
        page + 1
      }&perPage=10`,
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function getNotificationAnnouncements(page: number) {
  try {
    const response = await get(
      `${environment.task.notification.announcements.url}?page=${
        page + 1
      }&perPage=10`,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateNotificationItem(id: string) {
  try {
    const response = await post(getPathNotificationRead(id));
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathNotificationRead = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.task.notification.read.url}`,
    { id: id },
  );
};
