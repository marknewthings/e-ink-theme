const settingsSchema = {
  outlineButtons: {
    label: "实心按钮描边化",
    description: "将大块黑色实心按钮转为「黑色边线 + 纯白底色 + 纯黑字色」样式，减少墨水屏上的大面积涂黑。",
    type: "boolean",
    defaultValue: true
  },
  disableAnimations: {
    label: "关闭动画与过渡",
    description: "禁用界面动画和过渡效果，避免墨水屏低刷新率下的残影与闪烁。",
    type: "boolean",
    defaultValue: true
  },
  removeShadows: {
    label: "去除阴影",
    description: "弹窗、菜单等的阴影改为纯黑细边框，避免阴影在墨水屏上形成灰色噪点。",
    type: "boolean",
    defaultValue: true
  },
  underlineLinks: {
    label: "链接加下划线",
    description: "黑白界面失去颜色区分后，为链接与块引用加下划线以便识别。",
    type: "boolean",
    defaultValue: true
  },
  grayscaleMedia: {
    label: "图片灰度化",
    description: "将笔记中的图片、视频等多媒体转为灰度显示，与黑白界面保持一致。",
    type: "boolean",
    defaultValue: true
  },
  highContrastSelection: {
    label: "高对比选区",
    description: "文字选区使用黑底白字，适合灰阶表现较差的墨水屏。",
    type: "boolean",
    defaultValue: false
  },
  hideIcons: {
    label: "隐藏图标",
    description: "隐藏侧边栏收藏/标签/页面列表图标、编辑区页面图标、链接图标与标签标记图标，进一步减少视觉干扰。",
    type: "boolean",
    defaultValue: false
  }
};
function getConfig(pluginName2) {
  const settings = orca.state.plugins[pluginName2]?.settings ?? {};
  return {
    outlineButtons: settings.outlineButtons !== false,
    disableAnimations: settings.disableAnimations !== false,
    removeShadows: settings.removeShadows !== false,
    underlineLinks: settings.underlineLinks !== false,
    grayscaleMedia: settings.grayscaleMedia !== false,
    highContrastSelection: settings.highContrastSelection === true,
    hideIcons: settings.hideIcons === true
  };
}
async function setupSettings(pluginName2) {
  await orca.plugins.setSettingsSchema(pluginName2, settingsSchema);
}
const THEME_NAME = "E-Ink";
const THEME_FILE = "eink.css";
const TOGGLE_CLASSES = {
  outlineButtons: "eink-outline-buttons",
  disableAnimations: "eink-no-anim",
  removeShadows: "eink-no-shadow",
  underlineLinks: "eink-underline-links",
  grayscaleMedia: "eink-grayscale-media",
  highContrastSelection: "eink-hc-selection",
  hideIcons: "eink-hide-icons"
};
let pluginName = "";
let unsubscribe = null;
let headObserver = null;
let applyTimer;
async function load(name) {
  pluginName = name;
  await setupSettings(pluginName);
  if (orca.state.themes[THEME_NAME] == null) {
    orca.themes.register(pluginName, THEME_NAME, THEME_FILE);
  }
  orca.themes.injectCSSResource(`${pluginName}/dist/eink-toggles.css`, pluginName);
  const { subscribe } = window.Valtio;
  const pluginState = orca.state.plugins[pluginName];
  if (pluginState) {
    unsubscribe = subscribe(pluginState, () => scheduleApply());
  }
  headObserver = new MutationObserver(() => scheduleApply());
  headObserver.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"]
  });
  applyToggles();
  console.log(`[eink-theme] ${pluginName} 已加载`);
}
async function unload() {
  headObserver?.disconnect();
  headObserver = null;
  unsubscribe?.();
  unsubscribe = null;
  clearTimeout(applyTimer);
  for (const cls of Object.values(TOGGLE_CLASSES)) {
    document.body.classList.remove(cls);
  }
  orca.themes.removeCSSResources(pluginName);
  orca.themes.unregister(THEME_NAME);
  console.log(`[eink-theme] ${pluginName} 已卸载`);
}
function scheduleApply() {
  clearTimeout(applyTimer);
  applyTimer = setTimeout(applyToggles, 150);
}
function isThemeActive() {
  return getComputedStyle(document.documentElement).getPropertyValue("--eink-theme-flag").trim() === "1";
}
function applyToggles() {
  const active = isThemeActive();
  const config = getConfig(pluginName);
  for (const key of Object.keys(TOGGLE_CLASSES)) {
    document.body.classList.toggle(TOGGLE_CLASSES[key], active && config[key]);
  }
}
export {
  load,
  unload
};
