#!/usr/bin/env node
// Hash a plaintext admin password to the scrypt$salt$key format expected by
// ADMIN_PASSWORD_HASH. Usage:
//   node bin/hash-admin-password.mjs 'MiPasswordSeguro!'

import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node bin/hash-admin-password.mjs '<password>'");
  process.exit(1);
}

const salt = randomBytes(16);
const key = scryptSync(password, salt, 32);
console.log(`scrypt$${salt.toString("base64")}$${key.toString("base64")}`);
