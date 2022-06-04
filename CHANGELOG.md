# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.3.0](https://github.com/joplin/plugin-templates/compare/v2.2.1...v2.3.0) (2022-06-04)


### Features

* allow using notebook for storing templates ([#63](https://github.com/joplin/plugin-templates/issues/63)) ([fd8c40c](https://github.com/joplin/plugin-templates/commit/fd8c40c2a8d8b479e3e238f2b443bc5bedd82abf)), closes [#62](https://github.com/joplin/plugin-templates/issues/62)


### Bug Fixes

* do not bundle .env with npm package ([51cc799](https://github.com/joplin/plugin-templates/commit/51cc799430c09e54fd33072d2bfa7bf71e01f16e))

### [2.2.1](https://github.com/joplin/plugin-templates/compare/v2.2.0...v2.2.1) (2022-01-25)


### Bug Fixes

* **#55:** handle empty tags in special variables ([2aec687](https://github.com/joplin/plugin-templates/commit/2aec687b6348a91f8a1e5f90305c8709fd428bf1)), closes [#55](https://github.com/joplin/plugin-templates/issues/55)
* set a max height for variables form ([0aa28b4](https://github.com/joplin/plugin-templates/commit/0aa28b4674d3907c2dc6c5078c67c87af4243f7b))

## [2.2.0](https://github.com/joplin/plugin-templates/compare/v2.1.2...v2.2.0) (2021-10-09)


### Features

* enable template_tags variable while inserting templates ([2f9863f](https://github.com/joplin/plugin-templates/commit/2f9863f72e540747372111da98f2cf5b828e167e)), closes [#48](https://github.com/joplin/plugin-templates/issues/48)

### [2.1.2](https://github.com/joplin/plugin-templates/compare/v2.1.1...v2.1.2) (2021-10-09)


### Bug Fixes

* **#49:** id not copied in newer versions of electron ([b2cd8e2](https://github.com/joplin/plugin-templates/commit/b2cd8e2ff23c7e5dd087a938efa4d13d160e7838)), closes [#49](https://github.com/joplin/plugin-templates/issues/49)

### [2.1.1](https://github.com/joplin/plugin-templates/compare/v2.1.0...v2.1.1) (2021-10-02)


### Bug Fixes

* bugs in copyFolderID command ([#47](https://github.com/joplin/plugin-templates/issues/47)) ([78a93e6](https://github.com/joplin/plugin-templates/commit/78a93e68c9398763ebbf61a903bd6bea40231669))

## [2.1.0](https://github.com/joplin/plugin-templates/compare/v2.0.0...v2.1.0) (2021-09-25)


### Features

* allow setting a target notebook for a template ([add6534](https://github.com/joplin/plugin-templates/commit/add65341a3fda5220a7fa0a4ce0c4359800dea48))
* introduce date and time variable types ([55cc646](https://github.com/joplin/plugin-templates/commit/55cc646ab0ec369ae029b8b77395d4c3da5483a2)), closes [#43](https://github.com/joplin/plugin-templates/issues/43)

## [2.0.0](https://github.com/joplin/plugin-templates/compare/v1.1.4...v2.0.0) (2021-08-26)


### Features

* add support for adding labels for custom variables ([b138110](https://github.com/joplin/plugin-templates/commit/b1381101c708b34756b0460bacee8e0bda7024ab)), closes [#30](https://github.com/joplin/plugin-templates/issues/30)
* allow specifying title and tags in templates ([c36dea0](https://github.com/joplin/plugin-templates/commit/c36dea071cb1a4b2e20b79f5114a8b9d10e4bbc1))
* use `dropdown` instead of `enum` for better user experience ([c009fc9](https://github.com/joplin/plugin-templates/commit/c009fc955703f757c4e9544eece61553af16a433)), closes [#7](https://github.com/joplin/plugin-templates/issues/7)


### Bug Fixes

* auto wrap special variable values in double quotes ([720eea2](https://github.com/joplin/plugin-templates/commit/720eea2fbcdb58921558e9f496e5c0304414ccf4))
* ignore eslint errors for \S ([dd98f44](https://github.com/joplin/plugin-templates/commit/dd98f44ded164f17d166d1442e7447c15e33b849))
* **parser:** update the regex used to find special variables ([cb3d677](https://github.com/joplin/plugin-templates/commit/cb3d67738fd5cf3a4bf58f1c3a8d75d5dfccb2d0))

### [1.1.4](https://github.com/joplin/plugin-templates/compare/v1.1.3...v1.1.4) (2021-08-16)


### Bug Fixes

* improve error messages in case of invalid variable names ([#32](https://github.com/joplin/plugin-templates/issues/32)) ([20b71b1](https://github.com/joplin/plugin-templates/commit/20b71b190b45a733c6af8d9b0f15f84ede572cb6)), closes [#29](https://github.com/joplin/plugin-templates/issues/29)
* reorder the templates menu ([c698d33](https://github.com/joplin/plugin-templates/commit/c698d33487fbdc5c1ef0d525566c650484fa326c)), closes [#25](https://github.com/joplin/plugin-templates/issues/25)
* sort the templates according to locale and enable numeric sorting ([#34](https://github.com/joplin/plugin-templates/issues/34)) ([91a4d0c](https://github.com/joplin/plugin-templates/commit/91a4d0cad5a27357f442d8f7ced54c541e914729))

### [1.1.3](https://github.com/joplin/plugin-templates/compare/v1.1.2...v1.1.3) (2021-08-14)


### Bug Fixes

* reduce the width of input fields ([7acc4b8](https://github.com/joplin/plugin-templates/commit/7acc4b857b4a707747d1fbd7fd01142615608828)), closes [#28](https://github.com/joplin/plugin-templates/issues/28)

### [1.1.2](https://github.com/joplin/plugin-templates/compare/v1.1.1...v1.1.2) (2021-08-12)


### Bug Fixes

* display sorted templates in the selector ([3f9a35c](https://github.com/joplin/plugin-templates/commit/3f9a35c7ef6eb3420c6aa0012604947b8c08ab09)), closes [#24](https://github.com/joplin/plugin-templates/issues/24)
* **template-variables:** log the necessary info if variables form is unable to load ([74d1124](https://github.com/joplin/plugin-templates/commit/74d1124e0f865f41acefe6657ab2155b4a41c63c))

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
