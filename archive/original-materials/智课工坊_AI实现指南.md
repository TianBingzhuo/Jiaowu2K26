# 智课工坊（SmartCourse Studio）AI 实现指南

**本文档的读者**：AI 编程助手（Cursor、Claude Code、GitHub Copilot、Windsurf 等）  
**目标**：按照本指南逐步构建智课工坊 MVP，每步都有可运行的代码和验证方法  
**项目代号**：SCS  
**版本**：v1.0 | 2026-06-23

---

## 〇、项目概述

智课工坊是面向大学及以上的"洋葱学院式"动画网课快速生成平台。核心闭环：

```
教师上传录音/课件 → ASR转写 → AI生成教学脚本 → 教师审核 → 动画渲染+TTS+出题 → 互动播放器
```

**差异化**：① 大学课程深度 ② AI实时出题 ③ Computer use 软件教学

### 关联文档

本文档是技术实现指南。以下文档提供更详细的业务/产品背景：

| 文档 | 内容 |
|------|------|
| `智课工坊_演进路线.md` | 竞品分析、脑暴、MECE、黑客松排期、孵化路线 |
| `智课工坊_用户故事拆解.md` | 29 个 User Story + AC + Story Points |
| `智课工坊_复习指南生成规范.md` | 复习指南引擎的方法论和输出规范 |
| `智课工坊_路演框架.md` | Pitch Deck 叙事结构、Demo 策略、Q&A 预案 |
| `智课工坊_市场调研.md` | 市场数据、关键数据点 |
| `智课工坊_用户旅程图.html` | 教师/学生旅程可视化 |
| `智课工坊_架构图.svg` | 系统架构图 |

---

## 一、技术栈

| 层 | 技术 | 版本/备注 |
|---|------|----------|
| 前端框架 | Next.js (App Router) | 14.x |
| UI 组件 | shadcn/ui + TailwindCSS | — |
| 动画 | Framer Motion + Lottie (lottie-react) | 预制角色用 Lottie，微交互用 FM |
| 代码编辑器 | @monaco-editor/react | 拖拽代码测试 |
| 后端框架 | FastAPI (Python) | 0.111+ |
| ASR | OpenAI Whisper (本地或 API) | large-v3 本地 / whisper-1 API |
| TTS | edge-tts | 免费，支持中文 |
| LLM | OpenAI GPT-4o / Claude 3.5 / 通义千问 | 可切换，统一接口 |
| 数据库 | SQLite (黑客松) → PostgreSQL (孵化) | SQLAlchemy ORM 统一 |
| 文件存储 | 本地 (黑客松) → S3 (孵化) | 抽象接口 |
| PPT 解析 | python-pptx | — |
| 视频处理 | FFmpeg | 音频提取 |
| 部署 | Docker + Docker Compose | 一键启动 |

---

## 二、项目目录结构

```
smartcourse-studio/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── frontend/                          # Next.js 前端
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── components.json                # shadcn/ui 配置
│   ├── public/
│   │   ├── lottie/                    # Lottie 动画 JSON 文件
│   │   │   ├── teacher-character.json
│   │   │   ├── student-character.json
│   │   │   └── backgrounds/
│   │   └── audio/                     # BGM 音频文件
│   │       └── bgm-calm.mp3
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # 根布局
│   │   │   ├── page.tsx               # 首页/Landing
│   │   │   ├── teacher/
│   │   │   │   ├── page.tsx           # 教师仪表盘
│   │   │   │   ├── upload/page.tsx    # 上传录音/课件
│   │   │   │   ├── review/page.tsx    # 审核编辑脚本
│   │   │   │   └── preview/page.tsx   # 预览动画效果
│   │   │   ├── student/
│   │   │   │   ├── page.tsx           # 学生课程列表
│   │   │   │   └── watch/[id]/page.tsx # 互动播放器
│   │   │   └── admin/
│   │   │       └── page.tsx           # 大学配置
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui 组件
│   │   │   ├── upload/
│   │   │   │   ├── file-uploader.tsx  # 拖拽上传组件
│   │   │   │   └── upload-progress.tsx
│   │   │   ├── review/
│   │   │   │   ├── script-editor.tsx  # 脚本编辑器
│   │   │   │   └── script-preview.tsx
│   │   │   ├── player/
│   │   │   │   ├── animation-player.tsx   # 动画播放器
│   │   │   │   ├── quiz-overlay.tsx       # 出题弹层
│   │   │   │   └── code-playground.tsx    # 代码测试
│   │   │   └── layout/
│   │   │       ├── navbar.tsx
│   │   │       └── sidebar.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                 # API 客户端
│   │   │   ├── utils.ts
│   │   │   └── types.ts               # TypeScript 类型定义
│   │   └── hooks/
│   │       ├── use-upload.ts
│   │       └── use-player.ts
│   └── Dockerfile
│
├── backend/                           # FastAPI 后端
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── alembic.ini                    # 数据库迁移
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app 入口
│   │   ├── config.py                  # 配置管理
│   │   ├── database.py                # 数据库连接
│   │   ├── models/                    # SQLAlchemy 模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── lesson.py
│   │   │   ├── quiz.py
│   │   │   └── review_guide.py
│   │   ├── schemas/                   # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── lesson.py
│   │   │   ├── quiz.py
│   │   │   └── review_guide.py
│   │   ├── api/                       # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── deps.py                # 依赖注入
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   ├── courses.py
│   │   │   │   ├── lessons.py
│   │   │   │   ├── quizzes.py
│   │   │   │   └── review_guides.py
│   │   │   └── router.py              # 路由汇总
│   │   ├── services/                  # 业务逻辑
│   │   │   ├── __init__.py
│   │   │   ├── asr_service.py         # ASR 转写
│   │   │   ├── script_generator.py    # 脚本生成
│   │   │   ├── animation_service.py   # 动画数据生成
│   │   │   ├── tts_service.py         # TTS 配音
│   │   │   ├── quiz_generator.py      # AI 出题
│   │   │   ├── ppt_parser.py          # PPT 解析
│   │   │   └── review_guide_generator.py  # 复习指南
│   │   ├── prompts/                   # LLM Prompt 模板
│   │   │   ├── __init__.py
│   │   │   ├── script_gen.py
│   │   │   ├── quiz_gen.py
│   │   │   └── review_guide_gen.py
│   │   └── core/
│   │       ├── llm_client.py          # LLM 统一调用
│   │       ├── file_storage.py        # 文件存储抽象
│   │       └── pipeline.py            # 处理管线编排
│   └── Dockerfile
│
└── scripts/                           # 工具脚本
    ├── seed_db.py                     # 数据库初始化数据
    ├── download_lottie.py             # 下载 Lottie 资源
    └── test_pipeline.py               # 端到端测试脚本
```

---

## 三、数据库模型

### 3.1 ER 关系

```
User (教师/学生/管理员)
  ├── Course (课程)
  │     ├── Lesson (课时)
  │     │     ├── SourceMaterial (原始材料：录音/PPT)
  │     │     ├── Script (AI生成的教学脚本)
  │     │     ├── AnimationData (动画渲染数据 JSON)
  │     │     ├── AudioTrack (TTS 音频)
  │     │     ├── Quiz (题目集合)
  │     │     │     └── QuizQuestion (单道题目)
  │     │     └── ReviewGuide (复习指南)
  │     └── CourseEnrollment (学生选课)
  └── University (大学配置)
```

### 3.2 SQLAlchemy 模型定义

```python
# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    TEACHER = "teacher"
    STUDENT = "student"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    courses = relationship("Course", back_populates="teacher")
    enrollments = relationship("CourseEnrollment", back_populates="student")
```

