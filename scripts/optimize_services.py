"""Конвертирует 6 новых картинок услуг в WebP @ 1440px / quality 82."""
from pathlib import Path
from PIL import Image

DOWNLOADS = Path("C:/Users/PC/Downloads")
TARGET = Path("e:/Arhiv/projects/clinic_site/pictures")

MAPPING = {
    "documentary_dental_clinic_photography_of_a_female_dentist_in_sage_olive_green_scrubs_working_on_a_c_etwc295oqtjoa57wqz24_0.png": "service-therapy.webp",
    "side_view_of_professional_dental_surgery_in_progress_dental_surgeon_working_on_patient_both_visible_x85ezfay8oevrt312m0m_1.png": "service-surgery.webp",
    "documentary_dental_clinic_photography_of_a_dentists_gloved_hands_holding_a_small_palm-sized_white_p_kn31ljli1yonxx40kyn2_1.png": "service-orthopedics.webp",
    "documentary_dental_clinic_close-up_portrait_of_a_young_female_patient_in_a_dental_chair_smiling_sli_jpiclrgfs3ld6c5u85sz_1.png": "service-orthodontics.webp",
    "_d5cb21d5-b099-4410-9f52-04658f48496f.jpg": "service-hygiene.webp",
    "_f77ea757-ccee-49c4-95e7-ed6363c65413.jpg": "service-kids.webp",
}

MAX_WIDTH = 1440
QUALITY = 82

total_before = 0
total_after = 0

for src_name, dst_name in MAPPING.items():
    src = DOWNLOADS / src_name
    dst = TARGET / dst_name
    if not src.exists():
        print(f"[ПРОПУСК] {src_name} — не найден")
        continue

    size_before = src.stat().st_size
    total_before += size_before

    img = Image.open(src).convert("RGB")
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        new_size = (MAX_WIDTH, round(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    img.save(dst, "WEBP", quality=QUALITY, method=6)
    size_after = dst.stat().st_size
    total_after += size_after

    print(f"  {dst_name:30s}  {size_before/1024:7.0f} KB -> {size_after/1024:6.0f} KB  ({100 * size_after / size_before:.0f}%)")

print(f"\nИтого: {total_before/1024/1024:.2f} MB -> {total_after/1024:.0f} KB  (экономия {100 - 100 * total_after / total_before:.0f}%)")
