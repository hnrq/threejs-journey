import { readdir } from 'fs/promises';
import { writeFileSync } from 'fs';
import path from 'path';

const formatDirNames = (name) =>
  `${name.charAt(3).toUpperCase()}${name.substring(4)}`.replace('-', ' ');

const lessons = await Promise.all(
  (await readdir(path.resolve('src', 'pages'), { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map(async (dirent) => {
      const lessons = (
        await readdir(path.resolve('src', 'pages', dirent.name), {
          withFileTypes: true,
        })
      )
        .filter((dirent) => dirent.isDirectory())
        .reduce(
          (acc, { name }) =>
            `${acc}\t<li><a href="src/page/${dirent.name}/${name}">${formatDirNames(
              name,
            )}</a></li>\n`,
          '',
        );

      return `### ${formatDirNames(dirent.name)}\n<ol>\n${lessons}</ol>`;
    }),
);

const readmeTemplate = `
![Header](src/assets/header.png)

# Three.js Journey
All the classes I've done on Three.JS Journey, but with Astro (and Threlte!)

## Completed lessons
${lessons}

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                      | Action                                               |
| :--------------------------- | :--------------------------------------------------- |
| \`pnpm install\`             | Installs dependencies                                |
| \`pnpm run dev\`             | Starts local dev server at \`localhost:4321\`        |
| \`pnpm run build\`           | Build your production site to \`./dist/\`            |
| \`pnpm run preview\`         | Preview your build locally, before deploying         |
| \`pnpm run astro ...\`       | Run CLI commands like \`astro add\`, \`astro check\` |
| \`pnpm run astro -- --help\` | Get help using the Astro CLI                         |
`;

writeFileSync(path.resolve('README.md'), readmeTemplate);