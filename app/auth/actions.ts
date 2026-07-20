'use server';

import { loginCustomer, registerCustomer } from '@/app/lib/auth';

export async function login(phone: string, password: string) {
  return loginCustomer({ phone, password });
}

export async function register(input: {
  phone: string;
  name: string;
  email: string;
  password: string;
}) {
  return registerCustomer(input);
}
