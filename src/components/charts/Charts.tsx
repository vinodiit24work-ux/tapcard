import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

/** Shared palette — categorical hues chosen to stay distinguishable and legible on white. */
export const chartColors = ['#5b4bff', '#ff7a45', '#0ea5e9', '#10b981', '#f59e0b', '#a855f7']

const axis = { stroke: '#98a2b3', fontSize: 11, tickLine: false, axisLine: false } as const
const grid = <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />

const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: '1px solid #e4e7ec', boxShadow: '0 8px 24px -8px rgb(16 24 40 / 0.14)', fontSize: 12, padding: '8px 12px' },
  labelStyle: { fontWeight: 600, color: '#0f1729', marginBottom: 2 },
  cursor: { fill: 'rgba(91,75,255,0.06)' },
}

export function ScanAreaChart({ data, height = 260 }: { data: { date: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b4bff" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#5b4bff" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {grid}
        <XAxis dataKey="date" {...axis} interval="preserveStartEnd" minTickGap={24} />
        <YAxis {...axis} width={44} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey="value" name="Scans" stroke="#5b4bff" strokeWidth={2.5} fill="url(#scanFill)" dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ClicksLineChart({ data, height = 260 }: { data: { date: string; whatsapp: number; calls: number; website: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        {grid}
        <XAxis dataKey="date" {...axis} interval="preserveStartEnd" minTickGap={24} />
        <YAxis {...axis} width={44} />
        <Tooltip {...tooltipStyle} cursor={{ stroke: '#d0d5dd' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Line type="monotone" dataKey="whatsapp" name="WhatsApp" stroke={chartColors[0]} strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="calls" name="Calls" stroke={chartColors[1]} strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="website" name="Website" stroke={chartColors[2]} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, height = 220 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%" paddingAngle={2} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v) => `${v as number}%`} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function HorizontalBars({ data, height = 260 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" horizontal={false} />
        <XAxis type="number" {...axis} />
        <YAxis type="category" dataKey="name" {...axis} width={104} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="value" name="Taps" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RevenueBars({ data, height = 280 }: { data: { month: string; subscriptions: number; orders: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        {grid}
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={58} tickFormatter={(v) => `₹${v}k`} />
        <Tooltip {...tooltipStyle} formatter={(v) => `₹${v as number}k`} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="subscriptions" name="Subscriptions" fill={chartColors[0]} radius={[6, 6, 0, 0]} barSize={18} />
        <Bar dataKey="orders" name="Physical orders" fill={chartColors[1]} radius={[6, 6, 0, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}
