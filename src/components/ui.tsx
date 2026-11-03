"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { assetRatio, assetUrl, type AssetName } from "../lib/assets";
import { MAX_LIVES } from "../lib/mock";

/* ── Sprite ──────────────────────────────────────────────────────────────── */

export function Sprite({
  name,
  width,
  className,
  style,
  alt = "",
}: {
  name: AssetName;
  /** Width in cqw (stage-width percent). */
  width?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetUrl(name)}
      alt={alt}
      draggable={false}
      className={className}
      style={{ width: width != null ? `${width}cqw` : undefined, aspectRatio: String(assetRatio(name)), ...style }}
    />
  );
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */

type BlankColor = "green" | "blue" | "red" | "cream" | "disabled";
const BLANK: Record<BlankColor, AssetName> = {
  green: "btn_blank_green",
  blue: "btn_blank_blue",
  red: "btn_blank_red",
  cream: "btn_blank_cream",
  disabled: "btn_blank_disabled",
};

/** Font size as a fraction of button width, shrinking for long labels so text stays inside. */
function labelScale(label: string): number {
  // Lilita One capitals are ~0.6em wide; keep the text within ~75% of the button.
  return Math.min(0.11, 0.75 / (Math.max(1, label.length) * 0.6));
}

/** UI demo: sound effects are left out, so a press has no side effects. */
export function pressFeedback() {}

