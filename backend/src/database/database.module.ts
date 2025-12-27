// src/database/database.module.ts
// NestJS module for Drizzle database connection
// Makes database available throughout the application

import { Global, Module } from '@nestjs/common';
import { db } from './index';

@Global() // Makes this module available everywhere without importing
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useValue: db,
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}

