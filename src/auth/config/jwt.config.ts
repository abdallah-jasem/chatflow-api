import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

export default registerAs('jwt', () => {
  const config = {
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: (process.env.JWT_TTL ?? '7d') as StringValue,
    },
  } as const satisfies JwtModuleOptions;
  return config;
});

/*
ملخص سطر واحد لكل سطر
registerAs → يسجل config باسم jwt
JwtModuleOptions → يضمن أن الشكل صحيح
StringValue → نوع لقيم الوقت مثل 7d
export default → تصدير هذا config كافتراضي
secret → مفتاح توقيع JWT من .env
signOptions → إعدادات التوقيع
expiresIn → مدة انتهاء التوكن
?? '7d' → fallback إذا لم توجد قيمة
as const → تثبيت القيم
satisfies JwtModuleOptions → التحقق من صحة الشكل
return config → إرجاع الإعدادات 
*/
