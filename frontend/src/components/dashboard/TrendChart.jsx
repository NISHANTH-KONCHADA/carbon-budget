import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TrendChart({ trend }) {
  if (!trend || trend.length === 0) {
    return <p className="text-sm text-ink/60">Not enough data yet to show a trend.</p>;
  }

  return (
    <div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={trend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#DDE3DC" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#16241F99' }}
              tickFormatter={(d) => d.slice(5)}
              axisLine={{ stroke: '#DDE3DC' }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#16241F99' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              formatter={(value) => [`${value} kg CO2e`, 'Total']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ borderRadius: 10, borderColor: '#DDE3DC', fontSize: 13 }}
            />
            <Line type="monotone" dataKey="co2eKg" stroke="#0F4C42" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible alternative to the chart for screen reader users */}
      <table className="sr-only">
        <caption>Daily CO2 equivalent trend</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">kg CO2e</th>
          </tr>
        </thead>
        <tbody>
          {trend.map((t) => (
            <tr key={t.date}>
              <td>{t.date}</td>
              <td>{t.co2eKg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
