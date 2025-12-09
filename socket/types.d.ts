export interface SocketError {
  message: string;
};

// Server → Client Events ( same for both namespaces )
export interface ServerEvents {
  error: (data: SocketError) => void;
};

// Client → Server Events ( same for both namespaces )
export interface ClientEvents {

};