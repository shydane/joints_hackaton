import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

/**
 * Grafik nilai siswa.
 */
export default function GradeChart({ data, height = 200 }) {
  return (
    <div className="neo-card bg-white">
      <h4 className="text-sm font-bold mb-3 font-heading">📊 Tren Nilai</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
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
          />
          <Tooltip
            contentStyle={{
              border: '2px solid #14213D',
              borderRadius: '12px',
              boxShadow: '2px 2px 0 #14213D',
            }}
          />
          <ReferenceLine
            y={70}
            stroke="#FF7A3D"
            strokeDasharray="4 4"
            label={{ value: 'KKM', fill: '#FF7A3D', fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#7CC6FE"
            strokeWidth={3}
            dot={{ fill: '#14213D', strokeWidth: 2, r: 4 }}
            activeDot={{ fill: '#FF7A3D', strokeWidth: 2, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
