// src/users/entities/user.entity.ts
// Entity type definition for User
// Will be inferred from Drizzle schema in production

export class User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  kycLevel: number;
  kycStatus: string | null;
  referredBy: string | null;
  referralCode: string;
  createdAt: Date;
  updatedAt: Date;
}