```python
# backend/app/models/course.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class University(Base):
    __tablename__ = "universities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    logo_url = Column(String(500), nullable=True)
    config = Column(JSON, default=dict)  # 校名色、院系列表等
    created_at = Column(DateTime, default=datetime.utcnow)

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=False)  # 学科分类
    university_id = Column(Integer, ForeignKey("universities.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    cover_url = Column(String(500), nullable=True)
    is_published = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    teacher = relationship("User", back_populates="courses")
    lessons = relationship("Lesson", back_populates="course", order_by="Lesson.order_index")
    enrollments = relationship("CourseEnrollment", back_populates="course")

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    progress = Column(Integer, default=0)  # 百分比 0-100
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="enrollments")
    student = relationship("User", back_populates="enrollments")
```

```python
# backend/app/models/lesson.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class LessonStatus(str, enum.Enum):
    UPLOADED = "uploaded"        # 材料已上传
    TRANSCRIBING = "transcribing" # ASR 转写中
    TRANSCRIBED = "transcribed"  # 转写完成
    SCRIPT_GENERATING = "script_generating"
    SCRIPT_READY = "script_ready"      # 脚本待审核
    SCRIPT_APPROVED = "script_approved" # 脚本已确认
    RENDERING = "rendering"      # 动画/TTS 渲染中
    PUBLISHED = "published"      # 已发布
    FAILED = "failed"

class SourceMaterial(Base):
    __tablename__ = "source_materials"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    file_type = Column(String(20))  # audio, video, ppt, image
    file_path = Column(String(500))
    file_name = Column(String(300))
    file_size = Column(Integer)  # bytes
    processed_text = Column(Text, nullable=True)  # ASR/提取结果
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String(300), nullable=False)
    order_index = Column(Integer, default=0)
    status = Column(Enum(LessonStatus), default=LessonStatus.UPLOADED)
    transcript = Column(Text, nullable=True)       # ASR 转写结果
    script_data = Column(JSON, nullable=True)      # AI 生成的教学脚本
    script_edited = Column(JSON, nullable=True)     # 教师编辑后的脚本
    animation_data = Column(JSON, nullable=True)    # 动画渲染数据
    tts_audio_path = Column(String(500), nullable=True)
    bgm_track = Column(String(200), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    course = relationship("Course", back_populates="lessons")
    materials = relationship("SourceMaterial", backref="lesson")
    quizzes = relationship("Quiz", back_populates="lesson")
    review_guide = relationship("ReviewGuide", back_populates="lesson", uselist=False)
```

```python
# backend/app/models/quiz.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class QuestionType(str, enum.Enum):
    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"
    FILL_BLANK = "fill_blank"
    SHORT_ANSWER = "short_answer"
    CODE = "code"

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    trigger_timestamp = Column(Integer, nullable=True)  # 动画中的触发时间（秒）
    created_at = Column(DateTime, default=datetime.utcnow)

    lesson = relationship("Lesson", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    question_type = Column(Enum(QuestionType), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)       # 选择题选项列表
    correct_answer = Column(JSON, nullable=False)  # 正确答案
    explanation = Column(Text, nullable=True)   # 解析
    difficulty = Column(Integer, default=1)     # 1-5
    knowledge_points = Column(JSON, default=list)  # 关联知识点
    code_template = Column(Text, nullable=True)    # 编程题初始代码
    code_test_cases = Column(JSON, nullable=True)  # 编程题测试用例
```

```python
# backend/app/models/review_guide.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ReviewGuide(Base):
    __tablename__ = "review_guides"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), unique=True)
    exam_info = Column(JSON, nullable=True)        # 考试形式/题型/范围
    knowledge_points = Column(JSON, nullable=True)  # S/A/B 分级知识点
    formula_sheet = Column(Text, nullable=True)     # 公式汇总
    practice_questions = Column(JSON, nullable=True) # 模拟题
    html_content = Column(Text, nullable=True)      # 生成的 HTML 讲义
    created_at = Column(DateTime, default=datetime.utcnow)

    lesson = relationship("Lesson", back_populates="review_guide")
```

### 3.3 数据库初始化

```python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./smartcourse.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """创建所有表"""
    from app.models import user, course, lesson, quiz, review_guide  # noqa
    Base.metadata.create_all(bind=engine)
```

---

## 四、API 端点定义

### 4.1 API 概览

| 方法 | 路径 | 功能 | 优先级 |
|------|------|------|--------|
| POST | `/api/auth/register` | 注册 | P0 |
| POST | `/api/auth/login` | 登录 | P0 |
| POST | `/api/courses` | 创建课程 | P0 |
| GET | `/api/courses` | 课程列表 | P0 |
| GET | `/api/courses/{id}` | 课程详情 | P0 |
| POST | `/api/lessons` | 创建课时 | P0 |
| POST | `/api/lessons/{id}/upload` | 上传材料 | P0 |
| POST | `/api/lessons/{id}/transcribe` | 触发 ASR | P0 |
| POST | `/api/lessons/{id}/generate-script` | 生成脚本 | P0 |
| PUT | `/api/lessons/{id}/script` | 更新脚本（教师编辑） | P0 |
| POST | `/api/lessons/{id}/approve-script` | 确认脚本 | P0 |
| POST | `/api/lessons/{id}/render` | 触发动画+TTS渲染 | P0 |
| GET | `/api/lessons/{id}/player-data` | 获取播放器数据 | P0 |
| POST | `/api/lessons/{id}/generate-quiz` | 生成题目 | P0 |
| POST | `/api/quizzes/{id}/submit` | 提交答题 | P0 |
| POST | `/api/lessons/{id}/generate-review` | 生成复习指南 | P1 |
| GET | `/api/review-guides/{id}` | 获取复习指南 | P1 |
| GET | `/api/universities` | 大学列表 | P1 |
| POST | `/api/universities` | 创建大学配置 | P1 |

### 4.2 关键 API 详细定义

#### 上传材料

```
POST /api/lessons/{lesson_id}/upload
Content-Type: multipart/form-data

Request:
  file: (binary) 音频/视频/PPT文件

Response 200:
{
  "material_id": 1,
  "file_name": "lecture_01.mp3",
  "file_type": "audio",
  "file_size": 15728640,
  "status": "uploaded"
}

Response 400:
{
  "detail": "不支持的文件格式，请上传 MP3/WAV/MP4/PPTX 格式"
}
```

#### 生成教学脚本

```
POST /api/lessons/{lesson_id}/generate-script
Content-Type: application/json

Request:
{
  "style": "onion_academy",     // 风格：onion_academy | formal | casual
  "duration_target": 360,       // 目标时长（秒）
  "include_quiz": true,         // 是否嵌入出题点
  "subject": "computer_science" // 学科
}

Response 200:
{
  "lesson_id": 1,
  "status": "script_ready",
  "script": {
    "title": "二叉搜索树的原理与实现",
    "total_duration": 345,
    "scenes": [
      {
        "scene_id": 1,
        "timestamp": 0,
        "duration": 30,
        "narration": "同学们，想象一下你在一个图书馆找一本书...",
        "animation": {
          "type": "character_intro",
          "character": "teacher",
          "action": "wave",
          "background": "library"
        },
        "visual_elements": [
          {"type": "text", "content": "二叉搜索树", "position": "center", "animation": "fade_in"},
          {"type": "image", "src": "bst_overview.png", "position": "right"}
        ],
        "quiz_trigger": null
      },
      {
        "scene_id": 2,
        "timestamp": 30,
        "duration": 60,
        "narration": "二叉搜索树有一个神奇的规则：左边的孩子总比爸爸小，右边的孩子总比爸爸大...",
        "animation": {
          "type": "concept_explain",
          "diagram": "bst_insert",
          "highlight": ["left_child", "right_child"]
        },
        "visual_elements": [
          {"type": "svg_diagram", "id": "bst_tree_1", "animation": "build_step_by_step"}
        ],
        "quiz_trigger": {
          "at_second": 85,
          "question_type": "single_choice",
          "inline": true
        }
      }
    ]
  }
}
```

#### 获取播放器数据

