export interface SocketError {
  message: string;
};

export interface TelecallerBroadcastData {    // Telecaller Broadcast Data (received when telecaller comes online)
  _id: string;
  name: string;
  profile: string | null;
  language: string;
  about: string;
};

export interface TelecallerPresencePayload {   // Presence Change Payload
  telecallerId: string;
  presence: 'ONLINE' | 'OFFLINE' | 'ON_CALL';
  telecaller: TelecallerBroadcastData | null;
};

// Call Related Types
// ============================================
export interface CallParticipant {
  _id: string;
  name: string;
  profile: string | null;
};

// User emits to initiate a call
export interface CallInitiatePayload {
  telecallerId: string;
  callType: 'AUDIO' | 'VIDEO';
};

// User receives when call is ringing
export interface CallRingingPayload {
  callId: string;
  telecaller: CallParticipant;
};

// User receives when call initiation fails
export interface CallErrorPayload {
  message: string;
};

// Telecaller receives for incoming call
export interface CallIncomingPayload {
  callId: string;
  callType: 'AUDIO' | 'VIDEO';
  caller: CallParticipant;
};


// ============================================
// Server → Client Events (User)
// ============================================
export interface UserServerEvents {
  error: (data: SocketError) => void;
  'telecaller:presence-changed': (data: TelecallerPresencePayload) => void;
  'call:ringing': (data: CallRingingPayload) => void;
  'call:error': (data: CallErrorPayload) => void;
};

// ============================================
// Client → Server Events (User)
// ============================================
export interface UserClientEvents {
  'call:initiate': (data: CallInitiatePayload) => void;
};

// ============================================
// Server → Client Events (Telecaller)
// ============================================
export interface TelecallerServerEvents {
  error: (data: SocketError) => void;
  'call:incoming': (data: CallIncomingPayload) => void;
};

// ============================================
// Client → Server Events (Telecaller)
// ============================================
export interface TelecallerClientEvents {

};