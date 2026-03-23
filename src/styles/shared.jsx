/**
 * Shared styled-component primitives.
 * All primitives reference the CSS variables defined in styles.css
 * so class-based themes (body.theme-*) still apply automatically.
 */
import styled, { css } from 'styled-components';

// ─── Modal ────────────────────────────────────────────────────────────────────

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ $zIndex }) => $zIndex ?? 1100};
`;

export const ModalBox = styled.div`
  background: var(--parchment);
  border: 2px solid var(--gold);
  border-radius: 8px;
  padding: ${({ $padding }) => $padding ?? '20px'};
  max-width: ${({ $maxWidth }) => $maxWidth ?? '480px'};
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px var(--shadow-heavy);
  text-align: ${({ $center }) => ($center ? 'center' : 'left')};
`;

export const ModalTitle = styled.h3`
  font-family: 'Cinzel', serif;
  color: var(--red-dark);
  margin: 0 0 14px;
  font-size: 1.1rem;
`;

export const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: var(--ink-light);
  line-height: 1;
  padding: 2px 6px;
  z-index: 10;
  &:hover { color: var(--ink); }
`;

// ─── Cards / Containers ───────────────────────────────────────────────────────

export const GoldCard = styled.div`
  background: ${({ $bg }) => $bg ?? 'white'};
  border: ${({ $thick }) => ($thick ? '2px' : '1px')} solid var(--gold);
  border-radius: ${({ $radius }) => $radius ?? '8px'};
  padding: ${({ $padding }) => $padding ?? '12px'};
  box-shadow: ${({ $shadow }) => ($shadow !== false ? '0 2px 6px var(--shadow)' : 'none')};
`;

export const ParchmentBox = styled.div`
  background: var(--parchment-dark, #e8dcc5);
  border: 1px solid var(--gold);
  border-radius: 8px;
  padding: ${({ $padding }) => $padding ?? '12px'};
`;

// ─── Typography ───────────────────────────────────────────────────────────────

export const CinzelLabel = styled.span`
  font-family: 'Cinzel', serif;
  font-size: ${({ $size }) => $size ?? '0.7rem'};
  font-weight: ${({ $weight }) => $weight ?? '600'};
  color: var(--ink-light);
  text-transform: uppercase;
  letter-spacing: ${({ $tracking }) => $tracking ?? '0.08em'};
  display: ${({ $inline }) => ($inline ? 'inline' : 'block')};
`;

export const CinzelHeading = styled.h3`
  font-family: 'Cinzel', serif;
  font-size: ${({ $size }) => $size ?? '0.85rem'};
  font-weight: 700;
  color: ${({ $color }) => $color ?? 'var(--ink-light)'};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid var(--gold);
  padding-bottom: 4px;
  margin: 0 0 8px;
`;

// ─── Buttons ─────────────────────────────────────────────────────────────────

const baseBtn = css`
  font-family: 'Cinzel', serif;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--gold-dark);
  transition: opacity 0.15s, background 0.15s;
  line-height: 1.2;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.45; cursor: default; }
`;

/** Primary action button */
export const PrimaryBtn = styled.button`
  ${baseBtn}
  background: var(--gold);
  color: var(--ink);
  border-color: var(--gold-dark);
  padding: ${({ $sm }) => ($sm ? '4px 10px' : '8px 18px')};
  font-size: ${({ $sm }) => ($sm ? '0.72rem' : '0.85rem')};
  border-radius: ${({ $pill }) => ($pill ? '20px' : '6px')};
`;

/** Danger/destructive button */
export const DangerBtn = styled.button`
  ${baseBtn}
  background: var(--red);
  color: white;
  border-color: var(--red-dark);
  padding: ${({ $sm }) => ($sm ? '4px 10px' : '8px 18px')};
  font-size: ${({ $sm }) => ($sm ? '0.72rem' : '0.85rem')};
  border-radius: ${({ $pill }) => ($pill ? '20px' : '6px')};
`;

/** Ghost / outline button */
export const GhostBtn = styled.button`
  ${baseBtn}
  background: white;
  color: var(--ink);
  border-color: var(--gold-dark);
  padding: ${({ $sm }) => ($sm ? '3px 9px' : '7px 16px')};
  font-size: ${({ $sm }) => ($sm ? '0.72rem' : '0.85rem')};
  border-radius: ${({ $pill }) => ($pill ? '20px' : '6px')};
  &.active {
    background: var(--red);
    color: white;
    border-color: var(--red-dark);
  }
`;

/** Icon / bare button */
export const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $color }) => $color ?? 'var(--ink-light)'};
  font-size: ${({ $size }) => $size ?? '1rem'};
  padding: ${({ $padding }) => $padding ?? '2px 6px'};
  line-height: 1;
  &:hover { opacity: 0.7; }
`;

// ─── Form ─────────────────────────────────────────────────────────────────────

/** Styled number input for stat/HP values */
export const StatInput = styled.input.attrs({ type: 'number' })`
  font-family: 'Crimson Text', serif;
  font-size: ${({ $size }) => $size ?? '1.3rem'};
  font-weight: 700;
  color: var(--ink);
  text-align: center;
  background: transparent;
  border: ${({ $underline }) => ($underline ? 'none' : '1px solid var(--gold)')};
  border-bottom: ${({ $underline }) => ($underline ? '2px solid var(--gold)' : undefined)};
  border-radius: ${({ $underline }) => ($underline ? '0' : '4px')};
  width: ${({ $width }) => $width ?? '72px'};
  padding: 4px;
  /* hide spinners */
  -moz-appearance: textfield;
  appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;

// ─── Layout Helpers ───────────────────────────────────────────────────────────

export const Row = styled.div`
  display: flex;
  align-items: ${({ $align }) => $align ?? 'center'};
  justify-content: ${({ $justify }) => $justify ?? 'flex-start'};
  gap: ${({ $gap }) => $gap ?? '8px'};
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
`;

export const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ $gap }) => $gap ?? '10px'};
`;