```
GET /api/lessons/{lesson_id}/player-data

Response 200:
{
  "lesson_id": 1,
  "title": "二叉搜索树的原理与实现",
  "duration": 345,
  "audio_url": "/api/files/tts_lesson_1.mp3",
  "bgm_url": "/api/audio/bgm-calm.mp3",
  "scenes": [...],              // 同脚本 scenes 数组
  "quizzes": [
    {
      "id": 1,
      "trigger_timestamp": 85,
      "questions": [
        {
          "id": 1,
          "type": "single_choice",
          "text": "在二叉搜索树中，如果插入值 15，它应该放在哪里？",
          "options": ["左子树", "右子树", "根节点", "无法确定"],
          "correct": 3,
          "explanation": "需要知道当前树的结构才能确定位置，这就是BST的查找逻辑。"
        }
      ]
    }
  ],
  "code_playground": {
    "enabled": true,
    "language": "python",
    "initial_code": "# 试试实现 BST 的插入操作\nclass Node:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef insert(root, val):\n    # 你的代码\n    pass",
    "test_cases": [
      {"input": "insert(Node(10), 5)", "expected": "Node with left child 5"}
    ]
  }
}
```

---

## 五、LLM Prompt 模板

### 5.1 教学脚本生成 Prompt

```python
# backend/app/prompts/script_gen.py

SCRIPT_GENERATION_SYSTEM = """你是智课工坊的教学脚本编剧。你的任务是将大学课程录音转写稿转化为洋葱学院风格的动画教学脚本。

## 你的风格特点
- 用生活化的比喻解释抽象概念（"想象你在图书馆找书..."）
- 每段话不超过3句话，保持节奏快
- 每个知识点后紧跟一个互动出题点
- 语言口语化但不失严谨
- 适当加入幽默元素（"如果二叉树是一个人，那它的左孩子永远比它矮"）

## 脚本格式要求
你必须输出一个 JSON 对象，包含以下字段：
- title: 课时标题
- total_duration: 预估总时长（秒），目标 300-480 秒（5-8分钟）
- scenes: 场景数组，每个场景包含：
  - scene_id: 场景编号
  - timestamp: 开始时间（秒）
  - duration: 持续时间（秒）
  - narration: 旁白文本（口语化，用于 TTS）
  - animation: 动画描述 {type, character, action, background}
  - visual_elements: 视觉元素数组 [{type, content/id, position, animation}]
  - quiz_trigger: 出题触发点 {at_second, question_type, inline} 或 null

## 动画类型列表
- character_intro: 角色出场/打招呼
- concept_explain: 概念讲解（配图表/示意图）
- step_by_step: 逐步演示（算法过程/推导）
- comparison: 对比展示（左右分屏）
- summary: 总结回顾
- quiz_break: 互动出题间歇

## 视觉元素类型
- text: 文字（支持公式 LaTeX）
- image: 图片
- svg_diagram: SVG 示意图
- code_block: 代码块
- table: 表格
- formula: 数学公式（KaTeX）

## 出题策略
- 每 60-90 秒出一个互动题
- 题型轮换：选择题 → 填空题 → 代码题（如果是编程课）
- 题目紧跟刚讲过的内容，强化记忆
- 选择题 4 个选项，正确答案随机分布
"""

SCRIPT_GENERATION_USER = """## 课程信息
- 学科：{subject}
- 课时标题：{lesson_title}
- 目标时长：{duration_target} 秒
- 风格：{style}

## 录音转写稿
{transcript}

## 课件内容（如有）
{ppt_content}

请根据以上材料，生成一个洋葱学院风格的教学脚本 JSON。确保：
1. 知识点覆盖完整（参照转写稿和课件）
2. 每 60-90 秒设置一个出题点
3. 每个场景的旁白不超过 3 句话
4. 使用生活化比喻让概念更易懂
5. 总时长控制在 {duration_target} 秒左右

直接输出 JSON，不要包含其他文字。"""
```

### 5.2 AI 出题 Prompt

```python
# backend/app/prompts/quiz_gen.py

QUIZ_GENERATION_SYSTEM = """你是智课工坊的AI出题引擎。根据教学脚本内容生成高质量的互动测验题目。

## 出题原则
1. 题目必须测试刚刚讲过的知识点（即时强化）
2. 选择题的干扰项必须"看起来合理但确实错误"
3. 填空题只填关键词/数字，不填长句
4. 编程题给出明确的任务描述和测试用例
5. 每道题必须有解析（explain为什么对/为什么错）

## 难度分布
- 60% 基础理解题（能回忆/识别即可）
- 30% 应用题（需要运用刚学的知识）
- 10% 思考题（需要推理或联系前后知识）

## 输出格式
JSON 数组，每个元素：
{
  "question_type": "single_choice|multi_choice|fill_blank|short_answer|code",
  "trigger_after_scene": <scene_id>,
  "question_text": "题目文本",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],  // 选择题才有
  "correct_answer": <正确答案>,
  "explanation": "解析文本",
  "difficulty": 1-5,
  "knowledge_points": ["知识点1", "知识点2"]
}

对于选择题，correct_answer 是正确选项的索引（0-3）。
对于填空题，correct_answer 是字符串或字符串数组（多空）。
对于编程题，correct_answer 是参考代码，并附 code_test_cases。
"""

QUIZ_GENERATION_USER = """## 课时标题：{lesson_title}
## 学科：{subject}

## 教学脚本概要：
{script_summary}

请为这个课时生成 {num_questions} 道互动题目，要求：
- 均匀分布在整个课时中（每个 scene 后最多 1 题）
- 题型混合：{type_distribution}
- 难度分布：60%基础 + 30%应用 + 10%思考

直接输出 JSON 数组。"""
```

### 5.3 复习指南生成 Prompt

```python
# backend/app/prompts/review_guide_gen.py

REVIEW_GUIDE_SYSTEM = """你是智课工坊的复习指南生成引擎，基于考情工程方法论。

## 核心理念
复习指南不是知识点的简单罗列，而是以考试信号为导向的情报产品。老师上课时的语言暗示（"这个很重要""考试会考"）是最值钱的情报。

## 信号优先级（从高到低）
P1: 老师明确声明考 → S级（必考核心）
P2: 复习课内容 → S/A级
P3: 作业和课堂例题 → A级
P4: PPT标题级知识点 → A级
P5: 反复出现的概念 → A/B级
P6: 教材补充 → B级

## 输出结构
生成以下 JSON：
{
  "exam_info": {
    "format": "开卷/闭卷",
    "question_types": ["选择题", "计算题", "简答题"],
    "scope": "考试范围描述",
    "allowed_materials": "允许带的材料"
  },
  "knowledge_points": [
    {
      "name": "知识点名称",
      "priority": "S/A/B",
      "source": "信号来源（第X讲/老师原话）",
      "summary": "一句话核心",
      "formula": "相关公式（LaTeX）或 null",
      "possible_question_types": ["计算题", "简答题"],
      "sample_question": "模拟题",
      "sample_answer": "答案框架"
    }
  ],
  "formula_sheet": "所有公式的 LaTeX 汇总",
  "practice_questions": [
    {
      "chapter": "章节",
      "question": "题目",
      "answer": "参考答案",
      "difficulty": "S/A/B"
    }
  ]
}
"""

REVIEW_GUIDE_USER = """## 课程信息
- 课程名称：{course_title}
- 学科：{subject}

## 全部课时转写稿：
{all_transcripts}

## 课件内容汇总：
{ppt_summary}

请分析所有课时材料，提取考试信号，生成完整的复习指南数据。注意：
1. 优先提取老师明确说"会考""重要""必须掌握"的内容
2. 知识点按 S/A/B 三级标注
3. 每个 S 级知识点必须配一道模拟题
4. 公式汇总使用 LaTeX 格式
5. 不要编造老师没说过的考试信息——不确定的标注 confidence: low

直接输出 JSON。"""
```

---

## 六、核心服务实现

### 6.1 LLM 统一客户端

