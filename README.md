# MCQ Quiz SPA

This is a React + Vite single-page app for multiple-choice practice with fixed subject routes:

- `/os`
- `/dbms`
- `/cn`
- `/c`

Each route loads a matching JSON file from `src/data/` and shows one question at a time. When a user clicks an option, the app immediately marks it correct or wrong and shows the explanation.

## JSON format

Use this shape for each subject file:

```json
[
  {
    "quesstion": "Your question here",
    "option": ["A", "B", "C", "D"],
    "answer": "B",
    "explanation": "Why this is correct."
  }
]
```

The app also accepts `question` if you prefer the correct spelling.

## Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Build for production with:

```bash
npm run build
```
