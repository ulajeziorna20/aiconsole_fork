// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { z } from 'zod';
import { ChatSchema } from '@/types/editables/chatTypes';
import { AssetTypeSchema } from '@/types/editables/assetTypes';
import { ChatMutationSchema } from './chat/chatMutations';

export const BaseServerMessageSchema = z.object({});

export const NotificationServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('NotificationServerMessage'),
  title: z.string(),
  message: z.string(),
});

export const DebugJSONServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('DebugJSONServerMessage'),
  message: z.string(),
  object: z.record(z.string(), z.any()), // Assuming `object` is a simple dictionary
});

export const ErrorServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('ErrorServerMessage'),
  error: z.string(),
});

export const InitialProjectStatusServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('InitialProjectStatusServerMessage'),
  project_name: z.string().optional(),
  project_path: z.string().optional(),
});

export const ProjectOpenedServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('ProjectOpenedServerMessage'),
  name: z.string(),
  path: z.string(),
});

export const ProjectClosedServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('ProjectClosedServerMessage'),
});

export const ProjectLoadingServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('ProjectLoadingServerMessage'),
});

export const AssetsUpdatedServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('AssetsUpdatedServerMessage'),
  initial: z.boolean(),
  asset_type: AssetTypeSchema, // Assuming Asset is an enum
  count: z.number(),
});

export const SettingsServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('SettingsServerMessage'),
  initial: z.boolean(),
});

export const NotifyAboutChatMutationServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('NotifyAboutChatMutationServerMessage'),
  request_id: z.string(),
  chat_id: z.string(),
  mutation: ChatMutationSchema, // Assuming ChatMutationSchema is defined
});

export const ChatOpenedServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('ChatOpenedServerMessage'),
  chat: ChatSchema, // Assuming ChatSchema is defined
});

export const LockAcquiredServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('LockAcquiredServerMessage'),
  request_id: z.string(),
  chat_id: z.string(),
});

export const LockReleasedServerMessageSchema = BaseServerMessageSchema.extend({
  type: z.literal('LockReleasedServerMessage'),
  request_id: z.string(),
  chat_id: z.string(),
  aborted: z.boolean(),
});

export type BaseServerMessage = z.infer<typeof BaseServerMessageSchema>;
export type NotificationServerMessage = z.infer<typeof NotificationServerMessageSchema>;
export type DebugJSONServerMessage = z.infer<typeof DebugJSONServerMessageSchema>;
export type ErrorServerMessage = z.infer<typeof ErrorServerMessageSchema>;
export type InitialProjectStatusServerMessage = z.infer<typeof InitialProjectStatusServerMessageSchema>;
export type ProjectOpenedServerMessage = z.infer<typeof ProjectOpenedServerMessageSchema>;
export type ProjectClosedServerMessage = z.infer<typeof ProjectClosedServerMessageSchema>;
export type ProjectLoadingServerMessage = z.infer<typeof ProjectLoadingServerMessageSchema>;
export type AssetsUpdatedServerMessage = z.infer<typeof AssetsUpdatedServerMessageSchema>;
export type SettingsServerMessage = z.infer<typeof SettingsServerMessageSchema>;
export type NotifyAboutChatMutationServerMessage = z.infer<typeof NotifyAboutChatMutationServerMessageSchema>;
export type ChatOpenedServerMessage = z.infer<typeof ChatOpenedServerMessageSchema>;
export type LockAcquiredServerMessage = z.infer<typeof LockAcquiredServerMessageSchema>;
export type LockReleasedServerMessage = z.infer<typeof LockReleasedServerMessageSchema>;

export const ServerMessageSchema = z.union([
  NotificationServerMessageSchema,
  DebugJSONServerMessageSchema,
  ErrorServerMessageSchema,
  InitialProjectStatusServerMessageSchema,
  ProjectOpenedServerMessageSchema,
  ProjectClosedServerMessageSchema,
  ProjectLoadingServerMessageSchema,
  AssetsUpdatedServerMessageSchema,
  SettingsServerMessageSchema,
  NotifyAboutChatMutationServerMessageSchema,
  ChatOpenedServerMessageSchema,
  LockAcquiredServerMessageSchema,
  LockReleasedServerMessageSchema,
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>;
