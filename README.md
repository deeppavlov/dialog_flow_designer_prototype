# Dialog Flow Designer

This branch contains the work on the brand-new experimental UI for the extension. Currently, it is not in a usable state yet.

## Nighly builds

You can get a `vsix` build from the latest [commit here](https://nightly.link/deepmipt/dialog_flow_designer/workflows/vsix.yaml/main/extension-vsix.zip).

**Usage:**
 1. [Download](https://nightly.link/deepmipt/dialog_flow_designer/workflows/vsix.yaml/main/extension-vsix.zip) the build.
 2. Unzip the contents. There should be a single file named `dialog-flow-designer-vscode-x.x.x.vsix`.
 3. Open VSCode:
    1. Click the extensions tab on the left.
    2. Click the `...` icon on the top right.
    3. Select `Install from VSIX...` (the last option).
    4. Select the vsix file you just downloaded
 4. Close ALL VSCode windows you have open
 5. Reopen VSCode

## Testing

Right now, as the DF parser is work-in-progress, the extension works with YAML files, instead of Python scripts. The format for these YAML files is the same as the planned output for the [DF parser](https://github.com/kudep/dff-parser/tree/parser_output_v1).

For testing, you can use this [YAML file](https://raw.githubusercontent.com/deepmipt/dialog_flow_designer/main/packages/extension/test/parser_output.yaml). After you saved the file, open the containing folder in VSCode, right click, select `Open With...`, then in the new menu choose DF Designer. You should see the editor pop up right away.

## Development

For general information about development, see the [wiki](https://github.com/deepmipt/dialog_flow_designer/wiki).

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