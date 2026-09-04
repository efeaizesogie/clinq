import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface PatientNotification {
  id: string;
  category: 'appointment' | 'lab' | 'prescription' | 'message' | 'billing' | 'system';
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
  severity: 'info' | 'warning' | 'success' | 'urgent';
  actionUrl: string;
  actionLabel?: string;
  isRead?: boolean;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch user notification preferences
    const { data: settings } = await supabase
      .from('patient_settings')
      .select('*')
      .eq('patient_id', user.id)
      .maybeSingle();

    const notifSettings = {
      appointments: settings?.notif_appointments_push ?? true,
      labs: settings?.notif_labs_push ?? true,
      billing: settings?.notif_billing_push ?? true,
    };

    // 2. Concurrently fetch all patient resources
    const [
      apptsRes,
      labsRes,
      prescRes,
      billingRes,
      convsRes,
      timelineRes
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, specialists(full_name)')
        .eq('patient_id', user.id)
        .order('scheduled_at', { ascending: false }),
      supabase
        .from('patient_lab_results')
        .select('*')
        .eq('patient_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('patient_prescriptions')
        .select('*')
        .eq('patient_id', user.id)
        .order('prescribed_date', { ascending: false }),
      supabase
        .from('patient_billing')
        .select('*')
        .eq('patient_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('conversations')
        .select('*')
        .eq('participant_a', user.id)
        .order('last_message_at', { ascending: false }),
      supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('patient_id', user.id)
        .order('event_date', { ascending: false })
        .limit(5)
    ]);

    const notifications: PatientNotification[] = [];
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // ── Parse Appointments ──
    if (notifSettings.appointments && apptsRes.data) {
      for (const appt of apptsRes.data) {
        const apptDate = appt.date || appt.scheduled_at?.split('T')[0];
        const doctor = appt.specialists?.full_name || appt.assigned_doctor || 'Specialist';
        const isPast = apptDate < todayStr;
        const isToday = apptDate === todayStr;

        if (isToday) {
          notifications.push({
            id: `appt-today-${appt.id}`,
            category: 'appointment',
            title: `Appointment Today with ${doctor}`,
            description: `Scheduled at ${appt.time_start || '10:00 AM'}. Please check-in 15 minutes before your visit.`,
            timestamp: 'Today',
            createdAt: appt.created_at || now.toISOString(),
            severity: 'urgent',
            actionUrl: `/patient/appointments`,
            actionLabel: 'View Details'
          });
        } else if (!isPast) {
          notifications.push({
            id: `appt-upcoming-${appt.id}`,
            category: 'appointment',
            title: `Upcoming Consultation: ${doctor}`,
            description: `Your ${appt.department || 'clinical'} consultation is scheduled for ${apptDate} at ${appt.time_start || 'scheduled time'}.`,
            timestamp: apptDate,
            createdAt: appt.created_at || now.toISOString(),
            severity: 'info',
            actionUrl: `/patient/appointments`,
            actionLabel: 'Manage Visit'
          });
        } else if (appt.status === 'Pending') {
          notifications.push({
            id: `appt-missed-${appt.id}`,
            category: 'appointment',
            title: `Missed Appointment with ${doctor}`,
            description: `Your appointment on ${apptDate} was missed. Would you like to reschedule?`,
            timestamp: apptDate,
            createdAt: appt.created_at || now.toISOString(),
            severity: 'warning',
            actionUrl: `/patient/appointments/book?reschedule_id=${appt.id}&doctor_id=${appt.specialist_id || ''}&specialty=${encodeURIComponent(appt.department || '')}`,
            actionLabel: 'Reschedule Now'
          });
        }
      }
    }

    // ── Parse Messages ──
    if (convsRes.data) {
      for (const conv of convsRes.data) {
        if (conv.last_message_at) {
          notifications.push({
            id: `msg-${conv.id}`,
            category: 'message',
            title: `Message from ${conv.participant_b_name}`,
            description: `You have an ongoing clinical conversation thread with ${conv.participant_b_name}.`,
            timestamp: new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            createdAt: conv.last_message_at,
            severity: 'info',
            actionUrl: `/patient/messages`,
            actionLabel: 'Open Chat'
          });
        }
      }
    }

    // ── Parse Lab Results ──
    if (notifSettings.labs && labsRes.data) {
      for (const lab of labsRes.data) {
        if (lab.status === 'Reviewed') {
          notifications.push({
            id: `lab-rev-${lab.id}`,
            category: 'lab',
            title: `Lab Results Ready: ${lab.name}`,
            description: `Your laboratory diagnostics test from ${lab.provider || 'Pathology'} has been reviewed by your care provider.`,
            timestamp: lab.date,
            createdAt: lab.date ? `${lab.date}T00:00:00Z` : now.toISOString(),
            severity: 'success',
            actionUrl: `/patient/lab-results`,
            actionLabel: 'View Results'
          });
        } else if (lab.status === 'Pending') {
          notifications.push({
            id: `lab-pen-${lab.id}`,
            category: 'lab',
            title: `Lab Test In Progress: ${lab.name}`,
            description: `Laboratory processing is underway. Results usually take 24–48 hours.`,
            timestamp: lab.date,
            createdAt: lab.date ? `${lab.date}T00:00:00Z` : now.toISOString(),
            severity: 'info',
            actionUrl: `/patient/lab-results`,
            actionLabel: 'Track Status'
          });
        }
      }
    }

    // ── Parse Prescriptions ──
    if (prescRes.data) {
      for (const rx of prescRes.data) {
        if (rx.status === 'Active') {
          const refillsLeft = Number(rx.refills_remaining) || 0;
          if (refillsLeft <= 1) {
            notifications.push({
              id: `rx-refill-${rx.id}`,
              category: 'prescription',
              title: `Refill Reminder: ${rx.medication_name}`,
              description: `You have ${refillsLeft} refill${refillsLeft === 1 ? '' : 's'} remaining for ${rx.dosage}. Request a renewal promptly.`,
              timestamp: 'Action Needed',
              createdAt: rx.prescribed_date ? `${rx.prescribed_date}T00:00:00Z` : now.toISOString(),
              severity: 'warning',
              actionUrl: `/patient/prescriptions`,
              actionLabel: 'Request Refill'
            });
          }
        }
      }
    }

    // ── Parse Billing ──
    if (notifSettings.billing && billingRes.data) {
      for (const bill of billingRes.data) {
        if (bill.status === 'Pending') {
          notifications.push({
            id: `bill-pending-${bill.id}`,
            category: 'billing',
            title: `Invoice Due: ${bill.service}`,
            description: `An outstanding balance of ${bill.amount} is awaiting settlement.`,
            timestamp: bill.date,
            createdAt: now.toISOString(),
            severity: 'warning',
            actionUrl: `/patient/billing`,
            actionLabel: 'Pay Invoice'
          });
        }
      }
    }

    // ── Fallback system notifications if user is brand new ──
    if (notifications.length === 0) {
      notifications.push({
        id: 'sys-welcome',
        category: 'system',
        title: 'Welcome to Clinq Healthcare',
        description: 'Your clinical patient portal is active. You can schedule specialist appointments, track prescriptions, and review lab diagnostic reports.',
        timestamp: 'System',
        createdAt: now.toISOString(),
        severity: 'info',
        actionUrl: `/patient/appointments/book`,
        actionLabel: 'Book First Visit'
      });
      notifications.push({
        id: 'sys-profile',
        category: 'system',
        title: 'Complete Your Health Profile',
        description: 'Ensure your insurance and emergency contact details are up to date for expedited check-in.',
        timestamp: 'Account',
        createdAt: now.toISOString(),
        severity: 'info',
        actionUrl: `/patient/settings`,
        actionLabel: 'Update Profile'
      });
    }

    // Sort notifications with urgent/warning first, then newest
    const severityRank: Record<string, number> = { urgent: 0, warning: 1, info: 2, success: 3 };
    notifications.sort((a, b) => {
      const rankDiff = (severityRank[a.severity] ?? 2) - (severityRank[b.severity] ?? 2);
      if (rankDiff !== 0) return rankDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length,
      settings: notifSettings
    });

  } catch (err: any) {
    console.error("GET notifications error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
