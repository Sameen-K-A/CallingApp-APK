export interface SocketError {
  message: string;
};

// ============================================
// Telecaller Broadcast Data (received when telecaller comes online)
// ============================================
export interface TelecallerBroadcastData {
  _id: string;
  name: string;
  profile: string | null;
  language: string;
  about: string;
};

// ============================================
// Presence Change Payload
// ============================================
export interface TelecallerPresencePayload {
  telecallerId: string;
  presence: 'ONLINE' | 'OFFLINE' | 'ON_CALL';
  telecaller: TelecallerBroadcastData | null;
};

// ============================================
// Call Participant (generic for both user and telecaller)
// ============================================
export interface CallParticipant {
  _id: string;
  name: string;
  profile: string | null;
};

// ============================================
// User Socket Events
// ============================================

export interface CallInitiatePayload {
  telecallerId: string;
  callType: 'AUDIO' | 'VIDEO';
};

export interface CallRingingPayload {
  callId: string;
  telecaller: CallParticipant;
};

export interface CallErrorPayload {
  message: string;
};

export interface CallAcceptedPayload {
  callId: string;
};

export interface CallRejectedPayload {
  callId: string;
};

export interface CallCancelPayload {
  callId: string;
}

export interface CallMissedPayload {
  callId: string;
}

export interface CallEndPayload {
  callId: string;
}

export interface CallEndedPayload {
  callId: string;
}

export interface UserServerEvents {
  error: (data: SocketError) => void;
  'telecaller:presence-changed': (data: TelecallerPresencePayload) => void;
  'call:ringing': (data: CallRingingPayload) => void;
  'call:error': (data: CallErrorPayload) => void;
  'call:accepted': (data: CallAcceptedPayload) => void;
  'call:rejected': (data: CallRejectedPayload) => void;
  'call:missed': (data: CallMissedPayload) => void;
  'call:ended': (data: CallEndedPayload) => void;
};

export interface UserClientEvents {
  'call:initiate': (data: CallInitiatePayload) => void;
  'call:cancel': (data: CallCancelPayload) => void;
  'call:end': (data: CallEndPayload) => void;
};

// ============================================
// Telecaller Socket Events
// ============================================

export interface CallIncomingPayload {
  callId: string;
  callType: 'AUDIO' | 'VIDEO';
  caller: CallParticipant;
};

export interface CallAcceptPayload {
  callId: string;
};

export interface CallRejectPayload {
  callId: string;
};

export interface TelecallerCallAcceptedPayload {
  callId: string;
  callType: 'AUDIO' | 'VIDEO';
  caller: CallParticipant;
};

export interface CallCancelledPayload {
  callId: string;
};

export interface TelecallerServerEvents {
  error: (data: SocketError) => void;
  'call:incoming': (data: CallIncomingPayload) => void;
  'call:accepted': (data: TelecallerCallAcceptedPayload) => void;
  'call:missed': (data: CallMissedPayload) => void;
  'call:cancelled': (data: CallCancelledPayload) => void;
  'call:ended': (data: CallEndedPayload) => void;
};

export interface TelecallerClientEvents {
  'call:accept': (data: CallAcceptPayload) => void;
  'call:reject': (data: CallRejectPayload) => void;
  'call:end': (data: CallEndPayload) => void;
};