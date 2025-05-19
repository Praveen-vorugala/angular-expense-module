export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export type Grade = 'MS1' | 'MS2' | 'MS3' | 'MS4' | 'MS5';

export type Position = string;

export interface UserProperty {
  id: string;
  name: string;
  type: 'ROLE' | 'GRADE' | 'POSITION';
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  grade: Grade;
  position: Position;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
} 