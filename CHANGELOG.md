# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.1.1](https://github.com/joplin/plugin-templates/compare/v1.1.0...v1.1.1) (2021-08-11)


### Bug Fixes

* **release:** add scripts to sync version with manifest.json ([f849fe6](https://github.com/joplin/plugin-templates/commit/f849fe680a5e785b2d9dadee4939de511cef0574))
* **version:** update the version in manifest ([d5635f1](https://github.com/joplin/plugin-templates/commit/d5635f1c627c8d65800f35883b1e27c7e4b2847a))

## [1.1.0](https://github.com/joplin/plugin-templates/compare/v1.0.0...v1.1.0) (2021-08-11)


### Features

* add keyboard shortcuts for createNoteFromTemplate, createTodoFromTemplate ([941d2d2](https://github.com/joplin/plugin-templates/commit/941d2d239e462597cc20b12ca2374038463320b9)), closes [#18](https://github.com/joplin/plugin-templates/issues/18)


### Bug Fixes

* don't create provisional notes/todos while using templates ([3399aea](https://github.com/joplin/plugin-templates/commit/3399aead0ec33998997c373703d80e29282d579c))
* **legacy-templates:** improve the readme note ([#19](https://github.com/joplin/plugin-templates/issues/19)) ([7215777](https://github.com/joplin/plugin-templates/commit/7215777607f40845716cf8d4c94f3cdd3920c4ca))
* **parser:** display error message when template can't be parsed ([7dfcdf2](https://github.com/joplin/plugin-templates/commit/7dfcdf2d6fc4847f0aad45639361566f882e492c)), closes [#15](https://github.com/joplin/plugin-templates/issues/15)

## 1.0.0 (2021-08-06)


### Features

* add a dialog for showing default templates ([388e40e](https://github.com/joplin/plugin-templates/commit/388e40e40c81efe6e719da3b0e560a473e5e5c2a))
* add help option in menu ([b41a964](https://github.com/joplin/plugin-templates/commit/b41a9640f00b9124d25a2afdfa89bd178c764673))
* add menu items and settings for default templates ([a8fa7b6](https://github.com/joplin/plugin-templates/commit/a8fa7b6e2f266c73bac6f0c417dc4098e1011bb2))
* add template variables feature ([dc835d2](https://github.com/joplin/plugin-templates/commit/dc835d2e76fbb597048b046c0612fc5cee52bad7))
* add util functions for user template selection ([3ec3f98](https://github.com/joplin/plugin-templates/commit/3ec3f983d6a336464fd00e72303587e7288bcbdf))
* allow cancelling while taking variable inputs ([99d10a2](https://github.com/joplin/plugin-templates/commit/99d10a202c5f477b1188696955b0b9344a9e8a29))
* allow creating templates in other notebooks ([beb6d63](https://github.com/joplin/plugin-templates/commit/beb6d639c80c7afb1cbbd3e1f6fef8ef7a78028e))
* automatically load previous templates ([53e743e](https://github.com/joplin/plugin-templates/commit/53e743e5b1825ae2c7c15fad07d1e396d683b6c9))
* complete newTodoFromTemplate, newNoteFromTemplate, insertTemplate functions ([1eeed0e](https://github.com/joplin/plugin-templates/commit/1eeed0e69beba172b85a190499c7e0246bdbc2be))
* create commands to set default templates, create notes ([d826b85](https://github.com/joplin/plugin-templates/commit/d826b858adc75c234316f9c86d394601db1150d6))
* display template name in variable input dialog ([5612f36](https://github.com/joplin/plugin-templates/commit/5612f3650de78ae0986d550bc35b58e39c287f40))
* integrate handlebars and ensure all existing templates are compatible ([8053a5c](https://github.com/joplin/plugin-templates/commit/8053a5cf555f1aabc4de52611e2d813bce44f153))
* minor ui improvements ([a56206a](https://github.com/joplin/plugin-templates/commit/a56206a86bcc00dddc4e64900df34285cbe8e628))
* remove templates notebook functionality ([abd49e3](https://github.com/joplin/plugin-templates/commit/abd49e36631e32b22007e9ecf253a60f27e6d76c))
* store templates in a special folder ([ddfd51a](https://github.com/joplin/plugin-templates/commit/ddfd51a404c0ff6ad0ca9d189a4de960cab46ced))


### Bug Fixes

* **#1:** typo in function name ([4efaa84](https://github.com/joplin/plugin-templates/commit/4efaa84e0d7adc7dbd1a7a7eab2c3ea3fe638246)), closes [#1](https://github.com/joplin/plugin-templates/issues/1)
* allow users to set an existing notebook as the templates notebook ([5396a4a](https://github.com/joplin/plugin-templates/commit/5396a4a4ab6962d46caab5e9fd0ab8193f5bf2ea))
* bug while creating a new template tag ([21891f2](https://github.com/joplin/plugin-templates/commit/21891f2b181d10090b6f2f8e40de5f36c3f9c1bc))
* encode text in html ([ff2bc1f](https://github.com/joplin/plugin-templates/commit/ff2bc1fbfb2e47eb46a0e380802c4d31a97150b9))
* indentation in legacy templates readme ([b47f537](https://github.com/joplin/plugin-templates/commit/b47f5375b0135ecfc6fdfd6695e1734f5960e612))
* minor fixes in default templates feature ([56f9ebe](https://github.com/joplin/plugin-templates/commit/56f9ebe887e29cd77c27648b81e666ac3e4fe27d))
* update legacy templates readme ([f15ddd9](https://github.com/joplin/plugin-templates/commit/f15ddd995539170eaade59277cf94afdeed2f2e1))
* update the app_min_version ([3046bc3](https://github.com/joplin/plugin-templates/commit/3046bc3062801ee2f3e56e972e9cf2725ffb58ea))
