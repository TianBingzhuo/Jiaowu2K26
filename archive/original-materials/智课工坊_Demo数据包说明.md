# 智课工坊 Demo 数据包说明

**用途**：为黑客松现场开发、演示、录屏和路演准备稳定素材  
**核心原则**：Demo 可以半 live，但所有关键结果必须有预生成 fallback  
**版本**：v1.0  
**日期**：2026-06-23

---

## 一、为什么需要 Demo 数据包

智课工坊的现场演示链路包含 ASR、LLM、动画、TTS、播放器、出题等多个不稳定环节。任何一个环节现场卡住，都会削弱产品可信度。

Demo 数据包的作用是：

- 保证核心路径随时可演示。
- 让前后端可以 mock-first 并行开发。
- 让路演 PPT 使用真实截图和真实输出。
- 让 Q&A 中的“生成质量、成本、耗时”有依据。

---

## 二、推荐目录结构

```text
demo-pack/
  README.md
  source/
    bst_lecture_audio.mp3
    bst_lecture_slides.pptx
    bst_transcript.md
    bst_slide_extract.json
  golden/
    script_bst.json
    quiz_bst.json
    player_data_bst.json
    evidence_bundle_bst.json
    review_guide_bst.md
  assets/
    lottie/
      teacher_idle.json
      tree_build.json
    audio/
      narration_bst.mp3
      bgm_light.mp3
    images/
      bst_tree.png
      teacher_avatar.png
  fallback/
    demo_video_full.mp4
    demo_video_90s.mp4
    screenshots/
      01_teacher_upload.png
      02_script_review.png
      03_student_player.png
      04_quiz_overlay.png
      05_code_playground.png
  metrics/
    run_log.csv
    api_cost_estimate.md
    quality_review.md
```

如果时间紧，至少准备 `source/`、`golden/`、`fallback/` 三个目录。

---

## 三、Demo 课程素材

### 课程设定

| 字段 | 内容 |
|------|------|
| 课程名 | 数据结构与算法 |
| 课时名 | 二叉搜索树的查找与插入 |
| 授课对象 | 大二计算机科学学生 |
| 片段长度 | 5-8 分钟 |
| 现场展示长度 | 60-90 秒 |
| 核心概念 | 左小右大、查找路径、插入节点 |
| 加分互动 | 选择题 + Python insert 函数 |

### 输入材料要求

| 文件 | 要求 | 备注 |
|------|------|------|
| `bst_lecture_audio.mp3` | 3-5 分钟，声音清晰 | 可自己录，不要用真实教师未授权录音 |
| `bst_lecture_slides.pptx` | 5-8 页，包含树图和伪代码 | 可自制简洁 PPT |
| `bst_transcript.md` | 人工校对后的转写稿 | ASR 失败时直接用 |
| `bst_slide_extract.json` | PPT 提取后的结构化文本 | PPT 解析失败时直接用 |

---

## 四、Golden Outputs

Golden outputs 是所有演示 fallback 的根。即使 live AI 调用失败，前端也能读取这些文件完成展示。

### `script_bst.json`

必须包含：
- lesson title
- scene list
- narration
- visual template
- quiz trigger
- duration

质量标准：
- 3-5 个 scene。
- 每个 scene 旁白不超过 120 字。
- 至少 2 个明确动画指令。
- 至少 1 个 quiz trigger。

### `quiz_bst.json`

必须包含：
- 单选题 2 道。
- 判断题 1 道。
- 编程题 1 道。
- 每题有答案和解析。

示例题目：

```json
{
  "question": "在二叉搜索树中，如果当前节点是 8，目标值是 5，下一步应该往哪里走？",
  "options": ["左子树", "右子树", "停止查找", "随机选择"],
  "answer_index": 0,
  "explanation": "因为 5 小于 8，二叉搜索树的规则要求进入左子树。"
}
```

### `player_data_bst.json`

这是学生播放器唯一依赖的数据源。前端优先保证它能渲染，而不是优先打通所有后端流程。

必须包含：
- scenes
- quizzes
- audio_url
- code_playground
- progress markers
- evidence_bundle_url

### `evidence_bundle_bst.json`

证据模式的数据源。它回答三个问题：

- 这段 AI 脚本、题目、复习卡来自哪里？
- 哪些内容来自老师口头重点？
- 老师审核时应该通过、修改还是移除？

必须包含：
- source_assets
- evidence_items
- generated_objects
- exam_signal_links
- ui_contract

### `review_guide_bst.md`

作为 P1 加分项。不要过长，现场只展示一屏：

