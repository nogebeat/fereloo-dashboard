import { useState, useCallback } from 'react';

export interface CompanyInfo {
  name: string;
  sector: string;
}

function key(suffix: string, userId: string) {
  return `fereloo_ob_${suffix}_${userId}`;
}

export function useOnboarding(userId: string | undefined) {
  const [, rerender] = useState(0);
  const tick = useCallback(() => rerender((n) => n + 1), []);

  const companyInfo: CompanyInfo | null = userId
    ? (() => {
        const raw = localStorage.getItem(key('company', userId));
        return raw ? (JSON.parse(raw) as CompanyInfo) : null;
      })()
    : null;

  const checklistDismissed: boolean = userId
    ? localStorage.getItem(key('checklist_done', userId)) === '1'
    : false;

  const saveCompanyInfo = useCallback(
    (info: CompanyInfo) => {
      if (!userId) return;
      localStorage.setItem(key('company', userId), JSON.stringify(info));
      tick();
    },
    [userId, tick],
  );

  const dismissChecklist = useCallback(() => {
    if (!userId) return;
    localStorage.setItem(key('checklist_done', userId), '1');
    tick();
  }, [userId, tick]);

  return { companyInfo, checklistDismissed, saveCompanyInfo, dismissChecklist };
}

export const SECTORS = [
  'Commerce & Distribution',
  'Services aux entreprises',
  'Agriculture & Agro-industrie',
  'Technologie & Numérique',
  'Santé & Pharmacie',
  'Éducation & Formation',
  'Finance & Assurance',
  'Logistique & Transport',
  'Restauration & Hôtellerie',
  'Autre',
] as const;
