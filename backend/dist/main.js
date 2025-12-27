"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 SafeTrade Backend is running on: http://localhost:${port}`);
    console.log(`📡 API available at: http://localhost:${port}/api`);
    console.log(`🗄️  Database: Connected (Drizzle ORM + PostgreSQL)`);
}
bootstrap();
//# sourceMappingURL=main.js.map