# Changelog

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.0.1] - 2025-12-07

### Fixed

- 修复玩家第二次签到时出现 "attempt to index a number value" 错误的问题
- 兼容 oxmysql 返回 DATE 字段为时间戳的情况

## [1.0.0] - 2024-12-07

### Added

- 每日签到奖励系统核心功能
- 支持连续签到奖励机制
- 支持自定义奖励配置
- 现代化 Web UI 界面
- 签到音效反馈
- MySQL 数据持久化
- 完整的配置文件支持

[Unreleased]: https://github.com/DyroS3/dy_daily_reward/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/DyroS3/dy_daily_reward/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/DyroS3/dy_daily_reward/releases/tag/v1.0.0
