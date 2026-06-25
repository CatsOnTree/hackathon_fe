import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarDays, CheckCircle2, Mail, MessageSquare, UserCheck, Users } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SkeletonBlock } from '../../components/common/Loading';
import { useDashboard } from '../../hooks/useDashboard';

const icons = [CalendarDays, Users, CheckCircle2, UserCheck, MessageSquare, Mail];
const colors = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#dc2626', '#475569'];

export function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const stats = [
    { label: 'Total Events', value: data?.events ?? 0 },
    { label: 'Participants', value: data?.participants ?? 0 },
    { label: 'Checked In', value: data?.checkedIn ?? 0 },
    { label: 'Assigned', value: data?.assigned ?? 0 },
    { label: 'Feedback Submitted', value: data?.feedbackSubmitted ?? 0 },
    { label: 'Emails Sent', value: data?.emailsSent ?? 0 },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Live recruitment event activity and operational counts." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = icons[index];
          return (
            <div className="surface p-5" key={stat.label}>
              {isLoading ? (
                <SkeletonBlock className="h-20" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-zinc-100">
                    <Icon className="h-6 w-6" style={{ color: colors[index] }} />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="surface p-5">
          <h2 className="mb-4 font-semibold">Recruitment Funnel</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-12} height={70} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.map((_, index) => (
                    <Cell key={index} fill={colors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface p-5">
          <h2 className="mb-4 font-semibold">Activity Mix</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.slice(1)} dataKey="value" nameKey="label" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {stats.slice(1).map((_, index) => (
                    <Cell key={index} fill={colors[index + 1]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {stats.slice(1, 4).map((item, index) => (
              <div className="flex items-center justify-between text-sm" key={item.label}>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index + 1] }} />
                  {item.label}
                </span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface mt-6 p-5">
        <h2 className="mb-4 font-semibold">Recent Activity</h2>
        <div className="space-y-3 text-sm text-zinc-600">
          <p>Dashboard counts refresh automatically through React Query when related pages create records.</p>
          <p>Seed data from the backend makes this view useful immediately after the first Spring Boot startup.</p>
        </div>
      </section>
    </>
  );
}
