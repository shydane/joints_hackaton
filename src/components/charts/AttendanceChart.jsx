import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'

/**
 * Grafik kehadiran siswa.
 */
export default function AttendanceChart({ data, height = 200 }) {
  return (
    <div className="neo-card bg-white">
      <h4 className="text-sm font-bold mb-3 font-heading">📅 Tren Kehadiran</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#14213D20" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#14213D' }}
            axisLine={{ stroke: '#14213D' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#14213D' }}
            axisLine={{ stroke: '#14213D' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              border: '2px solid #14213D',
              borderRadius: '12px',
              boxShadow: '2px 2px 0 #14213D',
            }}
            formatter={(value) => [`${value}%`, 'Kehadiran']}
          />
          <ReferenceLine
            y={80}
            stroke="#FF7A3D"
            strokeDasharray="4 4"
            label={{ value: 'Batas 80%', fill: '#FF7A3D', fontSize: 11 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.value >= 80 ? '#8EE3C2' : '#FF7A3D'}
                stroke="#14213D"
                strokeWidth={1.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
