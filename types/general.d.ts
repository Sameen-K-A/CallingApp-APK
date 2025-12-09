export interface IUserBase {
  _id: string;
  phone: string;
  name?: string;
  role?: "USER" | "TELECALLER";
  dob?: Date;
  language?: string;
  profile?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  wallet: { balance: number };
  accountStatus: "ACTIVE" | "SUSPENDED";
  createdAt: Date;
  updatedAt: Date;
};

export interface ITelecaller extends IUserBase {
  role: "TELECALLER";
  telecallerProfile: {
    about: string;
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    verificationNotes?: string;
    presence: "ONLINE" | "OFFLINE" | "ON_CALL";
  };
  favorites?: never;
};

export interface IUser extends IUserBase {
  role?: "USER";
  favorites: string[];
  telecallerProfile?: never;
};

export type IAuthUser = IUser | ITelecaller;