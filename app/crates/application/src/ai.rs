//! Provider-neutral AI advice port.
//!
//! The application contract deliberately separates model output from formal
//! university decisions. Adapters may call a local sovereign model, a
//! user-provided cloud provider, or return an explicit rules fallback.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AiTask {
    StudentSupportCase,
    TeachingImprovement,
    CurriculumImpact,
    PolicyImpact,
    CareerPath,
    OpportunityBrief,
    CourseExplanation,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct AiFact {
    pub label: String,
    pub value: String,
    pub source_id: String,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct AiAdviceRequest {
    pub task: AiTask,
    pub subject: String,
    pub question: String,
    pub locale: String,
    pub facts: Vec<AiFact>,
}

impl AiAdviceRequest {
    pub fn validate(&self) -> Result<(), AiGatewayError> {
        if self.subject.trim().is_empty() || self.subject.chars().count() > 160 {
            return Err(AiGatewayError::InvalidRequest(
                "subject must contain 1 to 160 characters".to_owned(),
            ));
        }
        if self.question.trim().is_empty() || self.question.chars().count() > 1_200 {
            return Err(AiGatewayError::InvalidRequest(
                "question must contain 1 to 1200 characters".to_owned(),
            ));
        }
        if self.facts.is_empty() || self.facts.len() > 24 {
            return Err(AiGatewayError::InvalidRequest(
                "facts must contain 1 to 24 source-bound items".to_owned(),
            ));
        }
        if self.facts.iter().any(|fact| {
            fact.label.trim().is_empty()
                || fact.value.trim().is_empty()
                || fact.source_id.trim().is_empty()
                || fact.label.chars().count() > 120
                || fact.value.chars().count() > 800
                || fact.source_id.chars().count() > 160
        }) {
            return Err(AiGatewayError::InvalidRequest(
                "each fact requires bounded label, value and source_id".to_owned(),
            ));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct AiSuggestion {
    pub title: String,
    pub rationale: String,
    pub next_step: String,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AiAdviceMode {
    Model,
    RulesFallback,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct AiAdvice {
    pub mode: AiAdviceMode,
    pub provider: String,
    pub model: String,
    pub title: String,
    pub summary: String,
    pub suggestions: Vec<AiSuggestion>,
    pub caveats: Vec<String>,
    pub source_ids: Vec<String>,
    pub formal_decision: bool,
    pub generated_at: String,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct AiGatewayStatus {
    pub configured: bool,
    pub provider: String,
    pub model: String,
    pub credential_source: String,
    pub local_first_supported: bool,
    pub detail: String,
}

#[derive(Clone, Debug, Error, PartialEq, Eq)]
pub enum AiGatewayError {
    #[error("AI gateway is not configured")]
    NotConfigured,
    #[error("invalid AI request: {0}")]
    InvalidRequest(String),
    #[error("AI provider is unavailable: {0}")]
    ProviderUnavailable(String),
    #[error("AI provider returned an invalid response: {0}")]
    InvalidResponse(String),
}

#[async_trait]
pub trait AiGateway: Send + Sync {
    async fn status(&self) -> AiGatewayStatus;
    async fn advise(&self, request: &AiAdviceRequest) -> Result<AiAdvice, AiGatewayError>;
}

#[must_use]
pub fn current_utc_rfc3339() -> String {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |duration| duration.as_secs());
    unix_seconds_to_rfc3339(seconds)
}

fn unix_seconds_to_rfc3339(seconds: u64) -> String {
    let days = i64::try_from(seconds / 86_400).unwrap_or(i64::MAX);
    let seconds_of_day = seconds % 86_400;
    let hour = seconds_of_day / 3_600;
    let minute = (seconds_of_day % 3_600) / 60;
    let second = seconds_of_day % 60;

    // Proleptic Gregorian conversion adapted from Howard Hinnant's
    // civil-from-days algorithm. Unix timestamps used here are non-negative.
    let z = days.saturating_add(719_468);
    let era = z / 146_097;
    let day_of_era = z - era * 146_097;
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let mut year = year_of_era + era * 400;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_prime = (5 * day_of_year + 2) / 153;
    let day = day_of_year - (153 * month_prime + 2) / 5 + 1;
    let month = month_prime + if month_prime < 10 { 3 } else { -9 };
    if month <= 2 {
        year += 1;
    }
    format!("{year:04}-{month:02}-{day:02}T{hour:02}:{minute:02}:{second:02}Z")
}

/// Deterministic, source-bound fallback used when no model credential exists or
/// a provider is temporarily unavailable. It never pretends to be model output.
#[must_use]
pub fn rules_fallback_advice(request: &AiAdviceRequest, degraded_reason: Option<&str>) -> AiAdvice {
    let source_ids = request
        .facts
        .iter()
        .map(|fact| fact.source_id.clone())
        .collect::<Vec<_>>();
    let first_fact = &request.facts[0];
    let task_action = match request.task {
        AiTask::StudentSupportCase => (
            "先确认学生本人诉求",
            "核对授权范围、申请材料与期望结果；不要从提醒推断诊断或处分。",
            "向学生发送可撤回的材料补充请求，保留人工转介选项。",
        ),
        AiTask::TeachingImprovement => (
            "先拆分教学证据",
            "把学习结果、学生体验、同行观察和教师自评分开，避免生成教师总分。",
            "选择一个可逆教学改动并声明观察窗口与复盘日期。",
        ),
        AiTask::CurriculumImpact => (
            "先运行培养方案 What-if",
            "课程前后置改变会同时影响路径、容量、跨院依赖与毕业时间。",
            "保留当前版本，生成受影响人群与最小冲突集后再进入审批。",
        ),
        AiTask::PolicyImpact => (
            "先完成政策影响包",
            "校级规则必须展示假设、版本、适用人群、例外、申诉与回滚条件。",
            "把未知项退回责任部门确认，不让系统补猜。",
        ),
        AiTask::CareerPath => (
            "先比较可逆路径",
            "发展建议必须基于可核验经历，并把正在学习与已经掌握分开。",
            "选择一个两周内可验证的小实验，再决定是否扩大投入。",
        ),
        AiTask::OpportunityBrief => (
            "先核验资格与权利",
            "公开活动页面不自动等于素材、商标或个人信息的再使用许可。",
            "通过 Rights Gate 后再提交；保留来源、许可范围与无背书声明。",
        ),
        AiTask::CourseExplanation => (
            "先对齐模型边界",
            "解释应从前置概念、条件、可观测证据和常见误区逐层展开。",
            "先做一个可自动保存的小练习，再用来源回放检查推理。",
        ),
    };

    let mut caveats = vec![
        "这是规则引擎回退，不是大模型输出。".to_owned(),
        "不构成成绩、学籍、人事、医疗、处分或录取决定。".to_owned(),
    ];
    if let Some(reason) = degraded_reason {
        caveats.push(format!("模型通路未使用：{reason}"));
    }

    AiAdvice {
        mode: AiAdviceMode::RulesFallback,
        provider: "university2k26-rules".to_owned(),
        model: "deterministic-v1".to_owned(),
        title: task_action.0.to_owned(),
        summary: format!(
            "{} 当前首条依据：{}＝{}。",
            task_action.1, first_fact.label, first_fact.value
        ),
        suggestions: vec![
            AiSuggestion {
                title: "下一回合".to_owned(),
                rationale: task_action.1.to_owned(),
                next_step: task_action.2.to_owned(),
                source_ids: source_ids.clone(),
            },
            AiSuggestion {
                title: "Replay 检查".to_owned(),
                rationale: "建议必须能追溯到输入事实，并允许责任人纠错或拒绝。".to_owned(),
                next_step: "复核来源时间、用途授权和未知项，再由责任人确认。".to_owned(),
                source_ids: source_ids.clone(),
            },
        ],
        caveats,
        source_ids,
        formal_decision: false,
        generated_at: current_utc_rfc3339(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request() -> AiAdviceRequest {
        AiAdviceRequest {
            task: AiTask::StudentSupportCase,
            subject: "无障碍考试安排申请".to_owned(),
            question: "下一步应如何处理？".to_owned(),
            locale: "zh-CN".to_owned(),
            facts: vec![AiFact {
                label: "申请状态".to_owned(),
                value: "材料待补充".to_owned(),
                source_id: "case-fixture-001".to_owned(),
            }],
        }
    }

    #[test]
    fn validates_bounded_source_bound_request() {
        assert!(request().validate().is_ok());
        let mut invalid = request();
        invalid.facts.clear();
        assert!(matches!(
            invalid.validate(),
            Err(AiGatewayError::InvalidRequest(_))
        ));
    }

    #[test]
    fn fallback_never_claims_model_or_formal_decision() {
        let advice = rules_fallback_advice(&request(), Some("credential not configured"));
        assert_eq!(advice.mode, AiAdviceMode::RulesFallback);
        assert!(!advice.formal_decision);
        assert_eq!(advice.source_ids, vec!["case-fixture-001"]);
        assert!(
            advice
                .caveats
                .iter()
                .any(|item| item.contains("不是大模型输出"))
        );
    }

    #[test]
    fn every_supported_task_has_a_source_bound_fallback() {
        let tasks = [
            AiTask::StudentSupportCase,
            AiTask::TeachingImprovement,
            AiTask::CurriculumImpact,
            AiTask::PolicyImpact,
            AiTask::CareerPath,
            AiTask::OpportunityBrief,
            AiTask::CourseExplanation,
        ];
        for task in tasks {
            let mut input = request();
            input.task = task;
            let advice = rules_fallback_advice(&input, Some("fixture"));
            assert_eq!(advice.mode, AiAdviceMode::RulesFallback);
            assert!(!advice.formal_decision);
            assert_eq!(advice.source_ids, vec!["case-fixture-001"]);
            assert!(!advice.suggestions.is_empty());
            assert!(
                advice
                    .suggestions
                    .iter()
                    .all(|item| item.source_ids == vec!["case-fixture-001"])
            );
        }
    }

    #[test]
    fn timestamp_conversion_is_rfc3339_utc() {
        assert_eq!(unix_seconds_to_rfc3339(0), "1970-01-01T00:00:00Z");
        assert_eq!(
            unix_seconds_to_rfc3339(1_720_742_400),
            "2024-07-12T00:00:00Z"
        );
    }
}
