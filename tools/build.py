"""Build the dependency-free bilingual website and its self-contained edition."""
from copy import deepcopy
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
PARTS = ['linear', 'strings-stacks', 'trees', 'backtrack-greedy', 'dynamic', 'graphs']
POINTER_NUMBERS = ['27', '344', '151', '206', '19', '160', '142', '15', '18']

def load_language(language):
    lessons = []
    for part in PARTS:
        lessons.extend(json.loads((ROOT / 'content' / language / f'{part}.json').read_text()))
    original_count = len(lessons)
    for number in POINTER_NUMBERS:
        lesson = next(x for x in lessons if x['problem'] == number and x['kind'] == '题解')
        alias = deepcopy(lesson)
        alias['id'] = 'pointers-' + lesson['id']
        alias['chapter'] = '双指针法'
        lessons.append(alias)
    # Keep aliases stable across languages, independently of the translated title.
    digits = next(x for x in lessons if x['id'] == 'string-replace-digits')
    alias = deepcopy(digits)
    alias.update(id='pointers-' + digits['id'], chapter='双指针法')
    lessons.append(alias)
    # Tests are maintained in source data and need not be downloaded by readers.
    for lesson in lessons:
        lesson.pop('tests', None)
    return lessons, original_count

def main():
    data = {}
    counts = {}
    for language in ['en', 'zh']:
        data[language], counts[language] = load_language(language)
    if counts['en'] != counts['zh']:
        raise ValueError('English and Chinese lesson counts do not match')
    if [x['id'] for x in data['en']] != [x['id'] for x in data['zh']]:
        raise ValueError('English and Chinese lesson IDs do not match')
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    bundle = 'window.HANDBOOK_META = ' + json.dumps({'originalCount': counts['en'], 'directoryEntries': len(data['en'])}) + ';\nwindow.HANDBOOK_DATA = ' + payload + ';\n'
    (ROOT / 'site/assets/lessons.js').write_text(bundle)
    html = (ROOT / 'site/index.html').read_text()
    css = (ROOT / 'site/assets/styles.css').read_text()
    app = (ROOT / 'site/assets/app.js').read_text()
    html = html.replace('<link rel="stylesheet" href="assets/styles.css">', '<style>' + css + '</style>')
    html = html.replace('<script src="assets/lessons.js"></script><script src="assets/app.js"></script>', '<script>' + bundle + '</script><script>' + app + '</script>')
    artifacts = ROOT / 'artifacts'
    artifacts.mkdir(exist_ok=True)
    destination = artifacts / 'Python_Algorithm_Handbook_EN.html'
    destination.write_text(html)
    print(json.dumps({'original_tutorials_per_language': counts['en'], 'directory_entries_per_language': len(data['en']), 'offline_file': str(destination), 'offline_bytes': destination.stat().st_size}))

if __name__ == '__main__':
    main()
