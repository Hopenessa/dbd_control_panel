Put character portraits here and connect them in `src/data/characters.ts`.

Recommended structure:

```text
public/portraits/
  killers/
    trapper.png
    wraith.png
  survivors/
    dwight-fairfield.png
    meg-thomas.png
```

Use a public path in the character data:

```ts
{ name: 'The Trapper', type: 'killer', color: '#7f1d1d', portrait: '/portraits/killers/trapper.png' }
```

If `portrait` is empty or removed, the app shows the current initials placeholder.
