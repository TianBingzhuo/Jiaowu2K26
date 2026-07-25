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
            "先听学生把话说完",
            "核对本人诉求、已授权材料和希望得到的帮助；一条提醒不能替学生下诊断。",
            "请学生补充缺少的材料，并清楚告诉他：可以撤回，也可以转交人工继续处理。",
        ),
        AiTask::TeachingImprovement => (
            "先找到最值得改的一小步",
            "把学习结果、学生感受、同行观察和教师自评分别看，不把它们硬压成一个总分。",
            "先试一个随时能撤回的教学调整，约好观察多久、哪天回来复盘。",
        ),
        AiTask::CurriculumImpact => (
            "先看看改课会牵动谁",
            "一门课换了前后置，培养路径、班额、跨院依赖和毕业时间都可能跟着动。",
            "保留现在的方案，列出受影响的人和最难同时满足的条件，再交给负责人决定。",
        ),
        AiTask::PolicyImpact => (
            "先把这条规则讲清楚",
            "说明它基于什么、适用于谁、有哪些例外，以及学生怎样申诉、学校怎样撤回。",
            "不确定的地方交回责任部门确认，系统不替人猜。",
        ),
        AiTask::CareerPath => (
            "先试一条走得回来的路",
            "只根据能够核对的经历提建议，也会把“正在学”和“已经会”分开。",
            "挑一个两周内能得到反馈的小任务，做完再决定要不要继续加码。",
        ),
        AiTask::OpportunityBrief => (
            "先确认你能参加，也能这样使用材料",
            "活动页面公开，不代表其中的图片、标志和个人信息都可以随意再用。",
            "提交前再核对一次许可范围，并保留出处和必要说明。",
        ),
        AiTask::CourseExplanation => (
            "先把这道题的边界画出来",
            "从前置概念、成立条件、能观察到的证据和常见误区，一层一层拆开讲。",
            "先做一道会自动保存的小练习，再沿着引用回看推理有没有跳步。",
        ),
    };

    let mut caveats = vec![
        "AI 这次没上场，下面是本地规则给出的参考步骤。".to_owned(),
        "它只帮你理清下一步，不能替学校或负责人作决定。".to_owned(),
    ];
    if let Some(reason) = degraded_reason {
        caveats.push(format!("AI 暂未参与：{reason}"));
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
                title: "回看依据".to_owned(),
                rationale: "每条建议都能找到它用了哪些事实，也允许负责人纠正或不采用。".to_owned(),
                next_step: "检查来源时间、允许用途和仍不确定的地方，再请负责人确认。".to_owned(),
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
                .any(|item| item.contains("AI 这次没上场"))
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
