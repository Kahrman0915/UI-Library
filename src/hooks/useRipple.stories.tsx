import { useState } from 'react';
import { Heart, Minus, Plus } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import { useRipple } from './useRipple';
import Button from '../components/Button/Button';

/**
 * `useRipple` is an opt-in hook, not a component prop. Spread its `onPointerDown`
 * on any `.ui-ripple` element. These stories double as the "when to use it" guide.
 */
const meta: Meta = {
  title: 'Hooks/useRipple',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

const note = (children: React.ReactNode) => (
  <p
    style={{
      margin: '0 0 12px 0',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--text-sm)',
      lineHeight: 1.6,
      color: 'var(--muted-foreground)',
      maxWidth: 520,
    }}
  >
    {children}
  </p>
);

// A like button — stays on screen, so the ripple is actually seen. A good fit.
const LikeButton = () => {
  const { onPointerDown } = useRipple();
  const [liked, setLiked] = useState(false);
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onClick={() => setLiked((v) => !v)}
      aria-pressed={liked}
      className="ui-button ui-button--default ui-button--default-outline ui-button--sz-default ui-ripple"
      style={{ gap: 8 }}
    >
      <Heart
        fill={liked ? 'currentColor' : 'none'}
        style={{ width: 16, height: 16 }}
      />
      {liked ? 'Liked' : 'Like'}
    </button>
  );
};

// A quantity stepper — rapid in-place taps, each one wants acknowledgement.
const Stepper = () => {
  const { onPointerDown } = useRipple();
  const [qty, setQty] = useState(1);
  const cell =
    'ui-button ui-button--default ui-button--default-ghost ui-button--sz-default ui-button--icon-only ui-ripple';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button type="button" aria-label="Decrease" onPointerDown={onPointerDown} onClick={() => setQty((q) => Math.max(1, q - 1))} className={cell}>
        <Minus style={{ width: 16, height: 16 }} />
      </button>
      <span style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)', minWidth: 24, textAlign: 'center' }}>{qty}</span>
      <button type="button" aria-label="Increase" onPointerDown={onPointerDown} onClick={() => setQty((q) => q + 1)} className={cell}>
        <Plus style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
};

export const WhenToUseIt: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      {note(
        <>
          Use it on <strong>touch-first, in-place actions</strong> — a toggle,
          add-to-cart, like, or a quantity stepper — where the button stays on
          screen long enough to see the ~600ms wave. On touch there's no hover
          state, so the ripple is the tap's acknowledgement.
        </>,
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <LikeButton />
        <Stepper />
      </div>
    </div>
  ),
};

export const WhenNotToUseIt: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      {note(
        <>
          Skip it when the click <strong>navigates away</strong> (the wave is
          never seen), on desktop/mouse-only UIs (hover and <code>:active</code>
          already give feedback), and on dialog confirm/cancel. These plain
          Buttons have no ripple — that's the default, and usually the right call.
        </>,
      )}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button id="nav-next" label="Go to next page" />
        <Button id="nav-cancel" style="ghost" label="Cancel" />
      </div>
    </div>
  ),
};

export const HowToWireIt: Story = {
  render: () => {
    const { onPointerDown } = useRipple();
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {note(
          <>
            Spread <code>onPointerDown</code> on any element that also has the{' '}
            <code>ui-ripple</code> class (it supplies the{' '}
            <code>position: relative; overflow: hidden</code> that clips the wave).
            Works on a bare element, not just Button.
          </>,
        )}
        <div
          onPointerDown={onPointerDown}
          className="ui-ripple"
          role="button"
          tabIndex={0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 200,
            height: 96,
            borderRadius: 'var(--rounded-lg)',
            background: 'var(--card)',
            border: 'var(--border-w-100) solid var(--border)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          Press me
        </div>
      </div>
    );
  },
};
