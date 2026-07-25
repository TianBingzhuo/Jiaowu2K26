import { useEffect, useId, useRef, useState } from "react";
import {
  Dismiss20Regular,
  Globe20Regular,
  Info20Regular,
  ShieldCheckmark20Regular,
  Sparkle20Regular,
  TargetArrow20Regular,
} from "@fluentui/react-icons";
import type { RoleId } from "../features/roles/types";
import {
  EXPERIENCE_BRIEFS,
  HUD_COPY,
  INSTITUTIONAL_WORKSPACE_BRIEFS,
  ROLE_BRIEFS,
  pickLocalized,
  type ExperienceKey,
} from "./catalog";
import { useI18n } from "./I18nProvider";
import "./bilingual-event-hud.css";

type BilingualEventHudProps = {
  experience: ExperienceKey;
  role: RoleId;
};

export function BilingualEventHud({
  experience,
  role,
}: BilingualEventHudProps) {
  const { locale, toggleLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const guideId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const copy = HUD_COPY[locale];
  const brief =
    experience === "career" && role !== "student"
      ? INSTITUTIONAL_WORKSPACE_BRIEFS[role]
      : EXPERIENCE_BRIEFS[experience];
  const roleBrief = ROLE_BRIEFS[role];

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (locale !== "en-US" || open) {
      setShowNowPlaying(false);
      return;
    }

    setShowNowPlaying(true);
    const timeout = window.setTimeout(() => setShowNowPlaying(false), 4800);
    return () => window.clearTimeout(timeout);
  }, [experience, locale, open, role]);

  const switchLanguage = () => {
    toggleLocale();
    setOpen(true);
  };

  return (
    <aside
      className={`bilingual-event-hud ${
        open ? "is-open" : ""
      }`}
      aria-label={
        locale === "zh-CN"
          ? "中英双语赛事导览"
          : "Bilingual event guide"
      }
    >
      {open && (
        <section
          id={guideId}
          className="bilingual-event-guide"
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${guideId}-heading`}
        >
          <header>
            <div>
              <span>{copy.eventMode}</span>
              <strong id={`${guideId}-heading`}>
                {brief.code} · {brief.title}
              </strong>
            </div>
            <div className="bilingual-event-guide__header-actions">
              <button
                className="bilingual-event-hud__language"
                type="button"
                aria-label={copy.languageAction}
                onClick={switchLanguage}
                data-focusable="true"
              >
                <Globe20Regular aria-hidden="true" />
                <span>
                  <small>{copy.languageLabel}</small>
                  <strong>{copy.languageButton}</strong>
                </span>
              </button>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={copy.close}
                onClick={() => setOpen(false)}
                data-focusable="true"
              >
                <Dismiss20Regular aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="bilingual-event-guide__hero">
            <span>{copy.formalName}</span>
            <strong>{pickLocalized(brief.formalName, locale)}</strong>
            <p>{pickLocalized(brief.tagline, locale)}</p>
          </div>

          <div className="bilingual-event-guide__lens">
            <Globe20Regular aria-hidden="true" />
            <span>
              <small>{copy.currentLens}</small>
              <strong>{pickLocalized(roleBrief.title, locale)}</strong>
              <p>{pickLocalized(roleBrief.summary, locale)}</p>
            </span>
          </div>

          <div className="bilingual-event-guide__grid">
            <article>
              <Info20Regular aria-hidden="true" />
              <span>
                <small>{copy.whatIsThis}</small>
                <p>{pickLocalized(brief.plainMeaning, locale)}</p>
              </span>
            </article>
            <article>
              <Sparkle20Regular aria-hidden="true" />
              <span>
                <small>{copy.whyItLands}</small>
                <p>{pickLocalized(brief.joke, locale)}</p>
              </span>
            </article>
            <article>
              <TargetArrow20Regular aria-hidden="true" />
              <span>
                <small>{copy.nextMove}</small>
                <p>{pickLocalized(brief.nextMove, locale)}</p>
              </span>
            </article>
            <article>
              <ShieldCheckmark20Regular aria-hidden="true" />
              <span>
                <small>{copy.safetyBoundary}</small>
                <p>{pickLocalized(brief.boundary, locale)}</p>
              </span>
            </article>
          </div>

          <section className="bilingual-event-guide__fixture">
            <strong>{copy.fixtureTitle}</strong>
            <p>{copy.fixtureBody}</p>
          </section>

          <section className="bilingual-event-guide__glossary">
            <strong>{copy.glossaryTitle}</strong>
            <dl>
              {copy.glossary.map(([term, definition]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{definition}</dd>
                </div>
              ))}
            </dl>
          </section>

          <footer>
            <strong>{copy.coverageTitle}</strong>
            <p>{copy.coverageBody}</p>
          </footer>
        </section>
      )}

      {!open && locale === "en-US" && showNowPlaying && (
        <div
          className="bilingual-event-hud__now-playing"
          role="status"
          aria-live="polite"
          aria-label={`Now playing ${brief.title}`}
        >
          <span>
            NOW PLAYING · {brief.code} · {brief.title}
          </span>
          <strong>{pickLocalized(brief.tagline, locale)}</strong>
        </div>
      )}

      {!open && (
        <div className="bilingual-event-hud__controls">
          <button
            className="bilingual-event-hud__guide"
            type="button"
            aria-expanded={false}
            aria-controls={guideId}
            aria-label={copy.guideAction}
            onClick={() => setOpen(true)}
            data-focusable="true"
          >
            <Sparkle20Regular aria-hidden="true" />
            <strong>{copy.guideButton}</strong>
          </button>
        </div>
      )}
    </aside>
  );
}
