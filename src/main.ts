import { getConfig, setupSettings, type EinkConfig } from "./settings"

/** 主题在主题列表中显示的名称 */
const THEME_NAME = "E-Ink"
/** 主题 CSS 文件名（相对插件 dist 目录） */
const THEME_FILE = "eink.css"

/** 各开关对应的 body class（样式在 eink-toggles.css 中定义） */
const TOGGLE_CLASSES: Record<keyof EinkConfig, string> = {
  outlineButtons: "eink-outline-buttons",
  disableAnimations: "eink-no-anim",
  removeShadows: "eink-no-shadow",
  underlineLinks: "eink-underline-links",
  grayscaleMedia: "eink-grayscale-media",
  highContrastSelection: "eink-hc-selection",
  hideIcons: "eink-hide-icons",
}

let pluginName = ""
let unsubscribe: (() => void) | null = null
let headObserver: MutationObserver | null = null
let applyTimer: ReturnType<typeof setTimeout> | undefined

export async function load(name: string) {
  pluginName = name

  await setupSettings(pluginName)

  // 注册主题（避免与已有同名主题冲突）
  if (orca.state.themes[THEME_NAME] == null) {
    orca.themes.register(pluginName, THEME_NAME, THEME_FILE)
  }

  // 注入开关样式（规则以 body class 作用域限定，未开启时无副作用）
  orca.themes.injectCSSResource(`${pluginName}/dist/eink-toggles.css`, pluginName)

  // 设置变更时重新应用开关
  const { subscribe } = window.Valtio
  const pluginState = orca.state.plugins[pluginName]
  if (pluginState) {
    unsubscribe = subscribe(pluginState, () => scheduleApply())
  }

  // 监听 <head> 变化以感知主题切换（主题 CSS 通过 head 中的样式表加载）
  headObserver = new MutationObserver(() => scheduleApply())
  headObserver.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"],
  })

  applyToggles()

  console.log(`[eink-theme] ${pluginName} 已加载`)
}

export async function unload() {
  headObserver?.disconnect()
  headObserver = null
  unsubscribe?.()
  unsubscribe = null
  clearTimeout(applyTimer)

  for (const cls of Object.values(TOGGLE_CLASSES)) {
    document.body.classList.remove(cls)
  }
  orca.themes.removeCSSResources(pluginName)
  orca.themes.unregister(THEME_NAME)

  console.log(`[eink-theme] ${pluginName} 已卸载`)
}

/** 防抖调度：主题切换时样式表加载需要时间，延迟后再检测 */
function scheduleApply() {
  clearTimeout(applyTimer)
  applyTimer = setTimeout(applyToggles, 150)
}

/** 检测当前是否选中了墨水屏主题（主题 CSS 会在 :root 上设置标记变量） */
function isThemeActive(): boolean {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--eink-theme-flag")
      .trim() === "1"
  )
}

/** 按「主题是否激活 + 各开关设置」同步 body class */
function applyToggles() {
  const active = isThemeActive()
  const config = getConfig(pluginName)

  for (const key of Object.keys(TOGGLE_CLASSES) as (keyof EinkConfig)[]) {
    document.body.classList.toggle(TOGGLE_CLASSES[key], active && config[key])
  }
}
