'use client';

import Link from 'next/link';
import { colors } from '../utils/colors';

interface ActionButtonsProps {
  isSurprising: boolean;
  onSurpriseMe: () => void;
}

export default function ActionButtons({ isSurprising, onSurpriseMe }: ActionButtonsProps) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <Link href="/discover" style={{ 
        display: 'inline-block',
        padding: '8px 16px',
        background: colors.accent2,
        color: '#FFF',
        textDecoration: 'none',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        marginLeft: 12
      }}>
        🔍 Discover
      </Link>
      <button onClick={onSurpriseMe} style={{
        padding: '8px 16px',
        background: colors.accent,
        color: '#FFF',
        border: 'none',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: isSurprising ? 'not-allowed' : 'pointer',
        marginLeft: 12,
        opacity: isSurprising ? 0.7 : 1
      }} disabled={isSurprising}>
        🎲 Surprise Me
      </button>
    </div>
  );
} 