```python
# backend/app/core/llm_client.py
import os
from typing import Optional
from openai import AsyncOpenAI

class LLMClient:
    """统一的 LLM 调用客户端，支持多模型切换"""

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("LLM_API_KEY"),
            base_url=os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        )
        self.model = os.getenv("LLM_MODEL", "gpt-4o")

    async def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        response_format: Optional[str] = None  # "json_object" for structured output
    ) -> str:
        kwargs = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format == "json_object":
            kwargs["response_format"] = {"type": "json_object"}

        response = await self.client.chat.completions.create(**kwargs)
        return response.choices[0].message.content

    async def chat_json(self, system_prompt: str, user_prompt: str, **kwargs) -> dict:
        """调用 LLM 并解析 JSON 返回"""
        import json
        raw = await self.chat(
            system_prompt, user_prompt,
            response_format="json_object",
            **kwargs
        )
        return json.loads(raw)

# 全局单例
llm_client = LLMClient()
```

### 6.2 ASR 转写服务

```python
# backend/app/services/asr_service.py
import os
import subprocess
import tempfile
from pathlib import Path

class ASRService:
    """音频转文字服务，支持本地 Whisper 和 OpenAI API"""

    def __init__(self):
        self.mode = os.getenv("ASR_MODE", "local")  # "local" or "api"

    async def transcribe(self, file_path: str) -> dict:
        """
        转写音频/视频文件
        返回: {"text": "完整文本", "segments": [...], "language": "zh"}
        """
        # 如果是视频，先提取音频
        audio_path = await self._extract_audio_if_needed(file_path)

        if self.mode == "local":
            return await self._transcribe_local(audio_path)
        else:
            return await self._transcribe_api(audio_path)

    async def _extract_audio_if_needed(self, file_path: str) -> str:
        """如果是视频文件，用 FFmpeg 提取音频"""
        ext = Path(file_path).suffix.lower()
        if ext in ['.mp4', '.avi', '.mov', '.mkv']:
            audio_path = file_path + '.wav'
            subprocess.run([
                'ffmpeg', '-i', file_path,
                '-vn', '-acodec', 'pcm_s16le',
                '-ar', '16000', '-ac', '1',
                audio_path, '-y'
            ], check=True, capture_output=True)
            return audio_path
        return file_path

    async def _transcribe_local(self, audio_path: str) -> dict:
        """使用本地 Whisper 模型"""
        import whisper
        model = whisper.load_model("large-v3")
        result = model.transcribe(
            audio_path,
            language="zh",
            task="transcribe",
            verbose=False
        )
        return {
            "text": result["text"],
            "segments": [
                {
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"]
                }
                for seg in result["segments"]
            ],
            "language": result.get("language", "zh")
        }

    async def _transcribe_api(self, audio_path: str) -> dict:
        """使用 OpenAI Whisper API"""
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        with open(audio_path, "rb") as f:
            result = await client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="zh",
                response_format="verbose_json",
                timestamp_granularities=["segment"]
            )
        return {
            "text": result.text,
            "segments": [
                {"start": seg.start, "end": seg.end, "text": seg.text}
                for seg in (result.segments or [])
            ],
            "language": "zh"
        }

asr_service = ASRService()
```

### 6.3 教学脚本生成服务

```python
# backend/app/services/script_generator.py
import json
from app.core.llm_client import llm_client
from app.prompts.script_gen import SCRIPT_GENERATION_SYSTEM, SCRIPT_GENERATION_USER
from app.prompts.quiz_gen import QUIZ_GENERATION_SYSTEM, QUIZ_GENERATION_USER

class ScriptGenerator:
    """AI 教学脚本生成器"""

    async def generate(
        self,
        transcript: str,
        ppt_content: str = "",
        lesson_title: str = "",
        subject: str = "general",
        style: str = "onion_academy",
        duration_target: int = 360
    ) -> dict:
        """生成教学脚本"""
        user_prompt = SCRIPT_GENERATION_USER.format(
            subject=subject,
            lesson_title=lesson_title,
            duration_target=duration_target,
            style=style,
            transcript=transcript[:12000],  # 截断避免超长
            ppt_content=ppt_content[:4000] if ppt_content else "无课件内容"
        )

        script = await llm_client.chat_json(
            SCRIPT_GENERATION_SYSTEM,
            user_prompt,
            temperature=0.7,
            max_tokens=8192
        )

        # 自动为脚本生成配套题目
        if script.get("scenes"):
            quiz_data = await self._generate_quizzes(script, subject, lesson_title)
            script["quizzes"] = quiz_data

        return script

    async def _generate_quizzes(self, script: dict, subject: str, title: str) -> list:
        """为脚本生成配套测验"""
        # 统计场景数来决定题目数
        num_scenes = len(script.get("scenes", []))
        num_questions = max(3, num_scenes // 2)  # 每2个场景1题，至少3题

        script_summary = json.dumps(
            [{"scene_id": s["scene_id"], "narration": s["narration"][:100]}
             for s in script["scenes"]],
            ensure_ascii=False
        )

        type_dist = "60%选择题 + 25%填空题 + 15%代码题（如适用）"

        user_prompt = QUIZ_GENERATION_USER.format(
            lesson_title=title,
            subject=subject,
            script_summary=script_summary,
            num_questions=num_questions,
            type_distribution=type_dist
        )

        return await llm_client.chat_json(
            QUIZ_GENERATION_SYSTEM,
            user_prompt,
            temperature=0.6,
            max_tokens=4096
        )

script_generator = ScriptGenerator()
```

### 6.4 TTS 配音服务

```python
# backend/app/services/tts_service.py
import os
import edge_tts

class TTSService:
    """使用 edge-tts 生成中文配音"""

    # 推荐中文语音
    VOICES = {
        "male_young": "zh-CN-YunxiNeural",      # 年轻男声
        "female_young": "zh-CN-XiaoxiaoNeural",  # 年轻女声
        "male_formal": "zh-CN-YunjianNeural",    # 正式男声
        "female_formal": "zh-CN-XiaoyiNeural",   # 正式女声
    }

    async def generate(
        self,
        text: str,
        output_path: str,
        voice: str = "male_young",
        rate: str = "+5%",
        volume: str = "+0%"
    ) -> str:
        """
        生成 TTS 音频
        返回输出文件路径
        """
        voice_name = self.VOICES.get(voice, voice)
        communicate = edge_tts.Communicate(
            text=text,
            voice=voice_name,
            rate=rate,
            volume=volume
        )
        await communicate.save(output_path)
        return output_path

    async def generate_by_scenes(
        self,
        scenes: list[dict],
        output_dir: str,
        voice: str = "male_young"
    ) -> list[dict]:
        """按场景分别生成 TTS，返回每段的音频路径和时长"""
        results = []
        for scene in scenes:
            scene_path = os.path.join(output_dir, f"scene_{scene['scene_id']}.mp3")
            await self.generate(scene["narration"], scene_path, voice)

            # 获取音频时长
            duration = self._get_audio_duration(scene_path)
            results.append({
                "scene_id": scene["scene_id"],
                "audio_path": scene_path,
                "audio_duration": duration
            })
        return results

    def _get_audio_duration(self, path: str) -> float:
        """获取音频时长"""
        from mutagen.mp3 import MP3
        try:
            audio = MP3(path)
            return audio.info.length
        except:
            return 0.0

tts_service = TTSService()
```

### 6.5 PPT 解析服务

