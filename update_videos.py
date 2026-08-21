#!/usr/bin/env python3
"""
Генерирует videos.js со списком видео по категориям.
Структура папок:
    videos/reels/    - обычные reels (вертикальные)
    videos/expert/   - экспертные reels (вертикальные)
    videos/gaming/   - игровые видео (горизонтальные)
"""
import json
from pathlib import Path

VIDEOS_DIR = Path('videos')
OUTPUT_FILE = Path('videos.js')
ALLOWED_EXTENSIONS = {'.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v'}

# Категории: (имя папки, отображаемое название, ориентация)
CATEGORIES = [
    ('reels', 'Reels', 'vertical'),
    ('expert', 'Экспертные Reels', 'vertical'),
    ('gaming', 'Игровые', 'horizontal'),
]

def format_name(filename):
    name = Path(filename).stem
    name = name.replace('_', ' ').replace('-', ' ')
    while name and (name[0].isdigit() or name[0] in ' .'):
        name = name[1:]
    return name.strip() or Path(filename).stem

def scan_category(folder_name):
    """Сканирует одну подпапку и возвращает список видео"""
    folder = VIDEOS_DIR / folder_name
    if not folder.exists():
        return []
    
    videos = []
    for file in sorted(folder.iterdir(), reverse=True):
        if file.is_file() and file.suffix.lower() in ALLOWED_EXTENSIONS:
            videos.append({
                'name': format_name(file.name),
                'src': f'videos/{folder_name}/{file.name}',
                'filename': file.name,
            })
    return videos

def main():
    print('🎬 Сканирование папки videos/...')
    
    result = {}
    total = 0
    
    for folder_name, display_name, orientation in CATEGORIES:
        videos = scan_category(folder_name)
        result[folder_name] = {
            'title': display_name,
            'orientation': orientation,
            'videos': videos
        }
        total += len(videos)
        print(f'   📁 {display_name}: {len(videos)} видео')
    
    
    js_content = f'// Сгенерировано автоматически скриптом update_videos.py\nconst PORTFOLIO_VIDEOS = {json.dumps(result, ensure_ascii=False, indent=2)};\n'
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f'\n✅ Всего видео: {total}')
    print(f'💾 Обновлено: {OUTPUT_FILE}')
    print('\n🚀 Теперь можно коммитить!')

if __name__ == '__main__':
    main()