FROM python:3.10

# إعداد مستخدم عادي لتجنب مشاكل الصلاحيات في Hugging Face
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# نسخ وتسطيب المكتبات
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# نسخ باقي كود المشروع
COPY --chown=user . /app

# تشغيل السيرفر على البورت الإجباري 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]