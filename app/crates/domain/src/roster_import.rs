use crate::{DomainError, SCHEMA_VERSION};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

pub const ROSTER_SOLVER_PROTOCOL: &str = "conda_style_v1";

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogImportCourse {
    pub course_code: String,
    pub title: String,
    pub credits: f32,
    pub department: String,
    pub prerequisites: Vec<String>,
    pub corequisites: Vec<String>,
    pub exclusions: Vec<String>,
    pub offered_terms: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogImportValidationRequest {
    pub schema_version: String,
    pub institution: String,
    pub dataset_scope: String,
    pub source_locator: String,
    pub retrieved_at: String,
    pub terms_version: String,
    pub use_basis: String,
    pub checksum_sha256: String,
    pub catalog_version: String,
    pub courses: Vec<CatalogImportCourse>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CatalogImportValidationReceipt {
    pub schema_version: String,
    pub receipt_id: String,
    pub validation_status: String,
    pub institution: String,
    pub dataset_scope: String,
    pub catalog_channel: String,
    pub catalog_version: String,
    pub checksum_sha256: String,
    pub records_validated: usize,
    pub warnings: Vec<String>,
    pub imported: bool,
    pub persisted: bool,
    pub contains_enrollment_records: bool,
    pub is_formal_enrollment: bool,
    pub source_boundary: String,
}

impl CatalogImportValidationRequest {
    pub fn validate(&self) -> Result<CatalogImportValidationReceipt, DomainError> {
        if self.schema_version != SCHEMA_VERSION {
            return Err(invariant("unsupported catalog import schema version"));
        }
        if !matches!(self.institution.as_str(), "uarizona" | "hebut") {
            return Err(invariant("institution must be uarizona or hebut"));
        }
        let allowed_scope = match self.institution.as_str() {
            "uarizona" => self.dataset_scope == "public_course_catalog",
            "hebut" => matches!(
                self.dataset_scope.as_str(),
                "public_course_catalog" | "user_authorized_course_catalog"
            ),
            _ => false,
        };
        if !allowed_scope {
            return Err(invariant(
                "dataset scope is not allowed for the selected institution",
            ));
        }
        if self.institution == "uarizona"
            && !(self
                .source_locator
                .starts_with("https://catalog.arizona.edu/")
                || self
                    .source_locator
                    .starts_with("https://uaccess.schedule.arizona.edu/")
                || self
                    .source_locator
                    .starts_with("https://uacourses-api.uaccess.arizona.edu/"))
        {
            return Err(invariant(
                "UArizona imports require an approved public catalog or class-search source",
            ));
        }
        if self.institution == "hebut"
            && !(self.source_locator.starts_with("https://")
                || self.source_locator.starts_with("local-authorized://"))
        {
            return Err(invariant(
                "HEBUT imports require an HTTPS source or a path-free local-authorized locator",
            ));
        }
        require_bounded("retrieved_at", &self.retrieved_at, 8, 64)?;
        require_bounded("terms_version", &self.terms_version, 1, 120)?;
        require_bounded("use_basis", &self.use_basis, 3, 240)?;
        require_bounded("catalog_version", &self.catalog_version, 1, 120)?;
        if self.checksum_sha256.len() != 64
            || !self
                .checksum_sha256
                .chars()
                .all(|character| character.is_ascii_hexdigit())
        {
            return Err(invariant(
                "checksum_sha256 must contain exactly 64 hexadecimal characters",
            ));
        }
        if self.courses.is_empty() || self.courses.len() > 500 {
            return Err(invariant(
                "catalog validation accepts between 1 and 500 course records per batch",
            ));
        }

        let mut unique_codes = HashSet::new();
        for course in &self.courses {
            require_bounded("course_code", &course.course_code, 2, 32)?;
            require_bounded("course title", &course.title, 1, 160)?;
            require_bounded("department", &course.department, 1, 120)?;
            if !course.credits.is_finite() || !(0.0..=30.0).contains(&course.credits) {
                return Err(invariant("course credits must be between 0 and 30"));
            }
            if course.prerequisites.len() > 32
                || course.corequisites.len() > 32
                || course.exclusions.len() > 32
                || course.offered_terms.len() > 16
            {
                return Err(invariant(
                    "course dependency or term arrays exceed the validation bound",
                ));
            }
            let normalized = course.course_code.trim().to_ascii_uppercase();
            if !unique_codes.insert(normalized) {
                return Err(invariant(
                    "course codes must be unique within an import batch",
                ));
            }
        }

        let channel = format!(
            "{}::{}",
            self.institution.as_str(),
            self.dataset_scope.as_str()
        );
        Ok(CatalogImportValidationReceipt {
            schema_version: SCHEMA_VERSION.to_owned(),
            receipt_id: format!(
                "catalog-validation-{}-{}",
                self.institution,
                &self.checksum_sha256[..12]
            ),
            validation_status: "validated_only".to_owned(),
            institution: self.institution.clone(),
            dataset_scope: self.dataset_scope.clone(),
            catalog_channel: channel,
            catalog_version: self.catalog_version.clone(),
            checksum_sha256: self.checksum_sha256.to_ascii_lowercase(),
            records_validated: self.courses.len(),
            warnings: vec![
                "Validation does not prove licensing, current seat capacity, or transfer equivalency."
                    .to_owned(),
                "No records were persisted; an authorized human must promote this receipt."
                    .to_owned(),
            ],
            imported: false,
            persisted: false,
            contains_enrollment_records: false,
            is_formal_enrollment: false,
            source_boundary:
                "Course-catalog metadata only. Student, grade, payment and enrollment records are rejected."
                    .to_owned(),
        })
    }
}

fn require_bounded(
    field: &str,
    value: &str,
    minimum: usize,
    maximum: usize,
) -> Result<(), DomainError> {
    let length = value.trim().chars().count();
    if length < minimum || length > maximum {
        return Err(invariant(format!(
            "{field} must contain between {minimum} and {maximum} characters"
        )));
    }
    Ok(())
}

fn invariant(message: impl Into<String>) -> DomainError {
    DomainError::InvariantViolation(message.into())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request() -> CatalogImportValidationRequest {
        CatalogImportValidationRequest {
            schema_version: SCHEMA_VERSION.to_owned(),
            institution: "uarizona".to_owned(),
            dataset_scope: "public_course_catalog".to_owned(),
            source_locator: "https://catalog.arizona.edu/courses".to_owned(),
            retrieved_at: "2026-07-24T10:00:00Z".to_owned(),
            terms_version: "public-page-observed-2026-07-24".to_owned(),
            use_basis: "Public catalog metadata; terms require human review.".to_owned(),
            checksum_sha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                .to_owned(),
            catalog_version: "uarizona-public-candidate-2026-fall".to_owned(),
            courses: vec![CatalogImportCourse {
                course_code: "ECE 320A".to_owned(),
                title: "Signals and Systems".to_owned(),
                credits: 3.0,
                department: "Electrical and Computer Engineering".to_owned(),
                prerequisites: vec!["MATH 223".to_owned()],
                corequisites: vec![],
                exclusions: vec![],
                offered_terms: vec!["2026-Fall".to_owned()],
            }],
        }
    }

    #[test]
    fn validates_public_catalog_metadata_without_importing_it() {
        let receipt = request().validate().expect("catalog batch should validate");
        assert_eq!(receipt.validation_status, "validated_only");
        assert_eq!(receipt.records_validated, 1);
        assert!(!receipt.imported);
        assert!(!receipt.persisted);
        assert!(!receipt.is_formal_enrollment);
    }

    #[test]
    fn accepts_the_verified_uarizona_courses_api_origin() {
        let mut candidate = request();
        candidate.source_locator =
            "https://uacourses-api.uaccess.arizona.edu/courses?term_code=2262&subject_code=ECE"
                .to_owned();
        assert!(candidate.validate().is_ok());
    }

    #[test]
    fn rejects_restricted_uarizona_scope() {
        let mut candidate = request();
        candidate.dataset_scope = "student_enrollment_records".to_owned();
        assert!(candidate.validate().is_err());
    }

    #[test]
    fn rejects_unapproved_uarizona_source() {
        let mut candidate = request();
        candidate.source_locator = "https://example.test/catalog".to_owned();
        assert!(candidate.validate().is_err());
    }

    #[test]
    fn rejects_duplicate_course_codes() {
        let mut candidate = request();
        candidate.courses.push(candidate.courses[0].clone());
        assert!(candidate.validate().is_err());
    }
}
