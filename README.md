# Python Algorithm Handbook

**[Read the handbook online](https://supercodingden.github.io/python-algorithm-handbook/)** · English first · 中文 available

A bilingual, Python-first algorithm study handbook with **233 tutorials in English and Chinese**, organized into **12 topics**. Each tutorial explains the problem, develops the reasoning, walks through an example, presents a complete Python 3 implementation, and discusses complexity and common mistakes.

English is the primary language. Every fresh visit or page refresh starts in English, regardless of the browser language or a previous selection. Use the **中文 / English** button to switch languages while staying on the same tutorial.

## Features

- Full English and Chinese explanations, examples, complexity notes, and review chapters.
- Python 3 solutions throughout the handbook.
- A searchable topic directory, stable tutorial links, an on-page outline, and previous/next navigation.
- Syntax-highlighted code with a copy button.
- Responsive layouts for desktop and mobile reading.
- A self-contained offline edition that opens directly in a browser.
- No framework, package installation, API key, account, or server is required to read the offline edition.

## Topics

| Topic | Original tutorials |
| --- | ---: |
| Arrays | 9 |
| Linked lists | 9 |
| Hash tables | 11 |
| Strings | 8 |
| Two pointers | 2 |
| Stacks and queues | 9 |
| Binary trees | 46 |
| Backtracking | 22 |
| Greedy algorithms | 24 |
| Dynamic programming | 55 |
| Monotonic stacks | 7 |
| Graphs | 31 |
| **Total per language** | **233** |

Ten existing tutorials are also cross-listed under Two Pointers, giving each language 243 directory entries. The standalone Algorithm Basics section is outside this handbook's scope; topic-specific concepts remain included.

## Read locally

The generated website is in `site/`. From the repository root, run:

```bash
python3 -m http.server 8000 --directory site
```

Then open `http://localhost:8000` in your browser. No Python packages are needed for the build or content checks. Tutorial snippets use Python's standard library.

## Build the offline edition

```bash
python3 tools/build.py
```

This regenerates `site/assets/lessons.js` and creates:

```text
artifacts/Python_Algorithm_Handbook_EN.html
```

Double-click that HTML file to read the entire bilingual handbook offline. English is still the initial language. The tutorial text, directory, language switch, and code examples are included in the file. External reference links require an internet connection.

## Project structure

```text
content/
  en/                 Full English tutorials, Python snippets, and example checks
  zh/                 Matching Chinese tutorials
site/
  index.html          English-first website shell
  assets/
    app.js            Language switching, directory, search, and navigation
    styles.css        Shared responsive styling
    lessons.js        Generated bilingual content bundle
tools/
  build.py            Build the static bundle and self-contained offline edition
  verify.py           Check translation parity and execute Python examples
.github/workflows/
  pages.yml           Verify, build, and deploy to GitHub Pages
```

## Verify the content

```bash
python3 tools/verify.py
```

The verifier checks matching tutorial IDs, field structure, paragraph/list counts, and language coverage. It compares the executable Python syntax trees across languages while allowing translated comments and docstrings. It also runs the 536 embedded example checks in each language, for 1,072 checks in total.

To check one topic group:

```bash
python3 tools/verify.py dynamic
```

Passing example checks provides useful regression coverage; it is not a proof that every solution is correct for every possible input. Read each tutorial's assumptions and complexity notes before adapting a solution.

## Publish with GitHub Pages

The included workflow publishes `site/` after verification and a successful build on every push to `main`.

For a new repository, open **Settings → Pages** and select **GitHub Actions** as the publishing source. Then push to `main` or run **Verify and deploy handbook** from the Actions tab. The successful deployment shows the live website URL.

The repository must be public for unauthenticated visitors to browse its source. The published Pages website can be read without a GitHub account.

## Editing and contributing

Tutorials are split into six JSON files in each language. Keep corresponding IDs, paragraph/list structure, sample data, Python behavior, and tests aligned across `content/en/` and `content/zh/`. Run the verifier and builder after editing.

For a correction, include the tutorial ID, the input or statement that exposes the issue, and the expected behavior. Improvements to explanation clarity and translation accuracy are welcome.

## Acknowledgments and content provenance

The topic coverage was inspired by the public [Code Caprice / LeetCode-Master learning directory](https://github.com/youngyangyang04/leetcode-master) by Programmer Carl. The explanations, worked examples, and Python implementations in this handbook were independently written for this study companion. The English edition translates that original companion content in full.

The original author's articles, illustrations, videos, and other materials remain available at [programmercarl.com](https://programmercarl.com/algo/). Names and identifiers of standard practice problems are used to help readers locate the relevant exercises; the respective practice platforms define their official problem statements and constraints.