```python
# backend/app/services/ppt_parser.py
from pptx import Presentation
from pptx.util import Inches
from pathlib import Path
import base64
import os

class PPTParser:
    """解析 PPT 课件，提取文本、图片和备注"""

    async def parse(self, file_path: str) -> dict:
        """
        解析 PPT 文件
        返回: {
            "slides": [...],
            "full_text": "所有文本汇总",
            "images": [...],
            "notes": "所有备注汇总"
        }
        """
        prs = Presentation(file_path)
        slides_data = []
        all_text = []
        all_notes = []
        images = []

        for idx, slide in enumerate(prs.slides):
            slide_text = []
            slide_images = []

            for shape in slide.shapes:
                # 提取文本
                if hasattr(shape, "text") and shape.text.strip():
                    slide_text.append(shape.text.strip())

                # 提取图片
                if shape.shape_type == 13:  # Picture
                    image = shape.image
                    img_ext = image.content_type.split('/')[-1]
                    img_filename = f"slide_{idx+1}_img_{len(slide_images)+1}.{img_ext}"
                    img_path = os.path.join(
                        os.path.dirname(file_path), "images", img_filename
                    )
                    os.makedirs(os.path.dirname(img_path), exist_ok=True)
                    with open(img_path, "wb") as f:
                        f.write(image.blob)
                    slide_images.append(img_path)
                    images.append(img_path)

            # 提取备注
            notes = ""
            if slide.has_notes_slide:
                notes = slide.notes_slide.notes_text_frame.text

            slides_data.append({
                "slide_number": idx + 1,
                "text": slide_text,
                "images": slide_images,
                "notes": notes
            })
            all_text.extend(slide_text)
            if notes:
                all_notes.append(f"[第{idx+1}页备注] {notes}")

        return {
            "slides": slides_data,
            "full_text": "\n".join(all_text),
            "images": images,
            "notes": "\n".join(all_notes),
            "total_slides": len(slides_data)
        }

ppt_parser = PPTParser()
```

### 6.6 处理管线编排

```python
# backend/app/core/pipeline.py
import asyncio
from app.services.asr_service import asr_service
from app.services.script_generator import script_generator
from app.services.tts_service import tts_service
from app.services.ppt_parser import ppt_parser
from app.database import SessionLocal
from app.models.lesson import Lesson, LessonStatus, SourceMaterial
import logging

logger = logging.getLogger(__name__)

class LessonPipeline:
    """课时处理管线：编排 ASR → 脚本生成 → TTS → 出题 的完整流程"""

    async def run_transcribe(self, lesson_id: int):
        """Step 1: 转写所有音频材料"""
        db = SessionLocal()
        try:
            lesson = db.query(Lesson).get(lesson_id)
            lesson.status = LessonStatus.TRANSCRIBING
            db.commit()

            materials = db.query(SourceMaterial).filter(
                SourceMaterial.lesson_id == lesson_id,
                SourceMaterial.file_type.in_(["audio", "video"])
            ).all()

            all_text = []
            all_segments = []
            for mat in materials:
                result = await asr_service.transcribe(mat.file_path)
                mat.processed_text = result["text"]
                all_text.append(result["text"])
                all_segments.extend(result["segments"])

            # 同时解析 PPT
            ppt_materials = db.query(SourceMaterial).filter(
                SourceMaterial.lesson_id == lesson_id,
                SourceMaterial.file_type == "ppt"
            ).all()

            ppt_content = ""
            for mat in ppt_materials:
                parsed = await ppt_parser.parse(mat.file_path)
                mat.processed_text = parsed["full_text"]
                ppt_content += parsed["full_text"] + "\n"

            lesson.transcript = "\n\n".join(all_text)
            lesson.status = LessonStatus.TRANSCRIBED
            db.commit()

            return {"status": "success", "transcript_length": len(lesson.transcript)}

        except Exception as e:
            lesson.status = LessonStatus.FAILED
            lesson.error_message = str(e)
            db.commit()
            logger.error(f"Transcribe failed for lesson {lesson_id}: {e}")
            raise
        finally:
            db.close()

    async def run_generate_script(self, lesson_id: int, **kwargs):
        """Step 2: 生成教学脚本"""
        db = SessionLocal()
        try:
            lesson = db.query(Lesson).get(lesson_id)
            lesson.status = LessonStatus.SCRIPT_GENERATING
            db.commit()

            # 收集 PPT 内容
            ppt_materials = db.query(SourceMaterial).filter(
                SourceMaterial.lesson_id == lesson_id,
                SourceMaterial.file_type == "ppt"
            ).all()
            ppt_content = "\n".join(m.processed_text or "" for m in ppt_materials)

            script = await script_generator.generate(
                transcript=lesson.transcript,
                ppt_content=ppt_content,
                lesson_title=lesson.title,
                **kwargs
            )

            lesson.script_data = script
            lesson.status = LessonStatus.SCRIPT_READY
            db.commit()

            return {"status": "success", "scenes_count": len(script.get("scenes", []))}

        except Exception as e:
            lesson.status = LessonStatus.FAILED
            lesson.error_message = str(e)
            db.commit()
            raise
        finally:
            db.close()

    async def run_render(self, lesson_id: int):
        """Step 3: 渲染动画数据 + TTS（可并行）"""
        db = SessionLocal()
        try:
            lesson = db.query(Lesson).get(lesson_id)
            lesson.status = LessonStatus.RENDERING
            db.commit()

            script = lesson.script_edited or lesson.script_data
            scenes = script.get("scenes", [])

            # 并行执行 TTS 和动画数据生成
            tts_task = tts_service.generate_by_scenes(
                scenes,
                output_dir=f"data/audio/lesson_{lesson_id}/"
            )
            animation_task = self._generate_animation_data(scenes)

            tts_results, animation_data = await asyncio.gather(
                tts_task, animation_task
            )

            # 合并动画数据和音频信息
            lesson.animation_data = animation_data
            lesson.tts_audio_path = f"data/audio/lesson_{lesson_id}/"
            lesson.status = LessonStatus.PUBLISHED
            db.commit()

            return {"status": "success"}

        except Exception as e:
            lesson.status = LessonStatus.FAILED
            lesson.error_message = str(e)
            db.commit()
            raise
        finally:
            db.close()

    async def _generate_animation_data(self, scenes: list) -> dict:
        """
        生成前端可直接消费的动画数据。
        黑客松阶段：不做复杂动画，只生成场景描述 JSON，
        前端用 Framer Motion + Lottie 按描述渲染。
        """
        return {
            "scenes": [
                {
                    "scene_id": s["scene_id"],
                    "timestamp": s["timestamp"],
                    "duration": s["duration"],
                    "transitions": [
                        {"type": "fade_in", "delay": 0},
                        {"type": "fade_out", "delay": s["duration"] - 0.5}
                    ],
                    "lottie_animation": s.get("animation", {}).get("character"),
                    "elements": s.get("visual_elements", []),
                    "background": s.get("animation", {}).get("background", "default")
                }
                for s in scenes
            ]
        }

pipeline = LessonPipeline()
```

---

## 七、前端关键组件

### 7.1 互动播放器

