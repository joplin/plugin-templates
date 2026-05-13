<h1 align="center">
    模板插件
    <br/>
    <center>
        <img src="https://github.com/joplin/plugin-templates/actions/workflows/ci.yml/badge.svg">
        <a href="https://npmjs.com/package/joplin-plugin-templates"><img src="https://badge.fury.io/js/joplin-plugin-templates.svg" alt="npm version"></a>
        <img src="https://img.shields.io/badge/dynamic/json?color=brightgreen&label=downloads&query=%24.totalDownloads&url=https%3A%2F%2Fjoplin-plugin-downloads.vercel.app%2Fapi%3Fplugin%3Djoplin.plugin.templates">
    </center>
</h1>

这个插件允许你在 Joplin 中创建模板，并使用它们来创建新的笔记和待办事项。

> **📚 刚接触这个插件？** 查看 [Templates AI Assistant](https://joplin-templates-assistant.nishantwrp.com)，使用 AI 创建模板而无需自己学习模板语法。

## 目录

- [安装插件](#安装插件)
- [导入旧版模板](#导入旧版模板)
- [使用模板插件](#使用模板插件)
  - [添加新模板](#添加新模板)
  - [使用模板](#使用模板)
- [功能特性](#功能特性)
  - [模板变量](#模板变量)
    - [内置变量](#内置变量)
    - [自定义变量](#自定义变量)
      - [高级用法](#高级用法)
    - [特殊变量](#特殊变量)
  - [高级模板功能（助手）](#高级模板功能助手)
    - [比较助手](#比较助手)

## 安装插件

1. 打开 Joplin
2. 进入 "工具" > "选项" > "插件"
3. 搜索 "Templates"
4. 点击 "安装"

## 导入旧版模板

如果你之前使用过旧版模板插件，可以导入现有模板：

1. 打开 Joplin
2. 进入 "工具" > "模板" > "导入旧版模板"
3. 选择要导入的模板

## 使用模板插件

### 添加新模板

1. 创建一个新笔记或待办事项
2. 编写你想要的模板内容
3. 右键点击笔记 > "保存为模板"
4. 输入模板名称并保存

### 使用模板

1. 创建新笔记或待办事项
2. 右键点击 > "从模板创建"
3. 选择你想要的模板
4. 模板内容将被插入到新笔记中

## 功能特性

### 模板变量

模板支持多种变量，可以在创建笔记时自动替换。

#### 内置变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{title}}` | 笔记标题 | 我的笔记 |
| `{{body}}` | 笔记内容 | 原始内容 |
| `{{date}}` | 当前日期 | 2026-05-13 |
| `{{time}}` | 当前时间 | 14:30:00 |
| `{{datetime}}` | 当前日期和时间 | 2026-05-13 14:30:00 |
| `{{year}}` | 当前年份 | 2026 |
| `{{month}}` | 当前月份 | 05 |
| `{{day}}` | 当前日期 | 13 |
| `{{hour}}` | 当前小时 | 14 |
| `{{minute}}` | 当前分钟 | 30 |
| `{{second}}` | 当前秒 | 00 |

#### 自定义变量

你可以定义自己的变量：

```markdown
# {{project_name}} - {{task_type}}

## 描述
{{description}}

## 优先级
{{priority}}

## 截止日期
{{due_date}}
```

##### 高级用法

使用条件语句和循环：

```markdown
{{#if high_priority}}
## ⚠️ 高优先级任务
{{else}}
## 普通任务
{{/if}}

## 待办事项
{{#each tasks}}
- [ ] {{this}}
{{/each}}
```

#### 特殊变量

| 变量 | 说明 |
|------|------|
| `{{uuid}}` | 生成唯一 ID |
| `{{random}}` | 生成随机数 |
| `{{clipboard}}` | 剪贴板内容 |

### 高级模板功能（助手）

#### 比较助手

使用比较助手来比较值：

```markdown
{{#compare priority "===" "high"}}
## 🔴 高优先级
{{/compare}}

{{#compare status "===" "done"}}
## ✅ 已完成
{{/compare}}
```

## 示例模板

### 每日笔记模板

```markdown
# {{date}} 每日笔记

## 今日目标
- [ ] 目标 1
- [ ] 目标 2
- [ ] 目标 3

## 笔记


## 今日总结


## 明日计划
- [ ] 
```

### 会议记录模板

```markdown
# 会议记录 - {{date}}

## 参与者


## 议程
1. 
2. 
3. 

## 讨论要点


## 行动项
- [ ] @负责人 - 任务描述 - 截止日期

## 下次会议
- 日期：
- 时间：
```

### 项目模板

```markdown
# {{project_name}}

## 项目概述


## 目标


## 技术栈


## 开发计划
- [ ] 阶段 1：
- [ ] 阶段 2：
- [ ] 阶段 3：

## 参考资料
- 
```

## 许可证

MIT

---

> 项目地址：[joplin/plugin-templates](https://github.com/joplin/plugin-templates)
> npm 包：[joplin-plugin-templates](https://www.npmjs.com/package/joplin-plugin-templates)
