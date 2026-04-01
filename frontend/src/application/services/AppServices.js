import { createApiClientService } from '@application/services/ApiClientService'
import { createNotificationService } from '@application/services/NotificationService'
import apiClient from '@infrastructure/api/AxiosApiClient'
import SonnerNotificationAdapter from '@infrastructure/notifications/SonnerNotificationAdapter'

// Centralized composition root for application services.
export const apiClientService = createApiClientService(apiClient)
export const notificationService = createNotificationService(SonnerNotificationAdapter)