```tsx
// frontend/src/components/player/animation-player.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Lottie from "lottie-react"
import { QuizOverlay } from "./quiz-overlay"
import { CodePlayground } from "./code-playground"

interface Scene {
  scene_id: number
  timestamp: number
  duration: number
  narration: string
  animation: { type: string; character?: string; action?: string; background?: string }
  visual_elements: Array<{ type: string; content?: string; id?: string; position: string; animation: string }>
  quiz_trigger: { at_second: number; question_type: string; inline: boolean } | null
}

interface PlayerData {
  lesson_id: number
  title: string
  duration: number
  audio_url: string
  scenes: Scene[]
  quizzes: any[]
  code_playground: { enabled: boolean; language: string; initial_code: string }
}

export function AnimationPlayer({ data }: { data: PlayerData }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentScene, setCurrentScene] = useState<Scene | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState<any>(null)
  const [showCode, setShowCode] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // 根据播放时间确定当前场景
  useEffect(() => {
    const scene = data.scenes.find(
      s => currentTime >= s.timestamp && currentTime < s.timestamp + s.duration
    )
    if (scene && scene.scene_id !== currentScene?.scene_id) {
      setCurrentScene(scene)
    }

    // 检查是否触发出题
    for (const quiz of data.quizzes) {
      if (quiz.trigger_timestamp && Math.abs(currentTime - quiz.trigger_timestamp) < 0.5) {
        setActiveQuiz(quiz)
        setShowQuiz(true)
        setIsPlaying(false)
        audioRef.current?.pause()
      }
    }
  }, [currentTime, data.scenes, data.quizzes, currentScene])

  const handleQuizComplete = useCallback(() => {
    setShowQuiz(false)
    setActiveQuiz(null)
    setIsPlaying(true)
    audioRef.current?.play()
  }, [])

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* 动画舞台 */}
      <div className="relative aspect-video bg-gradient-to-b from-slate-800 to-slate-900">
        <AnimatePresence mode="wait">
          {currentScene && (
            <motion.div
              key={currentScene.scene_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center p-8"
            >
              {/* Lottie 角色动画 */}
              {currentScene.animation.character && (
                <div className="absolute left-8 bottom-8 w-32 h-32">
                  <Lottie
                    animationData={require(`/public/lottie/${currentScene.animation.character}.json`)}
                    loop
                  />
                </div>
              )}

              {/* 视觉元素 */}
              {currentScene.visual_elements.map((el, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.2 }}
                  className={`${getPositionClass(el.position)}`}
                >
                  {el.type === "text" && (
                    <h2 className="text-3xl font-bold text-white">{el.content}</h2>
                  )}
                  {el.type === "formula" && (
                    <div className="text-2xl text-cyan-300 font-mono">{el.content}</div>
                  )}
                  {el.type === "code_block" && (
                    <pre className="bg-slate-800 text-green-300 p-4 rounded-lg text-sm font-mono">
                      {el.content}
                    </pre>
                  )}
                </motion.div>
              ))}

              {/* 旁白字幕 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white text-lg text-center leading-relaxed">
                  {currentScene.narration}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 出题弹层 */}
        {showQuiz && activeQuiz && (
          <QuizOverlay quiz={activeQuiz} onComplete={handleQuizComplete} />
        )}
      </div>

      {/* 播放控制栏 */}
      <div className="bg-slate-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => {
            setIsPlaying(!isPlaying)
            isPlaying ? audioRef.current?.pause() : audioRef.current?.play()
          }}
          className="text-white hover:text-cyan-400 transition"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={data.duration}
            value={currentTime}
            onChange={e => {
              const t = Number(e.target.value)
              setCurrentTime(t)
              if (audioRef.current) audioRef.current.currentTime = t
            }}
            className="w-full accent-cyan-400"
          />
        </div>

        <span className="text-slate-400 text-sm">
          {formatTime(currentTime)} / {formatTime(data.duration)}
        </span>

        {data.code_playground?.enabled && (
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-500"
          >
            {showCode ? "隐藏代码" : "写代码"}
          </button>
        )}
      </div>

      {/* 代码测试区 */}
      {showCode && data.code_playground && (
        <CodePlayground
          language={data.code_playground.language}
          initialCode={data.code_playground.initial_code}
        />
      )}

      {/* 隐藏音频 */}
      <audio
        ref={audioRef}
        src={data.audio_url}
        onTimeUpdate={e => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}

function getPositionClass(position: string): string {
  const map: Record<string, string> = {
    center: "absolute inset-0 flex items-center justify-center",
    left: "absolute left-8 top-1/2 -translate-y-1/2",
    right: "absolute right-8 top-1/2 -translate-y-1/2",
    top: "absolute top-8 left-1/2 -translate-x-1/2",
    bottom: "absolute bottom-24 left-1/2 -translate-x-1/2",
  }
  return map[position] || map.center
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}
```

### 7.2 文件上传组件

```tsx
// frontend/src/components/upload/file-uploader.tsx
"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileAudio, FileText, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const ACCEPT = {
  "audio/*": [".mp3", ".wav"],
  "video/*": [".mp4"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
}

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>
  lessonId?: number
}

export function FileUploader({ onUpload, lessonId }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)

    // 验证文件大小
    const oversized = acceptedFiles.find(f => f.size > MAX_SIZE)
    if (oversized) {
      setError(`文件 ${oversized.name} 超过 50MB 限制`)
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // 模拟上传进度（实际应使用 XMLHttpRequest 或 fetch with ReadableStream）
      await onUpload(acceptedFiles)
      setProgress(100)
    } catch (e: any) {
      setError(e.message || "上传失败")
    } finally {
      setUploading(false)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_SIZE,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? "border-cyan-400 bg-cyan-50" : "border-slate-300 hover:border-cyan-400"}
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        {isDragActive ? (
          <p className="text-cyan-600 font-medium">松开以开始上传</p>
        ) : (
          <>
            <p className="text-slate-600 font-medium">
              拖拽文件到这里，或点击选择文件
            </p>
            <p className="text-slate-400 text-sm mt-2">
              支持 MP3、WAV、MP4、PPTX，单个文件最大 50MB
            </p>
          </>
        )}
      </div>

      {/* 上传进度 */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-cyan-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">上传中 {progress}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
```

---

## 八、动画工具链与互动增强组件

动画创作工具链的完整指南（资产创作/编排/合成/分发）已独立成文，详见 `智课工坊_动画工具链.md`。此处列出与后端/管线直接相关的三个互动增强组件。

### 8.1 分支选择（借鉴 Volitus 共创机制）

在脚本生成 Prompt 中增加分支点生成指令：

```python
# 在 SCRIPT_GENERATION_SYSTEM prompt 末尾追加：

BRANCH_POINT_ADDENDUM = """
## 分支选择点（branch_point）
在适合让学生主动选择学习路径的知识点处，可以插入分支选择点。格式：
{
  "branch_point": {
    "trigger_after_scene": <scene_id>,
    "question": "接下来你想先看哪个？",
    "options": [
      {"id": "A", "title": "插入操作", "description": "学习如何向BST中添加新节点"},
      {"id": "B", "title": "查找操作", "description": "学习如何在BST中搜索特定值"},
      {"id": "C", "title": "删除操作", "description": "学习如何从BST中移除节点"}
    ],
    "timer_seconds": 10,
    "merge_scene_id": <汇合点scene_id>
  }
}

分支规则：
- 每节课最多 1-2 个分支点（避免过度碎片化）
- 所有分支必须在 merge_scene_id 处重新合并到主线
- 分支路径的时长应大致相等（±10秒）
- 分支选项应与刚讲过的内容自然衔接
"""
```

前端分支投票组件的完整代码见 `智课工坊_动画工具链.md` 第四节的 `BranchVote` 组件。

### 8.2 知识炼金系统（借鉴帧我 Alcheme 仪式感）

```tsx
// frontend/src/components/player/alchemy-effect.tsx
"use client"
import { motion } from "framer-motion"

interface AlchemyEffectProps {
  knowledgePoint: string
  onComplete: () => void
}

export function AlchemyEffect({ knowledgePoint, onComplete }: AlchemyEffectProps) {
  const particles = Array.from({ length: 12 }, (_, i) => i)
  
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
      onAnimationComplete={onComplete}
    >
      {/* 中心转化动画 */}
      <motion.div className="relative w-24 h-24 flex items-center justify-center">
        {/* 矿石（消失） */}
        <motion.span
          className="absolute text-4xl"
          initial={{ opacity: 1, rotate: 0 }}
          animate={{ opacity: 0, rotate: 180 }}
          transition={{ duration: 0.5 }}
        >🪨</motion.span>
        
        {/* 晶石（出现） */}
        <motion.span
          className="absolute text-4xl"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
        >💎</motion.span>
        
        {/* 粒子扩散 */}
        {particles.map(i => (
          <motion.span
            key={i}
            className="absolute text-lg"
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1.5, 0],
              x: Math.cos(i * 0.5) * 80,
              y: Math.sin(i * 0.5) * 80 - 40,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >✨</motion.span>
        ))}
      </motion.div>
      
      {/* 知识点标签 */}
      <motion.div
        className="absolute bottom-1/4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-cyan-300 text-sm">知识晶石 +1</p>
        <p className="text-white font-semibold">{knowledgePoint}</p>
      </motion.div>
    </motion.div>
  )
}
```

后端需要在答题提交 API 中返回知识点的 `display_name`，供前端触发炼金动画：

