/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: any, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }) {
  if (!date) return '...';
  if (typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString('tr-TR', options);
  }
  const d = new Date(date);
  return isNaN(d.getTime()) ? '...' : d.toLocaleDateString('tr-TR', options);
}
