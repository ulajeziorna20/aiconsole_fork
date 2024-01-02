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

import ReconnectingWebSocket from 'reconnecting-websocket';
import { ErrorEvent } from 'reconnecting-websocket/events';
import { create } from 'zustand';
import { useChatStore } from '../../store/editables/chat/useChatStore';
import { useAPIStore } from '../../store/useAPIStore';
import { ClientMessage } from './clientMessages';
import { handleServerMessage } from './handleServerMessage';
import { ServerMessage } from './serverMessages';

export type WebSockeStore = {
  ws: ReconnectingWebSocket | null;
  initWebSocket: () => void;
  disconnect: () => void;
  sendMessage: (message: ClientMessage) => void;
  sendMessageAndWaitForResponse: (
    messageToSend: ClientMessage,
    responseCriteria: (response: ServerMessage) => boolean,
    timeout?: number,
  ) => Promise<ServerMessage>;
  initStarted: boolean;
};

// Create Zustand store
export const useWebSocketStore = create<WebSockeStore>((set, get) => ({
  ws: null,
  initStarted: false,

  // updated function to init the WebSocket connection
  initWebSocket: () => {
    if (get().initStarted) return;
    set({ initStarted: true });

    const getBaseHostWithPort = useAPIStore.getState().getBaseHostWithPort;
    const ws = new ReconnectingWebSocket(`ws://${getBaseHostWithPort()}/ws`);

    ws.onopen = () => {
      set({ ws });
    };

    ws.onmessage = async (e: MessageEvent) => {
      const data: ServerMessage = JSON.parse(e.data);
      handleServerMessage(data);
    };

    ws.onerror = (e: ErrorEvent) => {
      console.log('WebSocket error: ', e);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      set({ ws: null });
    };
  },

  disconnect: () => {
    get().ws?.close();
    set({ ws: null });
  },

  sendMessage: (message: ClientMessage) => {
    console.log('Sending ClientMessage', message);
    get().ws?.send(JSON.stringify(message));
  },

  sendMessageAndWaitForResponse: async (
    messageToSend: ClientMessage,
    responseCriteria: (response: ServerMessage) => boolean,
    timeout: number = 30000, // default timeout of 10 seconds
  ): Promise<ServerMessage> => {
    return new Promise<ServerMessage>((resolve, reject) => {
      // Send the message
      get().sendMessage(messageToSend);

      // Handler for incoming messages
      const messageHandler = (e: MessageEvent) => {
        try {
          const incomingMessage: ServerMessage = JSON.parse(e.data); //TOOD: Zod parsing

          // Check if the incoming message meets the criteria
          if (responseCriteria(incomingMessage)) {
            cleanup();
            resolve(incomingMessage);
          }
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      // Add the message handler to the WebSocket
      get().ws?.addEventListener('message', messageHandler);

      // Timeout mechanism
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Response timeout'));
      }, timeout);

      // Cleanup logic
      const cleanup = () => {
        clearTimeout(timeoutId);
        get().ws?.removeEventListener('message', messageHandler);
      };

      // Optional: add more logic as needed
    });
  },
}));
