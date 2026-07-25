[CmdletBinding()]
param(
    [switch]$AllowRulesFallback
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$apiRoot = 'http://127.0.0.1:3000/api/v1'
$status = Invoke-RestMethod -Uri "$apiRoot/ai/status" -Method Get -TimeoutSec 10
if (-not $status.configured -and -not $AllowRulesFallback) {
    throw 'AI is not configured. Run scripts/Configure-University2K26-AI.ps1 and enter an Open Platform key.'
}

$scenarios = @(
    @{
        Task = 'course_explanation'
        Subject = '信号与线性系统：卷积与系统响应'
        Question = '生成一条可验证、可自动保存的下一步学习路径。'
        SourceId = 'course-sls-convolution-fixture'
        Label = '当前掌握'
        Value = '已理解冲激响应定义，卷积积分换元仍不稳定。'
    },
    @{
        Task = 'opportunity_brief'
        Subject = 'AdventureX 2026'
        Question = '基于公开资格与个人目标，给出可复核的匹配说明。'
        SourceId = 'opportunity-adventurex-fixture'
        Label = '参与状态'
        Value = '参赛者；公开作品；视觉素材仍需通过 Rights Gate。'
    },
    @{
        Task = 'career_path'
        Subject = '应用物理到机器人系统软件'
        Question = '给出两周内能验证的跨学科职业探索实验。'
        SourceId = 'career-robotics-fixture'
        Label = '可核验经历'
        Value = '物理建模、实验测量、嵌入式竞赛与 Rust 软件基础。'
    },
    @{
        Task = 'student_support_case'
        Subject = '无障碍考试安排申请'
        Question = '只根据授权状态，列出下一步材料核验与人工转介动作。'
        SourceId = 'case-accessibility-fixture'
        Label = '申请状态'
        Value = '本人已提交申请；支持材料待补充；未授权健康诊断字段。'
    },
    @{
        Task = 'teaching_improvement'
        Subject = 'Bode 图教学改进回合'
        Question = '把学习证据拆开，提出一项可回滚、可观察的教学实验。'
        SourceId = 'teaching-bode-fixture'
        Label = '课堂证据'
        Value = '概念检查正确率改善，但相位与群时延解释仍混淆。'
    },
    @{
        Task = 'curriculum_impact'
        Subject = 'SLS 240 先修规则 What-if'
        Question = '列出路径、容量、跨院依赖与未知项，不发布正式培养方案。'
        SourceId = 'curriculum-sls-prereq-fixture'
        Label = '拟议变更'
        Value = '把高等数学从严格前置改为可并修；尚未获得跨院确认。'
    },
    @{
        Task = 'policy_impact'
        Subject = '跨校学分认定政策沙盒'
        Question = '生成带例外、申诉、责任人和回滚点的影响核验清单。'
        SourceId = 'policy-credit-transfer-fixture'
        Label = '政策状态'
        Value = '仅为 2026.3 沙盒草案；受影响群体与例外仍需责任部门确认。'
    }
)

$results = foreach ($scenario in $scenarios) {
    $body = @{
        task = $scenario.Task
        subject = $scenario.Subject
        question = $scenario.Question
        locale = 'zh-CN'
        facts = @(
            @{
                label = $scenario.Label
                value = $scenario.Value
                source_id = $scenario.SourceId
            }
        )
    } | ConvertTo-Json -Depth 6
    $advice = Invoke-RestMethod `
        -Uri "$apiRoot/ai/advice" `
        -Method Post `
        -ContentType 'application/json; charset=utf-8' `
        -Body $body `
        -TimeoutSec 60

    if ($advice.formal_decision -ne $false) {
        throw "$($scenario.Task) incorrectly claimed a formal decision."
    }
    if ($advice.source_ids -notcontains $scenario.SourceId) {
        throw "$($scenario.Task) did not preserve the supplied source ID."
    }
    if (-not $AllowRulesFallback -and $advice.mode -ne 'model') {
        throw "$($scenario.Task) did not produce a live model result."
    }
    [pscustomobject]@{
        Task = $scenario.Task
        Mode = $advice.mode
        Provider = $advice.provider
        Model = $advice.model
        SourceBound = $true
        FormalDecision = $advice.formal_decision
    }
}

$results | Format-Table -AutoSize
Write-Host 'University2K26 AI smoke test passed without exposing credentials or private payloads.' -ForegroundColor Green
