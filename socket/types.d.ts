import { ITelecaller } from "@/types/general";
import { ICall } from "@/types/user";

// ========================================= Common Types & Interfaces =========================================

export type CallType = ICall["callType"];

export type PresenceStatus = ITelecaller["telecallerProfile"]["presence"];

export interface CallIdPayload {
  callId: string;
};

export interface MessagePayload {
  message: string;
};

export interface BaseParticipant {
  _id: string;
  name: string;
  profile: string | null;
};
export interface LiveKitCredentials {
  token: string;
  url: string;
  roomName: string;
};

// ========================== Telecaller Broadcast Data (Received when telecaller comes online) ==============================
export interface TelecallerBroadcastData extends BaseParticipant {
  language: string;
  about: string;
};

// ================================================ Presence Change Payload ==================================================
export interface TelecallerPresencePayload {
  telecallerId: string;
  presence: PresenceStatus;
  telecaller: TelecallerBroadcastData | null;
};

// =========================================== Initiate Call to Telecaller from User Side ====================================
export interface CallInitiatePayload {
  telecallerId: string;
  callType: CallType;
};

// =============================== Confirmation to User when Call is Connected to Telecaller =================================
export interface CallRingingPayload extends CallIdPayload {
  telecaller: BaseParticipant;
  livekit?: LiveKitCredentials; // Optional
};

// ====================== Incoming Call Information for Telecaller and Call Accept Confirmation to Server ====================
export interface TelecallerCallInformationPayload extends CallIdPayload {
  callType: CallType;
  caller: BaseParticipant;
  livekit?: LiveKitCredentials; // Optional
};

// ========================================= Call Accepted Payload =========================================
export interface CallAcceptedPayload extends CallIdPayload {
  livekit: LiveKitCredentials; // <--- REQUIRED HERE
};

export interface TelecallerCallAcceptedPayload extends TelecallerCallInformationPayload {
  livekit: LiveKitCredentials; // <--- REQUIRED HERE
};

// ================================================== User Socket Events =====================================================
export interface UserServerEvents {
  'error': (data: MessagePayload) => void;
  'telecaller:presence-changed': (data: TelecallerPresencePayload) => void;
  'call:ringing': (data: CallRingingPayload) => void;
  'call:error': (data: MessagePayload) => void;
  'call:accepted': (data: CallAcceptedPayload) => void;
  'call:rejected': (data: CallIdPayload) => void;
  'call:missed': (data: CallIdPayload) => void;
  'call:ended': (data: CallIdPayload) => void;
};

export interface UserClientEvents {
  'call:initiate': (data: CallInitiatePayload) => void;
  'call:cancel': (data: CallIdPayload) => void;
  'call:end': (data: CallIdPayload) => void;
};

// ================================================ Telecaller Socket Events =================================================
export interface TelecallerServerEvents {
  'error': (data: MessagePayload) => void;
  'call:incoming': (data: TelecallerCallInformationPayload) => void;
  'call:accepted': (data: TelecallerCallAcceptedPayload) => void;
  'call:missed': (data: CallIdPayload) => void;
  'call:cancelled': (data: CallIdPayload) => void;
  'call:ended': (data: CallIdPayload) => void;
};

export interface TelecallerClientEvents {
  'call:accept': (data: CallIdPayload) => void;
  'call:reject': (data: CallIdPayload) => void;
  'call:end': (data: CallIdPayload) => void;
};