# API Reference

This document lists all API endpoints found in the backend.

## announcementRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/announcements/list` | `AnnouncementController.findList` |
| GET | `/announcements` | `AnnouncementController.index` |
| GET | `/announcements/:id` | `AnnouncementController.show` |
| POST | `/announcements` | `AnnouncementController.store` |
| PUT | `/announcements/:id` | `AnnouncementController.update` |
| DELETE | `/announcements/:id` | `AnnouncementController.remove` |
| POST | `/announcements/:id/media-upload` | `AnnouncementController.mediaUpload` |
| DELETE | `/announcements/:id/media-upload` | `AnnouncementController.deleteMedia` |

## authRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| POST | `/login` | `SessionController.store` |
| GET | `/impersonate/:companyId` | `SessionController.impersonate` |
| POST | `/refresh_token` | `SessionController.update` |
| DELETE | `/logout` | `SessionController.remove` |
| GET | `/me` | `SessionController.me` |

## campaignRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/campaigns/list` | `CampaignController.findList` |
| GET | `/campaigns` | `CampaignController.index` |
| GET | `/campaigns/:id` | `CampaignController.show` |
| POST | `/campaigns` | `CampaignController.store` |
| PUT | `/campaigns/:id` | `CampaignController.update` |
| DELETE | `/campaigns/:id` | `CampaignController.remove` |
| POST | `/campaigns/:id/cancel` | `CampaignController.cancel` |
| POST | `/campaigns/:id/restart` | `CampaignController.restart` |
| POST | `/campaigns/:id/media-upload` | `CampaignController.mediaUpload` |
| DELETE | `/campaigns/:id/media-upload` | `CampaignController.deleteMedia` |

## campaignSettingRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/campaign-settings` | `CampaignSettingController.index` |
| POST | `/campaign-settings` | `CampaignSettingController.store` |

## chatRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/chats` | `ChatController.index` |
| GET | `/chats/:id` | `ChatController.show` |
| GET | `/chats/:id/messages` | `ChatController.messages` |
| POST | `/chats/:id/messages` | `ChatController.saveMessage` |
| POST | `/chats/:id/read` | `ChatController.checkAsRead` |
| POST | `/chats` | `ChatController.store` |
| PUT | `/chats/:id` | `ChatController.update` |
| DELETE | `/chats/:id` | `ChatController.remove` |

## companyRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/companies/list` | `CompanyController.list` |
| GET | `/companies` | `CompanyController.index` |
| GET | `/companies/:id` | `CompanyController.show` |
| POST | `/companies` | `CompanyController.store` |
| PUT | `/companies/:id` | `CompanyController.update` |
| PUT | `/companies/:id/schedules` | `CompanyController.updateSchedules` |
| DELETE | `/companies/:id` | `CompanyController.remove` |
| POST | `/companies/cadastro` | `CompanyController.signup` |

## companyWhmcsRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| PUT | `/companies/:companyId/whmcs-status` | `CompanyWhmcsController.updateWhmcsStatus` |

## contactListItemRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/contact-list-items/list` | `ContactListItemController.findList` |
| GET | `/contact-list-items` | `ContactListItemController.index` |
| GET | `/contact-list-items/:id` | `ContactListItemController.show` |
| POST | `/contact-list-items` | `ContactListItemController.store` |
| PUT | `/contact-list-items/:id` | `ContactListItemController.update` |
| DELETE | `/contact-list-items/:id` | `ContactListItemController.remove` |

## contactListRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/contact-lists/list` | `ContactListController.findList` |
| GET | `/contact-lists` | `ContactListController.index` |
| GET | `/contact-lists/:id` | `ContactListController.show` |
| POST | `/contact-lists` | `ContactListController.store` |
| POST | `/contact-lists/:id/upload` | `ContactListController.upload` |
| PUT | `/contact-lists/:id` | `ContactListController.update` |
| DELETE | `/contact-lists/:id` | `ContactListController.remove` |

## contactRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| POST | `/contacts/import` | `ImportPhoneContactsController.store` |
| POST | `/contacts/importCsv` | `ContactController.importCsv` |
| GET | `/contacts/exportCsv` | `ContactController.exportCsv` |
| GET | `/contacts` | `ContactController.index` |
| GET | `/contacts/list` | `ContactController.list` |
| GET | `/contacts/:contactId` | `ContactController.show` |
| POST | `/contacts` | `ContactController.store` |
| PUT | `/contacts/:contactId` | `ContactController.update` |
| DELETE | `/contacts/:contactId` | `ContactController.remove` |
| POST | `/contacts/:contactId/tags` | `ContactController.storeTag` |
| DELETE | `/contacts/:contactId/tags/:tagId` | `ContactController.removeTag` |

## dashboardRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/dashboard/status` | `DashboardController.statusSummary` |
| GET | `/dashboard/tickets` | `DashboardController.ticketsStatistic` |
| GET | `/dashboard/users` | `DashboardController.usersReport` |
| GET | `/dashboard/ratings` | `DashboardController.ratingsReport` |
| GET | `/dashboard/contacts` | `DashboardController.contactsReport` |

## helpRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/helps/list` | `HelpController.findList` |
| GET | `/helps` | `HelpController.index` |
| GET | `/helps/:id` | `HelpController.show` |
| POST | `/helps` | `HelpController.store` |
| PUT | `/helps/:id` | `HelpController.update` |
| DELETE | `/helps/:id` | `HelpController.remove` |

## i18nRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/translations/languages` | `I18nController.listLanguages` |
| GET | `/translations` | `I18nController.getKeysAndValues` |
| POST | `/translations` | `I18nController.upsertTranslation` |

## invoicesRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/invoices` | `InvoicesController.index` |
| GET | `/invoices/list` | `InvoicesController.list` |
| GET | `/invoices/all` | `InvoicesController.list` |
| GET | `/invoices/:Invoiceid` | `InvoicesController.show` |
| PUT | `/invoices/:id` | `InvoicesController.update` |

## messageRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| POST | `/messages/forward` | `MessageController.forward` |
| GET | `/messages/:ticketId` | `MessageController.index` |
| POST | `/messages/:ticketId` | `MessageController.store` |
| POST | `/messages/edit/:messageId` | `MessageController.edit` |
| POST | `/messages/react/:messageId` | `MessageController.react` |
| DELETE | `/messages/:messageId` | `MessageController.remove` |
| POST | `/api/messages/send` | `MessageController.send` |

## planRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/plans` | `PlanController.index` |
| GET | `/plans/list` | `PlanController.list` |
| GET | `/plans/listpublic` | `PlanController.listPublic` |
| GET | `/plans/all` | `PlanController.list` |
| GET | `/plans/:id` | `PlanController.show` |
| POST | `/plans` | `PlanController.store` |
| PUT | `/plans/:id` | `PlanController.update` |
| DELETE | `/plans/:id` | `PlanController.remove` |

## pwaRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/manifest.json` | `PwaController.manifest` |
| GET | `/favicon.ico` | `PwaController.favicon` |

## queueOptionRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/queue-options` | `QueueOptionController.index` |
| POST | `/queue-options` | `QueueOptionController.store` |
| GET | `/queue-options/:queueOptionId` | `QueueOptionController.show` |
| PUT | `/queue-options/:queueOptionId` | `QueueOptionController.update` |
| DELETE | `/queue-options/:queueOptionId` | `QueueOptionController.remove` |
| POST | `/queue-options/:queueOptionId/media-upload` | `QueueOptionController.mediaUpload` |
| DELETE | `/queue-options/:queueOptionId/media-upload` | `QueueOptionController.deleteMedia` |

## queueRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/queue` | `QueueController.index` |
| POST | `/queue` | `QueueController.store` |
| GET | `/queue/:queueId` | `QueueController.show` |
| PUT | `/queue/:queueId` | `QueueController.update` |
| DELETE | `/queue/:queueId` | `QueueController.remove` |
| POST | `/queue/:queueId/media-upload` | `QueueController.mediaUpload` |
| DELETE | `/queue/:queueId/media-upload` | `QueueController.deleteMedia` |

## quickMessageRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/quick-messages/list` | `QuickMessageController.findList` |
| GET | `/quick-messages` | `QuickMessageController.index` |
| GET | `/quick-messages/:id` | `QuickMessageController.show` |
| POST | `/quick-messages` | `QuickMessageController.store` |
| PUT | `/quick-messages/:id` | `QuickMessageController.update` |
| DELETE | `/quick-messages/:id` | `QuickMessageController.remove` |

## scheduleRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/schedules` | `ScheduleController.index` |
| POST | `/schedules` | `ScheduleController.store` |
| PUT | `/schedules/:scheduleId` | `ScheduleController.update` |
| GET | `/schedules/:scheduleId` | `ScheduleController.show` |
| DELETE | `/schedules/:scheduleId` | `ScheduleController.remove` |

## settingRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/settings` | `SettingController.index` |
| GET | `/settings/:settingKey` | `SettingController.show` |
| GET | `/public-settings/:settingKey` | `SettingController.publicShow` |
| PUT | `/settings/:settingKey` | `SettingController.update` |
| POST | `/settings/logo` | `SettingController.storeLogo` |
| POST | `/settings/privateFile` | `SettingController.storePrivateFile` |

## subScriptionRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| POST | `/subscriptions` | `SubscriptionController.store` |

## tagRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/tags/list` | `TagController.list` |
| GET | `/tags/kanban` | `TagController.kanban` |
| GET | `/tags` | `TagController.index` |
| POST | `/tags` | `TagController.store` |
| PUT | `/tags/:tagId` | `TagController.update` |
| GET | `/tags/:tagId` | `TagController.show` |
| DELETE | `/tags/:tagId` | `TagController.remove` |
| POST | `/tags/sync` | `TagController.syncTags` |

## ticketNoteRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/ticket-notes/list` | `TicketNoteController.findFilteredList` |
| GET | `/ticket-notes` | `TicketNoteController.index` |
| GET | `/ticket-notes/:id` | `TicketNoteController.show` |
| POST | `/ticket-notes` | `TicketNoteController.store` |
| PUT | `/ticket-notes/:id` | `TicketNoteController.update` |
| DELETE | `/ticket-notes/:id` | `TicketNoteController.remove` |

## ticketRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/tickets` | `TicketController.index` |
| GET | `/tickets/:ticketId` | `TicketController.show` |
| GET | `/tickets/u/:uuid` | `TicketController.showFromUUID` |
| POST | `/tickets` | `TicketController.store` |
| PUT | `/tickets/:ticketId` | `TicketController.update` |
| DELETE | `/tickets/:ticketId` | `TicketController.remove` |

## ticketTagRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| PUT | `/ticket-tags/:ticketId/:tagId` | `TicketTagController.store` |
| DELETE | `/ticket-tags/:ticketId/:tagId` | `TicketTagController.remove` |
| DELETE | `/ticket-tags/:ticketId` | `TicketTagController.removeAll` |

## ticketzOSSRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/ticketz/registry` | `TicketzOSSController.show` |
| POST | `/ticketz/registry` | `TicketzOSSController.store` |

## userRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/users` | `UserController.index` |
| GET | `/users/list` | `UserController.list` |
| POST | `/users` | `UserController.store` |
| PUT | `/users/:userId` | `UserController.update` |
| GET | `/users/:userId` | `UserController.show` |
| DELETE | `/users/:userId` | `UserController.remove` |

## versionRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/` | `VersionController.version` |

## wavoipRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| POST | `/wavoip/:whatsappId` | `WavoipController.saveToken` |
| DELETE | `/wavoip/:whatsappId` | `WavoipController.deleteToken` |
| GET | `/wavoip/:whatsappId` | `WavoipController.getToken` |

## whatsappRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| GET | `/whatsapp/` | `WhatsAppController.index` |
| POST | `/whatsapp/` | `WhatsAppController.store` |
| GET | `/whatsapp/:whatsappId` | `WhatsAppController.show` |
| PUT | `/whatsapp/:whatsappId` | `WhatsAppController.update` |
| DELETE | `/whatsapp/:whatsappId` | `WhatsAppController.remove` |
| GET | `/whatsapp/privacy/:whatsappId` | `PrivacyController.show` |
| PUT | `/whatsapp/privacy/:whatsappId` | `PrivacyController.update` |

## whatsappSessionRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| POST | `/whatsappsession/:whatsappId` | `WhatsAppSessionController.store` |
| PUT | `/whatsappsession/:whatsappId` | `WhatsAppSessionController.update` |
| DELETE | `/whatsappsession/:whatsappId` | `WhatsAppSessionController.remove` |
| GET | `/whatsappsession/refresh/:whatsappId` | `WhatsAppSessionController.refresh` |

## whmcsWebhookRoutes.ts

| Method | Path | Controller Function |
|---|---|---|
| POST | `/whmcs-webhook` | `WhmcsWebhookController.receive` |
