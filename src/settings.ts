import type { PluginSettingsSchema } from "./orca"

/** 墨水屏主题的可选开关配置 */
export interface EinkConfig {
  /** 实心按钮描边化：黑边线、白底、黑字 */
  outlineButtons: boolean
  /** 关闭动画与过渡效果 */
  disableAnimations: boolean
  /** 去除阴影，弹窗改用纯黑边框 */
  removeShadows: boolean
  /** 链接与引用加下划线 */
  underlineLinks: boolean
  /** 图片与多媒体灰度化 */
  grayscaleMedia: boolean
  /** 高对比选区（黑底白字） */
  highContrastSelection: boolean
  /** 隐藏列表、编辑区与标签的图标 */
  hideIcons: boolean
}

export const settingsSchema: PluginSettingsSchema = {
  outlineButtons: {
    label: "实心按钮描边化",
    description:
      "将大块黑色实心按钮转为「黑色边线 + 纯白底色 + 纯黑字色」样式，减少墨水屏上的大面积涂黑。",
    type: "boolean",
    defaultValue: true,
  },
  disableAnimations: {
    label: "关闭动画与过渡",
    description: "禁用界面动画和过渡效果，避免墨水屏低刷新率下的残影与闪烁。",
    type: "boolean",
    defaultValue: true,
  },
  removeShadows: {
    label: "去除阴影",
    description: "弹窗、菜单等的阴影改为纯黑细边框，避免阴影在墨水屏上形成灰色噪点。",
    type: "boolean",
    defaultValue: true,
  },
  underlineLinks: {
    label: "链接加下划线",
    description: "黑白界面失去颜色区分后，为链接与块引用加下划线以便识别。",
    type: "boolean",
    defaultValue: true,
  },
  grayscaleMedia: {
    label: "图片灰度化",
    description: "将笔记中的图片、视频等多媒体转为灰度显示，与黑白界面保持一致。",
    type: "boolean",
    defaultValue: true,
  },
  highContrastSelection: {
    label: "高对比选区",
    description: "文字选区使用黑底白字，适合灰阶表现较差的墨水屏。",
    type: "boolean",
    defaultValue: false,
  },
  hideIcons: {
    label: "隐藏图标",
    description:
      "隐藏侧边栏收藏/标签/页面列表图标、编辑区页面图标、链接图标与标签标记图标，进一步减少视觉干扰。",
    type: "boolean",
    defaultValue: false,
  },
}

/** 实时读取插件配置（每次调用都从 orca.state 获取，配置修改后立即生效） */
export function getConfig(pluginName: string): EinkConfig {
  const settings = orca.state.plugins[pluginName]?.settings ?? {}

  return {
    outlineButtons: settings.outlineButtons !== false,
    disableAnimations: settings.disableAnimations !== false,
    removeShadows: settings.removeShadows !== false,
    underlineLinks: settings.underlineLinks !== false,
    grayscaleMedia: settings.grayscaleMedia !== false,
    highContrastSelection: settings.highContrastSelection === true,
    hideIcons: settings.hideIcons === true,
  }
}

export async function setupSettings(pluginName: string) {
  await orca.plugins.setSettingsSchema(pluginName, settingsSchema)
}