```python
# 在 POST /api/quizzes/{id}/submit 的 response 中增加
{
  "correct": true,
  "explanation": "...",
  "knowledge_point": {
    "id": "bst_insert",
    "display_name": "BST插入操作",
    "priority": "A",
    "is_new_crystal": true  // 是否首次获得该晶石
  }
}
```

### 8.3 分享卡片生成（借鉴 Volitus 自动分发流）

```tsx
// frontend/src/components/share/share-card.tsx
"use client"
import { useRef } from "react"

interface ShareCardProps {
  type: "perfect_score" | "combo" | "course_complete" | "code_warrior" | "study_master"
  data: {
    title: string
    description: string
    score: number
    knowledgeCount: number
    date: string
  }
}

export function ShareCard({ type, data }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const handleDownload = async () => {
    const { toPng } = await import("html-to-image")
    if (!cardRef.current) return
    const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 })
    const link = document.createElement("a")
    link.download = `smartcourse-${type}-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }
  
  const typeConfig = {
    perfect_score: { emoji: "🏆", gradient: "from-amber-900 to-amber-700" },
    combo: { emoji: "🔥", gradient: "from-red-900 to-orange-700" },
    course_complete: { emoji: "🎓", gradient: "from-slate-900 to-slate-700" },
    code_warrior: { emoji: "⚔️", gradient: "from-emerald-900 to-emerald-700" },
    study_master: { emoji: "📚", gradient: "from-indigo-900 to-indigo-700" },
  }
  const config = typeConfig[type]
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={cardRef}
        className={`w-80 bg-gradient-to-br ${config.gradient} rounded-2xl p-6 shadow-xl`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{config.emoji}</span>
          <span className="text-white font-bold text-lg">智课工坊</span>
        </div>
        <h3 className="text-white text-xl font-bold mb-1">{data.title}</h3>
        <p className="text-white/70 text-sm mb-4">{data.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-cyan-300 font-mono">
            {data.score}分 · {data.knowledgeCount}个知识晶石
          </span>
          <span className="text-white/50">{data.date}</span>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500"
      >
        保存分享卡片
      </button>
    </div>
  )
}
```

---

## 九、逐步实施计划

### 第 1 步：项目初始化（Day 1 上午，2h）

```bash
# 创建项目根目录
mkdir smartcourse-studio && cd smartcourse-studio
git init

# === 后端初始化 ===
mkdir -p backend/app/{models,schemas,api/routes,services,prompts,core}
cd backend

# 创建 Python 虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install fastapi uvicorn sqlalchemy pydantic python-multipart \
    python-jose passlib[bcrypt] openai edge-tts python-pptx mutagen \
    alembic httpx pytest

# 创建 requirements.txt
pip freeze > requirements.txt

# === 前端初始化 ===
cd ..
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend

# 安装 shadcn/ui
npx shadcn-ui@latest init

# 安装额外依赖
npm install framer-motion lottie-react react-dropzone lucide-react \
    @monaco-editor/react axios

# 创建目录结构
mkdir -p src/components/{upload,review,player,layout}
mkdir -p src/{lib,hooks}
mkdir -p public/{lottie,audio}
```

**验证**：`cd frontend && npm run dev` 能看到 Next.js 默认页面；`cd backend && uvicorn app.main:app --reload` 能启动 FastAPI。

---

### 第 2 步：数据库 + 基础 API（Day 1 上午-下午，3h）

1. 将第三节的模型代码写入 `backend/app/models/` 目录
2. 创建 `database.py`、`config.py`、`main.py`
3. 编写基础 CRUD API：用户注册/登录、课程创建、课时创建

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.database import init_db

app = FastAPI(title="SmartCourse Studio API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup():
    init_db()

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
```

```python
# backend/app/api/router.py
from fastapi import APIRouter
from app.api.routes import auth, courses, lessons, quizzes, review_guides

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(review_guides.router, prefix="/review-guides", tags=["review-guides"])
```

**验证**：访问 `http://localhost:8000/docs` 能看到 Swagger 文档，能调通 `/api/health`。

---

### 第 3 步：文件上传 + ASR 转写（Day 1 下午，3h）

1. 实现 `POST /api/lessons/{id}/upload` 端点
2. 实现 ASR 服务（第六节 6.2 代码）
3. 实现 `POST /api/lessons/{id}/transcribe` 端点
4. 前端上传组件（第七节 7.2 代码）

```bash
# 安装 Whisper（本地模式）
pip install openai-whisper

# 或者安装 FFmpeg（如果用 API 模式也需要）
brew install ffmpeg  # macOS
# apt install ffmpeg  # Ubuntu
```

**验证**：上传一段 1 分钟的 MP3 测试录音，确认能收到转写文本。

```bash
# 快速测试脚本
curl -X POST http://localhost:8000/api/lessons/1/upload \
  -F "file=@test_audio.mp3"
curl -X POST http://localhost:8000/api/lessons/1/transcribe
```

---

### 第 4 步：AI 脚本生成 + 教师审核界面（Day 2，全天 6h）

1. 实现 LLM 客户端（第六节 6.1）
2. 实现脚本生成服务（第六节 6.3）+ Prompt 模板（第五节 5.1/5.2）
3. 实现 `POST /api/lessons/{id}/generate-script` 端点
4. 实现 `PUT /api/lessons/{id}/script` 端点（教师编辑）
5. 前端脚本编辑器（`script-editor.tsx`）

**验证**：用一段测试转写稿调用脚本生成 API，检查返回的 JSON 结构是否完整。在编辑界面能修改旁白文本并保存。

---

### 第 5 步：TTS 配音（Day 2 下午，2h）

1. 实现 TTS 服务（第六节 6.4）
2. 集成到渲染管线

```bash
pip install edge-tts mutagen
```

**验证**：输入一段脚本旁白文本，生成 MP3 音频并播放。

---

### 第 6 步：动画渲染 + 互动播放器（Day 3，全天 6h）

1. 下载 2-3 个免费 Lottie 动画角色（从 LottieFiles.com）
2. 实现动画播放器组件（第七节 7.1）
3. 实现出题弹层组件（`quiz-overlay.tsx`）
4. 实现 `GET /api/lessons/{id}/player-data` 端点

**验证**：在浏览器打开播放器页面，能看到动画角色+听到配音+字幕+弹出互动题。

```bash
# 下载免费 Lottie 动画
# 推荐：去 lottiefiles.com 搜索 "teacher", "student", "thinking"
# 下载 JSON 格式放入 frontend/public/lottie/
```

---

### 第 7 步：AI 出题 + 代码测试（Day 3-4，4h）

1. 实现出题 Prompt（第五节 5.2）
2. 实现 `POST /api/lessons/{id}/generate-quiz` 端点
3. 实现 `POST /api/quizzes/{id}/submit` 端点
4. 实现代码测试组件（`code-playground.tsx`，用 Monaco Editor）

**验证**：生成一套题目，在播放器中正确弹出，答题后显示解析。代码编辑器能运行 Python 代码。

---

### 第 8 步：PPT 解析 + 复习指南（Day 4，4h）

1. 实现 PPT 解析服务（第六节 6.5）
2. 实现复习指南生成 Prompt（第五节 5.3）
3. 实现 `POST /api/lessons/{id}/generate-review` 端点
4. 前端展示复习指南 HTML

**验证**：上传一份 PPT 课件，确认文本和图片正确提取。生成复习指南能在浏览器中查看。

---

### 第 9 步：UI 打磨 + Landing Page（Day 4-5，3h）

1. 设计 Landing Page（问题 → 解决方案 → Demo 展示 → CTA）
2. 统一配色方案（主色 #2563EB，暗色背景 #0F172A）
3. 添加 Framer Motion 过渡动画
4. 响应式适配

**验证**：从 Landing Page → 注册 → 上传 → 生成 → 播放的完整流程走通。

---

### 第 10 步：Docker 部署 + 端到端测试（Day 5，3h）

