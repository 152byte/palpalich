#!/usr/bin/env python3
"""
Генерирует videos.js со списком видео по категориям.
Структура папок:
    videos/experts/      - экспертные (вертикальные)
    videos/motion/       - моушн (вертикальные)
    videos/vlog/         - влоги (горизонтальные)
    videos/gaming/       - игровые (горизонтальные)
    videos/comparison/   - пары "до/после"
"""
import json
from pathlib import Path

VIDEOS_DIR = Path('videos')
OUTPUT_FILE = Path('videos.js')
ALLOWED_EXTENSIONS = {'.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v', '.gif'}

CATEGORIES = [
    ('experts', 'Experts', 'vertical'),
    ('motion', 'Motion', 'vertical'),
    ('vlog', 'Vlog', 'horizontal'),
    ('gaming', 'Gaming', 'horizontal'),
]

def format_name(filename):
    name = Path(filename).stem
    name = name.replace('_', ' ').replace('-', ' ')
    while name and (name[0].isdigit() or name[0] in ' .'):
        name = name[1:]
    return name.strip() or Path(filename).stem

def scan_category(folder_name):
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

def scan_comparison():
    folder = VIDEOS_DIR / 'comparison'
    if not folder.exists():
        return []
    
    files = {}
    for file in folder.iterdir():
        if not file.is_file() or file.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        
        stem = file.stem
        if stem.endswith('_before'):
            base_name = stem[:-7]
            files.setdefault(base_name, {})['before'] = file
        elif stem.endswith('_after'):
            base_name = stem[:-6]
            files.setdefault(base_name, {})['after'] = file
    
    pairs = []
    for base_name, pair in sorted(files.items(), reverse=True):
        if 'before' in pair and 'after' in pair:
            pairs.append({
                'name': base_name.replace('_', ' ').replace('-', ' ').title(),
                'before': f'videos/comparison/{pair["before"].name}',
                'after': f'videos/comparison/{pair["after"].name}',
            })
    return pairs

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
    
    comparison = scan_comparison()
    result['comparison'] = comparison
    print(f'   🔄 До/После: {len(comparison)} пар')
    
    js_content = f'// Сгенерировано автоматически\nconst PORTFOLIO_VIDEOS = {json.dumps(result, ensure_ascii=False, indent=2)};\n'
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f'\n✅ Всего видео: {total}')
    print(f'💾 Обновлено: {OUTPUT_FILE}')
    print('\n🚀 Можно коммитить!')

if __name__ == '__main__':
    main()