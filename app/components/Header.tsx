'use client';

import { colors } from '../utils/colors';

interface HeaderProps {
  presence: string[];
}

export default function Header({ presence }: HeaderProps) {
  return (
    <>
      <h1 style={{ textAlign: 'center', fontWeight: 500, letterSpacing: 1, color: colors.text, fontSize: 44, marginBottom: 8, textShadow: colors.shadow }}>
        Tether
      </h1>
      <div style={{ textAlign: 'center', marginBottom: 24, color: colors.accent2, fontWeight: 500, fontSize: 18 }}>
        <span>Here now: {presence.join(', ') || 'just you'}</span>
      </div>
    </>
  );
} 