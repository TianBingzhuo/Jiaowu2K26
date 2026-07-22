# 智课工坊 Demo Pack

这是智课工坊黑客松演示用的初始数据包。当前版本先放可被前后端直接 mock 的文本与 JSON；音频、PPT、截图、录屏等二进制素材后续补入对应目录。

## 目录

```text
demo-pack/
  source/      原始或预处理输入
  golden/      预生成结果，用于 semi-live 和 fallback
  metrics/     生成耗时、成本、质量记录
  fallback/    录屏和截图说明
```

## 使用方式

1. 后端可直接读取 `golden/player_data_bst.json` 作为 `/api/lessons/bst-001/player-data` 返回值。
2. 教师审核页可读取 `golden/script_bst.json`。
3. 出题服务可读取 `golden/quiz_bst.json`。
4. 复习指南页可读取 `golden/review_guide_bst.md`。
5. “可信AI/考试信号”展示可读取 `golden/exam_signal_bst.json` 和 `golden/source_trace_bst.json`。
6. “证据模式”可读取 `golden/evidence_bundle_bst.json`，一口气拿到生成对象、证据来源和老师审核建议。

## Demo 主线

- 课程：《数据结构与算法》
- 课时：二叉搜索树的查找与插入
- 现场展示：教师审核脚本 -> 学生播放动画 -> 弹出题目 -> 查看解析 -> 展示代码练习或复习卡
- 亮点展示：老师口头重点 -> S级考试信号 -> 自动进入复习卡和题目
- 可信展示：点击任意脚本/题目旁的“查看证据” -> 展示 PPT 页、口播原文、置信度和老师审核动作

## 待补素材

- `source/bst_lecture_audio.mp3`
- `source/bst_lecture_slides.pptx`
- `fallback/demo_video_90s.mp4`
- `fallback/screenshots/*.png`
