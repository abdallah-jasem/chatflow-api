import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SanitizeUserInterceptor } from './auth/interceptors/sanitize-user.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new SanitizeUserInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },

      /*
      في تطبيقات NestJS كثير من المشاكل تبدأ من البيانات الداخلة للتطبيق

ولو لم نضبطها من البداية سنترك بابا مفتوحا للأخطاء والسلوك غير المتوقع وحتى الثغرات

لهذا أعتبر app useGlobalPipes مع ValidationPipe من أول الأشياء التي يجب إضافتها في أي مشروع

whitelist true
هذا الخيار يجعل التطبيق يقبل فقط الحقول المسموح بها داخل DTO
وأي بيانات إضافية لا نحتاجها يتم حذفها مباشرة
وهذا يقلل الفوضى ويحافظ على وضوح العقد بين الواجهة الخلفية والواجهة الأمامية

forbidNonWhitelisted true
هنا نرفع مستوى الأمان والانضباط
بدل أن نتجاهل الحقول غير المصرح بها فقط نقوم برفض الطلب من الأصل
وهذا مفيد جدا حتى نكشف الأخطاء مبكرا ونمنع تمرير بيانات غير متوقعة

transform true
هذا الخيار يحول البيانات الواردة إلى الأنواع الصحيحة حسب DTO
مثلا لو وصل رقم على شكل نص يمكن تحويله تلقائيا
وهذا يجعل التعامل داخل التطبيق أنظف وأسهل وأكثر استقرارا

enableImplicitConversion true
ميزة مهمة جدا خصوصا في query params و body
لأنها تساعد NestJS على فهم النوع المطلوب وتحويله بدون كتابة تحويلات يدوية كثيرة
وهذا يقلل التكرار ويجعل الكود أكثر احترافية

الخلاصة
إذا كنت تبني مشروع NestJS وتريد كودا أنظف وأمانا أعلى وأخطاء أقل
ابدأ من هنا
تحقق من البيانات قبل دخولها إلى منطق التطبيق

هذه ليست إضافة تجميلية
هذه قاعدة أساسية في أي Backend محترم

#nestjs #backend #typescript #nodejs #webdevelopment #softwareengineering
 */
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