```markdown
# 二叉搜索树复习卡

## S级重点
- 二叉搜索树规则：左子树所有节点 < 根节点 < 右子树所有节点
- 查找复杂度：平均 O(log n)，最坏 O(n)

## 高频题型
- 给定插入序列，画出 BST
- 给定目标值，写出查找路径
- 补全 insert 函数
```

---

## 五、Fallback 分级

| 级别 | 触发条件 | 展示方式 | 所需文件 |
|------|----------|----------|----------|
| Live | 网络/API/服务都正常 | 现场点击生成 | source + running app |
| Semi-live | AI 或 ASR 慢 | 点击后加载 golden output | golden JSON |
| Video | 系统崩溃或网络不可用 | 播放录屏 | `demo_video_90s.mp4` |
| Static | 视频也不可用 | PPT 截图讲解 | screenshots |

### 演示建议

实际路演建议用 semi-live：让评委看到你点击了按钮，但生成结果读取预加载数据。这样既像真实产品，又能控制节奏。

---

## 六、截图清单

PPT 至少需要 5 张真实产品截图：

| 截图 | 用途 | 画面重点 |
|------|------|----------|
| 教师上传页 | 证明入口简单 | 上传录音/PPT、进度条 |
| 脚本审核页 | 证明人在回路中 | 原始材料、AI脚本、编辑区 |
| 动画播放器 | 证明课程形态 | 角色/图形动画、字幕、进度 |
| 出题弹层 | 证明互动差异化 | 题目、选项、提交按钮 |
| 代码练习 | 证明大学编程课适配 | Monaco Editor、运行结果 |

截图要求：
- 统一浏览器宽度，建议 1440x900。
- 不出现 localhost 报错、console、未完成按钮。
- 不出现真实个人姓名、邮箱、学号。
- 文件名按展示顺序编号。

---

## 七、录屏脚本

### 90 秒路演版

| 时间 | 画面 | 话术 |
|------|------|------|
| 0-15s | 教师上传页 | “老师只需要上传一段课程录音或 PPT。” |
| 15-35s | 脚本审核页 | “AI 自动拆成知识点、旁白和动画指令，老师可修改后确认。” |
| 35-55s | 证据抽屉 | “每个 AI 输出都能追溯到 PPT 和老师口播。” |
| 55-75s | 动画播放器/出题弹层 | “学生看到的是短动画和即时题目，而不是 60 分钟录播。” |
| 75-90s | 复习指南/代码练习 | “老师口头强调的重点会进入复习卡和练习。” |

### 3 分钟展台版

展台版可以慢一点，加入：
- 生成耗时数据。
- 代码题运行。
- 复习指南。
- 架构图。
- 二维码/联系方式。

---

## 八、质量评审表

建议 Day4 晚上用 3 名同学或队友快速评审。

| 评审项 | 评分 1-5 | 通过线 | 备注 |
|--------|----------|--------|------|
| 脚本是否讲清楚 BST |  | >=4 | 不要求文采，要求准确 |
| 动画是否帮助理解 |  | >=3 | 可简洁，但不能乱 |
| 题目是否贴合刚讲内容 |  | >=4 | 不要泛泛而问 |
| 教师审核是否自然 |  | >=4 | 不能像后台管理 |
| 学生端是否有完成感 |  | >=3 | 有反馈、有进度 |
| 路演 90 秒是否顺 |  | >=4 | 不卡、不解释太多 |

---

## 九、指标记录

`metrics/run_log.csv` 建议记录以下字段：

```csv
run_id,date,input_type,input_minutes,asr_seconds,script_seconds,quiz_seconds,render_seconds,total_seconds,notes
001,2026-07-22,audio,3.5,42,18,9,12,81,semi-live baseline
```

`metrics/api_cost_estimate.md` 建议记录：
- ASR 成本或本地耗时。
- LLM input/output tokens。
- TTS 成本或本地耗时。
- 单节课总估算成本。

路演中只说保守范围，不说过度精确数字。

---

## 十、版权与隐私要求

必须遵守：

- 课程录音、PPT、图片尽量自制。
- 不使用真实学生姓名、学号、邮箱。
- 不使用真实考试原题。
- BGM 必须免版税，并记录来源。
- 如果引用开源 Lottie 或图片素材，记录 URL 和 license。
- 如果使用真实教师材料，必须获得明确授权。

---

## 十一、现场打包 Checklist

- [ ] `source/` 中有音频、PPT、转写稿。
- [ ] `golden/` 中有脚本、题目、播放器数据。
- [ ] `fallback/` 中有 90 秒和 3 分钟录屏。
- [ ] `screenshots/` 可直接放进 PPT。
- [ ] `metrics/` 有一次完整 run log。
- [ ] 所有素材来源清楚。
- [ ] 没有真实个人隐私。
- [ ] 断网状态下仍能演示学生端。
