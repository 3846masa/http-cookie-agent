## [6.0.4](https://github.com/3846masa/http-cookie-agent/compare/v6.0.3...v6.0.4) (2024-05-02)


### Bug Fixes

* removed async_UNSTABLE option because it is not working correctly ([#874](https://github.com/3846masa/http-cookie-agent/issues/874)) ([b5af18b](https://github.com/3846masa/http-cookie-agent/commit/b5af18bd94af0533ca73b0ac49c4fb4e55ce5d4d))

## [6.0.3](https://github.com/3846masa/http-cookie-agent/compare/v6.0.2...v6.0.3) (2024-04-04)


### Bug Fixes

* remove createRequire code to generate commonjs ([#843](https://github.com/3846masa/http-cookie-agent/issues/843)) ([5a32bf1](https://github.com/3846masa/http-cookie-agent/commit/5a32bf17e961450e3edd935c31a63a354d3a8d9c)), closes [#840](https://github.com/3846masa/http-cookie-agent/issues/840) [#842](https://github.com/3846masa/http-cookie-agent/issues/842)

## [6.0.2](https://github.com/3846masa/http-cookie-agent/compare/v6.0.1...v6.0.2) (2024-04-02)


### Bug Fixes

* **npm:** update dependency agent-base to ^7.1.1 ([#837](https://github.com/3846masa/http-cookie-agent/issues/837)) ([f3d0ca4](https://github.com/3846masa/http-cookie-agent/commit/f3d0ca4515c2d2c84a5d17751616f8affa92976d))

## [6.0.1](https://github.com/3846masa/http-cookie-agent/compare/v6.0.0...v6.0.1) (2024-01-11)


### Bug Fixes

* add undici v6 to peerdeps ([#731](https://github.com/3846masa/http-cookie-agent/issues/731)) ([7611216](https://github.com/3846masa/http-cookie-agent/commit/7611216f09a101e14ff6252d9f09399e183ea0ec))

# [6.0.0](https://github.com/3846masa/http-cookie-agent/compare/v5.0.4...v6.0.0) (2024-01-11)


### Features

* drop Node.js v14, v16 support ([#729](https://github.com/3846masa/http-cookie-agent/issues/729)) ([e32c407](https://github.com/3846masa/http-cookie-agent/commit/e32c40795fac0c9a4a4a4cdcf35dac864cfff7c3))


### BREAKING CHANGES

* Drop Node.js v14, v16 support

* fix: supports undici v6.2.1

close https://github.com/3846masa/http-cookie-agent/pull/706
close https://github.com/3846masa/http-cookie-agent/issues/728

## [5.0.4](https://github.com/3846masa/http-cookie-agent/compare/v5.0.3...v5.0.4) (2023-06-18)


### Bug Fixes

* change createCookieAgent types for http-proxy-agent v6 updates ([e7d97dd](https://github.com/3846masa/http-cookie-agent/commit/e7d97dd50095b6183ab70661c401c2583fb352b9))

## [5.0.3](https://github.com/3846masa/http-cookie-agent/compare/v5.0.2...v5.0.3) (2023-06-18)


### Bug Fixes

* **npm:** update dependency agent-base to v7 ([#505](https://github.com/3846masa/http-cookie-agent/issues/505)) ([3c10abf](https://github.com/3846masa/http-cookie-agent/commit/3c10abf9024501bfc6ae857e867e91cbd3d4a107))

## [5.0.2](https://github.com/3846masa/http-cookie-agent/compare/v5.0.1...v5.0.2) (2022-12-28)


### Bug Fixes

* add funding link to package.json ([#362](https://github.com/3846masa/http-cookie-agent/issues/362)) ([4d21726](https://github.com/3846masa/http-cookie-agent/commit/4d2172687cbd68728169038f9c6491900cfb437d))

## [5.0.1](https://github.com/3846masa/http-cookie-agent/compare/v5.0.0...v5.0.1) (2022-12-28)


### Bug Fixes

* **docs:** add funding link to README ([#361](https://github.com/3846masa/http-cookie-agent/issues/361)) ([8750722](https://github.com/3846masa/http-cookie-agent/commit/8750722666faa6dc4deb89475394550e2617b8cf))

# [5.0.0](https://github.com/3846masa/http-cookie-agent/compare/v4.0.2...v5.0.0) (2022-12-26)


### Bug Fixes

* support undici v5.11.0 ([#287](https://github.com/3846masa/http-cookie-agent/issues/287)) ([cdd4b6d](https://github.com/3846masa/http-cookie-agent/commit/cdd4b6ddbfa510568e3eb6395aa5a25fd30a4460))


### BREAKING CHANGES

* supports undici v5.11.0 or above only

## [4.0.2](https://github.com/3846masa/http-cookie-agent/compare/v4.0.1...v4.0.2) (2022-07-23)


### Bug Fixes

* **docs:** update dependency urllib to v3 ([#187](https://github.com/3846masa/http-cookie-agent/issues/187)) ([f7f7332](https://github.com/3846masa/http-cookie-agent/commit/f7f7332a8fe1922be029af37e562e1d1fcfb4411))

## [4.0.1](https://github.com/3846masa/http-cookie-agent/compare/v4.0.0...v4.0.1) (2022-05-21)


### Bug Fixes

* supports node.js global fetch since node.js v18.2.0 ([#127](https://github.com/3846masa/http-cookie-agent/issues/127)) ([05b669c](https://github.com/3846masa/http-cookie-agent/commit/05b669c6f9524a905ccdc52375d5420ec139347c))

# [4.0.0](https://github.com/3846masa/http-cookie-agent/compare/v3.0.0...v4.0.0) (2022-05-08)


### Bug Fixes

* fix import path for windows ([#112](https://github.com/3846masa/http-cookie-agent/issues/112)) ([3096d4f](https://github.com/3846masa/http-cookie-agent/commit/3096d4f8647ac6878fabcb54eea3faea21d3928e))


### BREAKING CHANGES

* `http-cookie-agent/http:node` cannot use on windows, so renamed `http-cookie-agent/http`

* ci: test on windows and macos environments

* chore: update MIGRATION.md

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
