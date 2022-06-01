const { mergeConfig } = require("vite");
const WindiCSS = require("vite-plugin-windicss").default;
const Icons = require("unplugin-icons/vite");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-vite",
  },
  features: {
    storyStoreV7: true,
  },

  // Custom vite config
  // IMPORTANT: Keep this in sync with vite.config.ts
  async viteFinal(config, { configType }) {
    // return the customized config
    return mergeConfig(config, {
      plugins: [WindiCSS(), Icons({ compiler: "jsx", jsx: "react" })],
    });
  },
};
