// TypeScript declaration for testUtils mock helpers
export const mockAdminUser: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  refresh_token: string;
};

export function resetAllMocks(jwt: any, prisma: any): void;
