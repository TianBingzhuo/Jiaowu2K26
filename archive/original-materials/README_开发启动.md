# 智课工坊开发启动 README

**用途**：黑客松现场给开发者看的最短启动说明  
**原则**：先跑 P0 主路径，再接 P1/P2

---

## 1. 当前最小目标

跑通这条链路：

```text
课程材料/预加载数据
  -> AI脚本/Golden脚本
  -> 教师审核
  -> 学生播放器
  -> 出题弹层
```

P0 不要求真实登录、支付、完整后台、真实视频导出。

---

## 2. Mock 数据路径

| 用途 | 文件 |
|------|------|
| 教师审核脚本 | `demo-pack/golden/script_bst.json` |
| 出题数据 | `demo-pack/golden/quiz_bst.json` |
| 学生播放器 | `demo-pack/golden/player_data_bst.json` |
| 考试信号 | `demo-pack/golden/exam_signal_bst.json` |
| 来源追踪 | `demo-pack/golden/source_trace_bst.json` |
| 证据模式 | `demo-pack/golden/evidence_bundle_bst.json` |
| 复习卡 | `demo-pack/golden/review_guide_bst.md` |

---

## 3. P0 API 建议

如果时间紧，后端只需先实现这些接口：

```text
GET  /api/demo/player-data
GET  /api/demo/script
GET  /api/demo/quizzes
GET  /api/demo/exam-signals
GET  /api/demo/evidence-bundle
PUT  /api/demo/script
POST /api/demo/approve
```

`GET` 接口直接读取 `demo-pack/golden/`。  
`PUT /api/demo/script` 可以先只存在内存里。  
`POST /api/demo/approve` 可以返回 `{ "status": "ready", "player_data_url": "/api/demo/player-data" }`。

---

## 4. 前端页面建议

| 页面 | 路径建议 | 数据源 |
|------|----------|--------|
| 教师审核页 | `/teacher/review` | `script_bst.json` + `source_trace_bst.json` |
| 证据抽屉 | `/teacher/review` 内侧边栏 | `evidence_bundle_bst.json` |
| 学生播放器 | `/student/watch/bst-001` | `player_data_bst.json` |
| 复习卡 | `/student/review/bst-001` | `review_guide_bst.md` |

教师审核页可参考：

```text
demo-pack/fallback/screenshots/teacher_review_mock.html
demo-pack/fallback/screenshots/evidence_mode_mock.html
```

---

## 5. Demo Mode

必须做一个明显但不出戏的 Demo Mode：

- 按钮文案：`加载预生成结果`
- 行为：跳过 ASR/LLM 等待，直接读取 golden output
- 路演话术：`为了控制现场节奏，这里加载的是刚才同一段课程材料的预生成结果`

---

## 6. 停止规则

- ASR 不稳：用 `source/bst_transcript.md`
- PPT 解析不稳：用 `source/bst_slide_extract.json`
- LLM 不稳：用 `golden/script_bst.json`
- 动画不稳：用播放器里的图文动画
- 代码沙箱不稳：用 `player_data_bst.json` 里的 `fallback_result`
- 复习指南没接上：直接打开 `golden/review_guide_bst.md`

---

## 7. 路演前检查

- [ ] `/teacher/review` 能展示脚本、来源、考试信号。
- [ ] 点击“查看证据”能打开证据抽屉。
- [ ] `/student/watch/bst-001` 能播放/推进场景。
- [ ] 出题弹层能提交并显示解析。
- [ ] Demo Mode 断网可用。
- [ ] 浏览器控制台无红色报错。
