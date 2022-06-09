# Dialog Flow Designer

This branch contains the work on the brand-new experimental UI for the extension. Currently, it is not in a usable state yet.

## Development

First, make sure you have the requirements installed:
 - Node v14.8+
 - Python 3.7+
 - [PNPM](https://pnpm.io/)

This project uses [pnpm workspaces](https://pnpm.io/workspaces). After cloning run the install command in the project root:

```bash
pnpm install
```

Then to develop the extension (watch mode):

```bash
pnpm run dev:vsc # With run commands you don't have to use pnpm
```

And to open the development version of the extension in VSCode:

```bash
cd packages/extension
code --extensionDevelopmentPath=$(pwd) --disable-extensions # Remove the $ for fish
```

The editor has a storybook. To view it locally run:

```bash
pnpm run storybook
```