export function GameButton({
  asset,
  color = "green",
  label,
  width = 56,
  onClick,
  disabled,
  loading,
  type = "button",
  ariaLabel,
  className = "",
  silent,
}: {
  /** A button image with its label baked in (e.g. btn_play). */
  asset?: AssetName;
  color?: BlankColor;
  label?: string;
  /** Width in cqw, or any CSS length (e.g. "min(62cqw, 28cqh)"). */
  width?: number | string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
  className?: string;
  silent?: boolean;
}) {
  const img = asset ?? BLANK[disabled ? "disabled" : color];
  const w = typeof width === "number" ? `${width}cqw` : width;
  return (
    <button
      type={type}
      className={`game-btn ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel ?? label}
      aria-busy={loading || undefined}
      onClick={() => {
        if (!silent) pressFeedback();
        onClick?.();
      }}
      style={{
        width: w,
        aspectRatio: String(assetRatio(img)),
        backgroundImage: `url(${assetUrl(img)})`,
      }}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        !asset &&
        label && (
          <span className={`game-btn-label ${color === "cream" ? "dark" : ""}`} style={{ fontSize: `calc(${w} * ${labelScale(label).toFixed(4)})` }}>
            {label}
          </span>
        )
      )}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  size = 12,
  onClick,
  className = "",
  disabled,
}: {
  icon: AssetName;
  label: string;
  size?: number;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      style={{ width: `${size}cqw` }}
      onClick={() => {
        pressFeedback();
        onClick?.();
      }}
    >
      <Sprite name={icon} />
    </button>
  );
}

/* ── Panels & titles ─────────────────────────────────────────────────────── */

export function Panel({
  title,
  titleClass = "",
  width = 88,
  children,
  onClose,
  className = "",
  style,
}: {
  title?: ReactNode;
  titleClass?: string;
  width?: number;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`panel ${title ? "" : "plain"} ${className}`} style={{ ["--pw" as string]: `${width}cqw`, ...style }}>
      {title && (
        <div
          className={`panel-title title-text ${titleClass}`}
          style={typeof title === "string" ? { fontSize: `calc(var(--pw) * ${Math.min(0.085, 0.95 / Math.max(1, title.length)).toFixed(4)})` } : undefined}
        >
          {title}
        </div>
      )}
      {onClose && <IconButton icon="icon_btn_close" label="Close" className="panel-close" size={12} onClick={onClose} />}
      <div className="panel-inner">{children}</div>
    </div>
  );
}

export function Ribbon({ children, width = 78, fontSize, className = "" }: { children: ReactNode; width?: number; fontSize?: number; className?: string }) {
  return (
    <div className={`ribbon ${className}`} style={{ width: `${width}cqw` }}>
      <span className="title-text" style={{ fontSize: `${fontSize ?? width * 0.085}cqw` }}>
        {children}
      </span>
    </div>
  );
}

/* ── HUD bits ────────────────────────────────────────────────────────────── */

export function Hearts({ lives, max = MAX_LIVES, size = 8, animateFrom }: { lives: number; max?: number; size?: number; animateFrom?: number }) {
  return (
    <div className="hearts" role="img" aria-label={`${lives} of ${max} lives`}>
      {Array.from({ length: max }, (_, i) => {
        const full = i < lives;
        const lost = animateFrom != null && i >= lives && i < animateFrom;
        const gained = animateFrom != null && i < lives && i >= animateFrom;
        return (
          <Sprite
            key={i}
            name={full ? "heart_full" : "heart_empty"}
            className={lost ? "lost" : gained ? "gained" : ""}
            style={{ width: `${size}cqw` }}
          />
        );
      })}
    </div>
  );
}

export function Pill({ icon, children, className = "", style }: { icon?: AssetName; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`pill ${className}`} style={style}>
      {icon && <Sprite name={icon} />}
      <span>{children}</span>
    </div>
  );
}

/* ── Forms ───────────────────────────────────────────────────────────────── */

export function TextField({
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  autoComplete,
  maxLength,
  inputMode,
  autoFocus,
  children,
  name,
}: {
  icon: AssetName;
  type?: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: string;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: "text" | "email";
  autoFocus?: boolean;
  children?: ReactNode;
  name?: string;
}) {
  const [show, setShow] = useState(false);
  const id = useId();
  const isPw = type === "password";
  return (
    <div className={`field ${error ? "invalid" : ""}`}>
      <label className="field-box" htmlFor={id}>
        <Sprite name={icon} />
        <input
          id={id}
          name={name}
          type={isPw && show ? "text" : type}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-invalid={!!error}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoCapitalize={type === "text" ? "words" : "none"}
          autoCorrect="off"
          spellCheck={false}
          maxLength={maxLength}
          inputMode={inputMode}
          autoFocus={autoFocus}
          enterKeyHint="next"
        />
        {isPw && (
          <button type="button" className="field-eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)}>
            <Sprite name={show ? "icon_eye_hide" : "icon_eye_show"} />
          </button>
        )}
      </label>
      {error ? <div className="field-error" role="alert">{error}</div> : hint ? <div className="field-hint">{hint}</div> : null}
      {children}
    </div>
  );
}

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="toggle"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        pressFeedback();
        onChange(!on);
      }}
    >
      <Sprite name={on ? "toggle_on" : "toggle_off"} />
    </button>
  );
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button type="button" className="check-row" role="checkbox" aria-checked={checked} onClick={() => onChange(!checked)}>
      <Sprite name={checked ? "checkbox_checked" : "checkbox_unchecked"} />
      <span>{children}</span>
    </button>
  );
}

/* ── Loading & ambience ──────────────────────────────────────────────────── */

export function Loader({ text = "Loading…", detail }: { text?: string; detail?: ReactNode }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <Sprite name="loader_ship_wheel" />
      <span>{text}</span>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export function BubbleBar({ progress, count = 10 }: { progress: number; count?: number }) {
  const on = Math.round(Math.max(0, Math.min(1, progress)) * count);
  return (
    <div className="bubble-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} className={i < on ? "on" : ""} />
      ))}
    </div>
  );
}

export function Bubbles({ count = 14 }: { count?: number }) {
  // Randomised once on the client to avoid hydration mismatches.
  const [seed, setSeed] = useState<number[] | null>(null);
  useEffect(() => setSeed(Array.from({ length: count * 4 }, () => Math.random())), [count]);
  const items = useMemo(() => {
    if (!seed) return [];
    return Array.from({ length: count }, (_, i) => {
      const r = (k: number) => seed[i * 4 + k];
      const size = 2 + r(0) * 5;
      return {
        left: `${r(1) * 100}%`,
        width: `${size}cqw`,
        height: `${size}cqw`,
        animationDuration: `${7 + r(2) * 9}s`,
        animationDelay: `${-r(3) * 14}s`,
      };
    });
  }, [seed, count]);
  return (
    <div className="bubbles" aria-hidden>
      {items.map((s, i) => (
        <span key={i} style={s} />
      ))}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */

export function Modal({ children, onBackdrop }: { children: ReactNode; onBackdrop?: () => void }) {
  useEffect(() => {
    if (!onBackdrop) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onBackdrop();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBackdrop]);
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onBackdrop?.()}>
      {children}
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
  loading,
  children,
}: {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Modal onBackdrop={loading ? undefined : onCancel}>
      <Panel title={title} width={84} className="pop-in">
        <p className="body-text" style={{ margin: 0 }}>{message}</p>
        {children}
        <GameButton color={danger ? "red" : "green"} label={confirmLabel} width={52} onClick={onConfirm} loading={loading} />
        <GameButton color="cream" label={cancelLabel} width={44} onClick={onCancel} disabled={loading} />
      </Panel>
    </Modal>
  );
}
