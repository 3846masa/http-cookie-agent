# [3.0.0](https://github.com/3846masa/http-cookie-agent/compare/v2.1.2...v3.0.0) (2022-05-07)


### Features

* change import path for node:http ([#105](https://github.com/3846masa/http-cookie-agent/issues/105)) ([6260bdc](https://github.com/3846masa/http-cookie-agent/commit/6260bdc1c5fad2a466922e51d5ec260348725e75))
* update README and add MIGRATION GUIDES ([#110](https://github.com/3846masa/http-cookie-agent/issues/110)) ([cb03a9f](https://github.com/3846masa/http-cookie-agent/commit/cb03a9fd4163ea57b9cb945fd2fd79c779cbac4a))
* use cookiejar synchronous functions by default ([#107](https://github.com/3846masa/http-cookie-agent/issues/107)) ([2bf68bb](https://github.com/3846masa/http-cookie-agent/commit/2bf68bb28a8f5e0209a294d6d6430cf61a95ed9e))


### BREAKING CHANGES

* see MIGRATION.md for more details.
* The property name for passing cookiejar to agent has been changed.
* Changed to use cookiejar synchronous functions by default. If you use an asynchronous cookiejar store, set cookies.async_UNSTABLE to true.
* you should import `'http-cookie-agent/node:http'` instead of `'http-cookie-agent'`.

## [2.1.2](https://github.com/3846masa/http-cookie-agent/compare/v2.1.1...v2.1.2) (2022-05-07)


### Bug Fixes

* loose the validation of CookieOptions.jar so that different versions of CookieJar can be used. ([#108](https://github.com/3846masa/http-cookie-agent/issues/108)) ([adc4b74](https://github.com/3846masa/http-cookie-agent/commit/adc4b74b6cf512e81692a7e906c8a6263080c666))

## [2.1.1](https://github.com/3846masa/http-cookie-agent/compare/v2.1.0...v2.1.1) (2022-05-07)


### Bug Fixes

* fix type definition for undici ([#106](https://github.com/3846masa/http-cookie-agent/issues/106)) ([4748df9](https://github.com/3846masa/http-cookie-agent/commit/4748df9317169c9c72813c514d21a9fe68c629a0))

# [2.1.0](https://github.com/3846masa/http-cookie-agent/compare/v2.0.0...v2.1.0) (2022-05-06)


### Features

* support undici ([#97](https://github.com/3846masa/http-cookie-agent/issues/97)) ([8b8c333](https://github.com/3846masa/http-cookie-agent/commit/8b8c33351cf320f6dce70d2ea4ee46b37e07d0dd))

# [2.0.0](https://github.com/3846masa/http-cookie-agent/compare/v1.0.6...v2.0.0) (2022-05-02)


### Features

* drop Node.js v12 support ([#91](https://github.com/3846masa/http-cookie-agent/issues/91)) ([c722050](https://github.com/3846masa/http-cookie-agent/commit/c72205072026981518c5f8586d970cf7a2632cfd))


### BREAKING CHANGES

* drop Node.js v12 support, please use v14.18.0 or above

## [1.0.6](https://github.com/3846masa/http-cookie-agent/compare/v1.0.5...v1.0.6) (2022-05-02)


### Bug Fixes

* send data correctly when keepalive is enabled ([#90](https://github.com/3846masa/http-cookie-agent/issues/90)) ([b245a77](https://github.com/3846masa/http-cookie-agent/commit/b245a77d43a4f167d11bcadbf2104fd9beee2283))

## [1.0.5](https://github.com/3846masa/http-cookie-agent/compare/v1.0.4...v1.0.5) (2022-02-27)


### Bug Fixes

* **deps:** update actions/setup-node action to v3 ([#66](https://github.com/3846masa/http-cookie-agent/issues/66)) ([90a87fa](https://github.com/3846masa/http-cookie-agent/commit/90a87fa413106f48963b291da42ac2844c1eecc0))

## [1.0.4](https://github.com/3846masa/http-cookie-agent/compare/v1.0.3...v1.0.4) (2021-12-25)


### Bug Fixes

* fix type definition ([#43](https://github.com/3846masa/http-cookie-agent/issues/43)) ([b7ab28d](https://github.com/3846masa/http-cookie-agent/commit/b7ab28d26e7b9d4fc95c71b082544424681f1150))

## [1.0.3](https://github.com/3846masa/http-cookie-agent/compare/v1.0.2...v1.0.3) (2021-10-30)


### Bug Fixes

* avoid to url-encode cookie value ([#27](https://github.com/3846masa/http-cookie-agent/issues/27)) ([1c1da5c](https://github.com/3846masa/http-cookie-agent/commit/1c1da5c6ff4ead4824250b9418b48433b5b84508))

## [1.0.2](https://github.com/3846masa/http-cookie-agent/compare/v1.0.1...v1.0.2) (2021-10-14)


### Bug Fixes

* fix supported node version ([#21](https://github.com/3846masa/http-cookie-agent/issues/21)) ([ba78fc1](https://github.com/3846masa/http-cookie-agent/commit/ba78fc1e70fd0d7d6b3a27ae587dd3cd8607a754)), closes [/github.com/3846masa/axios-cookiejar-support/issues/420#issuecomment-943350949](https://github.com//github.com/3846masa/axios-cookiejar-support/issues/420/issues/issuecomment-943350949)

## [1.0.1](https://github.com/3846masa/http-cookie-agent/compare/v1.0.0...v1.0.1) (2021-09-23)


### Bug Fixes

* send cookies even when target is same host but different port ([#11](https://github.com/3846masa/http-cookie-agent/issues/11)) ([bb1b8f3](https://github.com/3846masa/http-cookie-agent/commit/bb1b8f3bd8538994dc0e850c3dc66bb12336c54e))

# 1.0.0 (2021-09-12)


### Features

* first commit ([5303daf](https://github.com/3846masa/http-cookie-agent/commit/5303daf5bd38516205665b02964ac84898da128b))
