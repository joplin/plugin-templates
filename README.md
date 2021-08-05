<h1 align="center">
    Templates Plugin
    <br/>
    <center>
        <img src="https://github.com/joplin/plugin-templates/actions/workflows/ci.yml/badge.svg">
        <a href="https://npmjs.com/package/joplin-plugin-templates"><img src="https://badge.fury.io/js/joplin-plugin-templates.svg" alt="npm version"></a>
    </center>
</h1>

This plugin allows you to create templates in Joplin and use them to create new notes and todos.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
  - [Template variables](#template-variables)
    - [In-Built variables](#in-built-variables)
    - [Custom variables](#custom-variables)
  - [Default Templates](#default-templates)
- [FAQ](#faq)
  - [Importing templates from a previous version of Joplin](#importing-templates-from-a-previous-version-of-joplin)
- [Contributing](#contributing)

## Installation
- Open Joplin
- Go to Tools > Options > Plugins
- Search for `templates`
- Click Install plugin
- Restart Joplin to enable the plugin

## Usage

You can create templates by creating notes with your template content and assigning them a tag titled `template`.

You can see the templates menu in the `Tools` category. Other features of the plugin are explained below.

## Features

### Template variables

#### In-Built variables
You can create templates with variables. Refer the following example.

```markdown
Date: {{date}}
Hours:
Details:
```

The currently supported in-built template variables are:

| Variable | Description | Example |
| --- | --- | --- |
| `{{date}}` | Today's date formatted based on the settings format | 2019-01-01 |
| `{{time}}` | Current time formatted based on the settings format | 13:00 |
| `{{datetime}}` | Current date and time formatted based on the settings format | 01/01/19 1:00 PM |
| `{{#custom_datetime}}` | Current date and/or time formatted based on a supplied string (using [moment.js](https://momentjs.com/) formatting) | `{{#custom_datetime}}M d{{/custom_datetime}}` |
| `{{bowm}}` | Date of the beginning of the week (when week starts on Monday) based on the settings format | |
| `{{bows}}` | Date of the beginning of the week (when week starts on Sunday) based on the settings format | |

#### Custom variables
You can also define custom variables in your template that you can give a value for while using the template. Refer the following example

```markdown
---
name: text
color: enum(Red, Yellow, Green)

---

Hi there, {{ name }}. Your favorite color is {{ color }}. This note/to-do was created on {{ datetime }}.
```

The currently supported custom variable types are:

| Type | Example |
| --- | --- |
| `text` | name: text |
| `number` | count: number |
| `boolean` | show_summary: boolean |
| `enum` | color: enum(Red, Yellow) |

> **NOTE**: If you declare a custom variable with same name as the in-built variables, the custom variable value will be used.

Internally, [Handlebars.Js](https://handlebarsjs.com/) is used to compile the templates. You can write your templates that are compatible with `Handlebars`.

### Default Templates
You can define the templates you use the most as the default templates. Currently you can have two default templates. One for `notes` and one for `to-dos`. There are keyboard shortcuts, so that you can quickly create a new note/to-do with the respective default template.

## FAQ
### Importing templates from a previous version of Joplin
If you used templates in a version of Joplin that had this feature in the main application itself. Your templates will automatically be imported and saved in a new notebook created by this plugin.

## Contributing
Contributions to this plugin are most welcome. Feel free to open a pull request or an issue. Make sure to use [conventional commit messages](https://github.com/pvdlg/conventional-commit-types) if you're creating a pull request.