```yaml
# docker-compose.yml
version: "3.9"
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/smartcourse.db
      - LLM_API_KEY=${LLM_API_KEY}
      - LLM_BASE_URL=${LLM_BASE_URL}
      - LLM_MODEL=${LLM_MODEL}
      - ASR_MODE=${ASR_MODE}
    volumes:
      - ./data:/app/data
```

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**验证**：`docker-compose up --build` 后访问 `http://localhost:3000` 完成全流程。

---

## 九、测试清单

### 9.1 后端测试

```python
# backend/tests/test_asr.py
import pytest
from app.services.asr_service import asr_service

@pytest.mark.asyncio
async def test_transcribe_mp3():
    result = await asr_service.transcribe("tests/fixtures/test_1min.mp3")
    assert "text" in result
    assert len(result["text"]) > 50
    assert "segments" in result

@pytest.mark.asyncio
async def test_extract_audio_from_mp4():
    audio_path = await asr_service._extract_audio_if_needed("tests/fixtures/test.mp4")
    assert audio_path.endswith(".wav")
```

```python
# backend/tests/test_script_generator.py
import pytest
from app.services.script_generator import script_generator

@pytest.mark.asyncio
async def test_generate_script():
    script = await script_generator.generate(
        transcript="二叉搜索树是一种特殊的二叉树。左子节点的值小于父节点，右子节点的值大于父节点。",
        lesson_title="二叉搜索树入门",
        subject="computer_science",
        duration_target=300
    )
    assert "title" in script
    assert "scenes" in script
    assert len(script["scenes"]) >= 3
    for scene in script["scenes"]:
        assert "narration" in scene
        assert "animation" in scene
```

### 9.2 端到端测试检查表

| # | 测试场景 | 验证方法 | 预期结果 |
|---|---------|---------|---------|
| 1 | 教师注册 | 填写表单提交 | 注册成功跳转仪表盘 |
| 2 | 创建课程 | 填写标题/学科 | 课程出现在列表 |
| 3 | 上传 MP3 录音 | 拖拽上传 | 显示进度，完成后状态变"转写中" |
| 4 | ASR 转写 | 点击"开始转写" | 转写结果显示在页面上 |
| 5 | 上传 PPT | 拖拽上传 | PPT 文本和图片正确提取 |
| 6 | 生成脚本 | 点击"AI 生成脚本" | 脚本 JSON 结构完整 |
| 7 | 编辑脚本 | 修改某场景旁白 | 修改保存成功 |
| 8 | 确认脚本 | 点击"确认并生成动画" | 状态变为"渲染中" |
| 9 | TTS 生成 | 自动触发 | 音频文件生成 |
| 10 | 播放动画 | 打开播放器页面 | 动画+配音+字幕同步播放 |
| 11 | 互动出题 | 播放到出题时间点 | 弹出题目，暂停播放 |
| 12 | 答题 | 选择答案提交 | 显示正确/错误+解析 |
| 13 | 代码测试 | 打开代码编辑器 | 能写代码并运行 |
| 14 | 复习指南 | 点击"生成复习指南" | HTML 讲义生成 |
| 15 | 学生观看 | 学生账号打开课程 | 能正常播放和答题 |

---

## 十、环境变量

```bash
# .env.example

# === LLM 配置 ===
LLM_API_KEY=sk-your-api-key-here
LLM_BASE_URL=https://api.openai.com/v1    # 或通义千问/Claude的endpoint
LLM_MODEL=gpt-4o                          # 或 qwen-max / claude-3.5-sonnet

# === ASR 配置 ===
ASR_MODE=local                             # local = 本地Whisper, api = OpenAI Whisper API
OPENAI_API_KEY=sk-your-openai-key          # ASR_MODE=api 时需要

# === 数据库 ===
DATABASE_URL=sqlite:///./data/smartcourse.db

# === 文件存储 ===
UPLOAD_DIR=./data/uploads
AUDIO_DIR=./data/audio

# === 安全 ===
SECRET_KEY=your-jwt-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 十一、黑客松 Demo 策略

### 必须展示的功能（Must-Show）

1. **上传 → 转写**：上传一段真实录音，展示 ASR 结果
2. **AI 脚本生成**：展示生成的洋葱风格脚本，突出比喻和出题点
3. **教师编辑**：修改一段旁白，展示"人在回路"的设计
4. **动画播放**：播放生成的动画课（哪怕动画很简单）
5. **互动出题**：播放过程中弹出题目并答题
6. **复习指南**：展示自动生成的复习材料

### 必须隐藏的部分（Must-Hide）

1. 如果 ASR 转写有错误 → 提前用一段完美转写替换
2. 如果动画渲染不完美 → 用录屏代替现场演示
3. 如果代码测试没做完 → 只展示截图
4. 后端错误日志 → 关闭 debug 模式

### Demo 数据准备

提前准备一份"完美 Demo 数据"：
- 一段 5 分钟的清晰录音（关于二叉搜索树或任何 CS 概念）
- 一份配套的 10 页 PPT
- 预先跑通全流程，保存所有中间结果
- 如果现场出问题，可以随时切换到预录数据

---

## 十二、孵化期扩展路线

黑客松 MVP 完成后，按以下优先级扩展：

| 阶段 | 时间 | 重点任务 |
|------|------|---------|
| Phase 1 | Month 0-1 | 修 Bug + 用户体验优化 + 动画质量提升（Remotion 替换） |
| Phase 2 | Month 1-3 | 多教师入驻 + 课程审核 + 学习数据分析仪表盘 |
| Phase 3 | Month 3-6 | 付费体系 + 大学定制化 + Computer use 教学完善 |
| Phase 4 | Month 6-12 | B2B 企业培训 + API 开放 + 多语言支持 |

### 技术升级路径

```
黑客松:  SQLite + 本地文件 + 单服务器
Phase 1: PostgreSQL + S3 + Docker
Phase 2: + Redis 缓存 + Celery 任务队列 + CDN
Phase 3: + Kubernetes + 微服务拆分 + 监控告警
Phase 4: + 多区域部署 + 数据合规 (GDPR/等保)
```

---

## 十三、常见问题

### Q: LLM 返回的 JSON 格式不对怎么办？
A: 使用 `response_format: {"type": "json_object"}` 强制 JSON 输出（GPT-4o 支持）。对于其他模型，在 prompt 末尾加 "你必须只输出合法的 JSON，不要包含任何其他文字。" 并加一层 `json.loads` + try/except 容错。

### Q: Whisper 本地太慢怎么办？
A: 黑客松环境建议用 API 模式（whisper-1），速度快且不需要 GPU。本地模式适合有 GPU 的服务器。也可以用 `whisper.cpp` 的 Python 绑定 `pywhisper-cpp`，CPU 推理速度更快。

### Q: Lottie 动画资源去哪找？
A: [LottieFiles](https://lottiefiles.com) 有大量免费动画。搜索 "teacher", "student", "education", "thinking", "celebration"。下载 JSON 格式放入 `public/lottie/`。

### Q: 前端动画效果不好怎么提升？
A: 黑客松阶段不追求动画质量，重点是流程跑通。如果需要提升：(1) 用 CSS 渐变背景替代纯色 (2) 加 Framer Motion 的 spring 动画 (3) 用 framer-motion 的 layout 动画实现元素平滑过渡。

### Q: 如何支持数学公式渲染？
A: 前端用 KaTeX（`npm install katex react-katex`）。脚本中的公式用 LaTeX 格式存储，播放器中用 `<TeX>` 组件渲染。

### Q: edge-tts 的中文效果如何？
A: 效果不错，特别是 `zh-CN-YunxiNeural`（年轻男声）和 `zh-CN-XiaoxiaoNeural`（年轻女声）。可以调整语速（rate）和音调（pitch）来匹配教学风格。

---

**本指南到此结束。按照 10 个步骤逐步执行，每步都有验证方法，5 天内可以交付一个可 Demo 的 MVP。祝黑客松顺利！**
