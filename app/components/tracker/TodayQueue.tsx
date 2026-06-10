'use client'

import { Application, todayStr, daysBetween, addDays } from './types'

interface Action {
  app: Application
  label: string
  cta: string
  urgency: number // lower = more urgent
  kind: 'follow_up' | 'apply' | 'prep'
}

export function buildTodayActions(applications: Application[]): Action[] {
  const today = todayStr()
  const actions: Action[] = []

  for (const app of applications) {
    if (['offer', 'rejected'].includes(app.status)) continue

    if (app.follow_up_date && app.follow_up_date <= today && app.status !== 'saved') {
      const late = daysBetween(app.follow_up_date, today)
      actions.push({
        app,
        label: late > 0 ? `Follow up with ${app.company} — ${late}d overdue` : `Follow up with ${app.company} today`,
        cta: '✨ Write follow-up',
        urgency: -late,
        kind: 'follow_up',
      })
    } else if (app.status === 'saved' && daysBetween(app.created_at.slice(0, 10), today) >= 3) {
      actions.push({
        app,
        label: `${app.company} has been sitting in Saved for ${daysBetween(app.created_at.slice(0, 10), today)} days`,
        cta: 'Apply or archive',
        urgency: 50,
        kind: 'apply',
      })
    } else if (app.status === 'interview' && !app.notes) {
      actions.push({
        app,
        label: `Interview at ${app.company} — no prep notes yet`,
        cta: 'Add prep notes',
        urgency: 10,
        kind: 'prep',
      })
    }
  }

  return actions.sort((a, b) => a.urgency - b.urgency).slice(0, 5)
}

export default function TodayQueue({
  applications,
  onOpenApp,
  onSnooze,
}: {
  applications: Application[]
  onOpenApp: (app: Application, openAiTab: boolean) => void
  onSnooze: (app: Application, newDate: string) => void
}) {
  const actions = buildTodayActions(applications)
  if (actions.length === 0) return null

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.08))', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 20, padding: '18px 20px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>⚡</span>
        <h3 style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0 }}>Today</h3>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5 }}>— {actions.length} thing{actions.length === 1 ? '' : 's'} that move the needle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((action, i) => (
          <div key={action.app.id + i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(11,11,15,0.5)', borderRadius: 13, padding: '11px 14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{action.kind === 'follow_up' ? '⏰' : action.kind === 'apply' ? '📌' : '📝'}</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13.5, flex: 1, minWidth: 180 }}>{action.label}</span>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {action.kind === 'follow_up' && (
                <button
                  onClick={() => onSnooze(action.app, addDays(todayStr(), 2))}
                  style={{ padding: '7px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Snooze 2d
                </button>
              )}
              <button
                onClick={() => onOpenApp(action.app, action.kind === 'follow_up')}
                style={{ padding: '7px 14px', borderRadius: 9, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                {action.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
