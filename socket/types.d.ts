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

export interface SocketError {
  message: string;
};

// Server → Client Events ( same for both namespaces )
export interface ServerEvents {
  error: (data: SocketError) => void;
  'telecaller:presence-changed': (data: TelecallerPresencePayload) => void;
};

// Client → Server Events ( same for both namespaces )
export interface ClientEvents {

};