import { ITelecaller } from "./general";

export type TelecallerListItem = {
  _id: string;
  name: string;
  profile: string | null;
  language: string;
  about: string;
  presence: "ONLINE" | "OFFLINE" | "ON_CALL";
  isFavorite?: boolean;
};

export type ICallType = 'AUDIO' | 'VIDEO';

export type ICallStatus = 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'MISSED' | 'COMPLETED';

export interface ICallTelecaller extends Pick<ITelecaller, '_id' | 'name' | 'profile'> { }

export interface ICall {
  _id: string;
  userId: string;
  telecaller: ICallTelecaller;
  callType: CallType;
  status: CallStatus;
  durationInSeconds: number;
  coinsSpent: number;
  coinsEarned: number;
  roomId?: string;
  userFeedback?: string;
  telecallerFeedback?: string;
  acceptedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// For call history list items 
export interface ICallHistoryItem extends Pick<ICall,
  | '_id'
  | 'telecaller'
  | 'callType'
  | 'status'
  | 'durationInSeconds'
  | 'coinsSpent'
  | 'userFeedback'
  | 'acceptedAt'
  | 'endedAt'
  | 'createdAt'
> { }

export interface IPlan {
  _id: string;
  amount: number;
  coins: number;
  discountPercentage: number;
  createdAt: string;
};

export type TransactionType = 'RECHARGE';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface ITransaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  coins?: number;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
};