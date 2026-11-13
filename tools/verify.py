"""Verify bilingual content parity and execute the existing Python examples."""
import ast
import contextlib
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARTS = ['linear', 'strings-stacks', 'trees', 'backtrack-greedy', 'dynamic', 'graphs']
HAN = re.compile('[\u3400-\u4dbf\u4e00-\u9fff]')

class StripDocstrings(ast.NodeTransformer):
    def visit_FunctionDef(self, node):
        self.generic_visit(node)
        return self.strip(node)
    visit_AsyncFunctionDef = visit_FunctionDef
    def visit_ClassDef(self, node):
        self.generic_visit(node)
        return self.strip(node)
    def visit_Module(self, node):
        self.generic_visit(node)
        return self.strip(node)
    @staticmethod
    def strip(node):
        if node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant) and isinstance(node.body[0].value.value, str):
            node.body = node.body[1:]
        return node

def behavior_ast(code):
    return ast.dump(StripDocstrings().visit(ast.parse(code)), include_attributes=False)

def prose_fields(lesson):
    for field in ['title', 'summary', 'time', 'space']:
        yield field, lesson[field]
    for index, section in enumerate(lesson['sections']):
        yield f'sections[{index}].heading', section['heading']
        for field in ['paragraphs', 'bullets']:
            for i, text in enumerate(section.get(field, [])):
                yield f'sections[{index}].{field}[{i}]', text
    for index, text in enumerate(lesson['example']['walkthrough']):
        yield f'example.walkthrough[{index}]', text
    for index, text in enumerate(lesson['pitfalls']):
        yield f'pitfalls[{index}]', text

def same_shape(left, right):
    if isinstance(left, dict):
        return isinstance(right, dict) and left.keys() == right.keys() and all(same_shape(left[k], right[k]) for k in left)
    if isinstance(left, list):
        return isinstance(right, list) and len(left) == len(right) and all(same_shape(a,b) for a,b in zip(left,right))
    return type(left) is type(right)

def main():
    parts = sys.argv[1:] or PARTS
    issues, totals = [], {'tutorials_per_language': 0, 'python_tests_per_language': {'en': 0, 'zh': 0}, 'ast_pairs': 0}
    seen = set()
    for part in parts:
        zh = json.loads((ROOT / 'content/zh' / f'{part}.json').read_text())
        en = json.loads((ROOT / 'content/en' / f'{part}.json').read_text())
        if len(zh) != len(en):
            issues.append([part, 'record counts differ'])
        for original, translated in zip(zh,en):
            ident = original['id']
            totals['tutorials_per_language'] += 1
            if ident in seen:
                issues.append([ident,'duplicate ID'])
            seen.add(ident)
            if not same_shape(original,translated):
                issues.append([ident,'schema or list lengths differ'])
            for key in ['id','chapter','problem','kind','tests']:
                if original[key] != translated[key]:
                    issues.append([ident, key + ' must be unchanged'])
            for field,text in prose_fields(translated):
                if not text.strip():
                    issues.append([ident,field + ' is empty'])
                if HAN.search(text):
                    issues.append([ident,field + ' contains untranslated Chinese'])
            try:
                if behavior_ast(original['code']) != behavior_ast(translated['code']):
                    issues.append([ident,'Python behavior AST differs'])
                totals['ast_pairs'] += 1
            except Exception as exc:
                issues.append([ident,'AST: '+str(exc)])
            for language, lesson in [('zh',original),('en',translated)]:
                try:
                    namespace={'__name__':'handbook_verification'}
                    with contextlib.redirect_stdout(io.StringIO()):
                        exec(compile(lesson['code'],ident,'exec'),namespace)
                    for test in lesson['tests']:
                        totals['python_tests_per_language'][language] += 1
                        actual=eval(test['expression'],namespace)
                        if actual != test['expected']:
                            issues.append([ident,language, test['expression'],repr(actual),repr(test['expected'])])
                except Exception as exc:
                    issues.append([ident,language,type(exc).__name__+': '+str(exc)])
    print(json.dumps({**totals, 'issues': issues},indent=2))
    return bool(issues)

if __name__=='__main__':
    raise SystemExit(main())
