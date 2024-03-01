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

import {
  Asset,
  MaterialDefinitionSource,
  AssetStatus,
  AssetType,
  EditableObject,
  EditableObjectType,
  Material,
  RenderedMaterial,
} from '@/types/editables/assetTypes';
import ky from 'ky';
import { API_HOOKS, getBaseURL } from '../../store/useAPIStore';
import { useWebSocketStore } from '../ws/useWebSocketStore';
import { ChatOpenedServerMessage, ServerMessage } from '../ws/serverMessages';
import { v4 as uuidv4 } from 'uuid';

const previewMaterial: (material: Material) => Promise<RenderedMaterial> = async (material: Material) =>
  ky
    .post(`${getBaseURL()}/api/materials/preview`, {
      json: { ...material },
      timeout: 60000,
      hooks: API_HOOKS,
    })
    .json();

async function fetchEditableObjects<T extends EditableObject>(editableObjectType: EditableObjectType): Promise<T[]> {
  return ky.get(`${getBaseURL()}/api/${editableObjectType}s/`, { hooks: API_HOOKS }).json();
}

async function setAssetStatus(assetType: AssetType, id: string, status: AssetStatus) {
  return ky
    .post(`${getBaseURL()}/api/${assetType}s/${id}/status-change`, {
      json: { status, to_global: false },
      hooks: API_HOOKS,
    })
    .json();
}

async function fetchEditableObject<T extends EditableObject>({
  editableObjectType,
  id,
  location,
  type,
}: {
  editableObjectType: EditableObjectType;
  id: string;
  location?: MaterialDefinitionSource;
  type?: string;
}): Promise<T> {
  if (editableObjectType === 'chat') {
    const response: ChatOpenedServerMessage = (await useWebSocketStore
      .getState()
      .sendMessageAndWaitForResponse(
        { type: 'OpenChatClientMessage', chat_id: id, request_id: uuidv4() },
        (response: ServerMessage) => {
          if (response.type === 'ChatOpenedServerMessage') {
            return response.chat.id === id;
          } else {
            return false;
          }
        },
      )) as ChatOpenedServerMessage;

    return response.chat as unknown as T;
  }

  return ky
    .get(`${getBaseURL()}/api/${editableObjectType}s/${id}`, {
      searchParams: { location: location || '', type: type || '' },
      hooks: API_HOOKS,
    })
    .json() as Promise<T>;
}

async function closeChat(id: string): Promise<ServerMessage> {
  const response = await useWebSocketStore.getState().sendMessageAndWaitForResponse(
    {
      type: 'CloseChatClientMessage',
      chat_id: id,
      request_id: uuidv4(),
    },
    (response: ServerMessage) => {
      return response.type === 'NotifyAboutChatMutationServerMessage';
    },
  );
  return response;
}

async function doesEdibleExist(
  editableObjectType: EditableObjectType,
  id: string,
  location?: MaterialDefinitionSource,
) {
  try {
    // Attempt to fetch the object
    const response = await ky
      .get(`${getBaseURL()}/api/${editableObjectType}s/${id}/exists`, {
        searchParams: { location: location || '' },
      })
      .json<{ exists: boolean }>();

    // Check if the response is okay (status in the range 200-299)
    if (response.exists) {
      // Optionally, you can add additional checks here
      // if there are specific conditions to determine existence
      return true;
    } else {
      return false;
    }
  } catch (error) {
    // Handle any kind of error by returning false
    return false;
  }
}

async function saveNewEditableObject(editableObjectType: EditableObjectType, asset_id: string, asset: Asset) {
  return await ky.post(`${getBaseURL()}/api/${editableObjectType}s/${asset_id}`, {
    json: { ...asset },
    timeout: 60000,
    hooks: API_HOOKS,
  });
}

async function updateEditableObject(
  editableObjectType: EditableObjectType,
  editableObject: EditableObject,
  originalId?: string,
) {
  if (!originalId) {
    originalId = editableObject.id;
  }
  console.log('fetchEditableObject', editableObjectType, editableObject, originalId);

  // if (editableObjectType === 'chat') {
  //   throw new Error('Chat cannot be updated');
  // }

  return ky.patch(`${getBaseURL()}/api/${editableObjectType}s/${originalId}`, {
    json: { ...editableObject },
    timeout: 60000,
    hooks: API_HOOKS,
  });
}

async function deleteEditableObject(editableObjectType: EditableObjectType, id: string) {
  return ky.delete(`${getBaseURL()}/api/${editableObjectType}s/${id}`, {
    hooks: API_HOOKS,
  });
}

async function getPathForEditableObject(editableObjectType: EditableObjectType, id: string) {
  return (
    (await ky
      .get(`${getBaseURL()}/api/${editableObjectType}s/${id}/path`, {
        hooks: API_HOOKS,
      })
      .json()) as { path: string }
  ).path;
}

async function setAgentAvatar(agentId: string, avatar: FormData) {
  return ky.post(`${getBaseURL()}/api/agents/${agentId}/avatar`, { body: avatar, hooks: API_HOOKS });
}

export const EditablesAPI = {
  deleteEditableObject,
  fetchEditableObjects,
  fetchEditableObject,
  setAssetStatus,
  doesEdibleExist,
  previewMaterial,
  saveNewEditableObject,
  updateEditableObject,
  getPathForEditableObject,
  closeChat,
  setAgentAvatar,
};
