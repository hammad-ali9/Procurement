import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, AreaChart, Area } from 'recharts';
import './ProductSparkline.css';

export default function ProductSparkline({ data = [] }) {
    // If data is empty or has only one point, we create a small horizontal line
    const chartData = useMemo(() => {
        if (data.length === 0) return [{ price: 0 }, { price: 0 }];
        if (data.length === 1) return [
            { price: data[0].price },
            { price: data[0].price }
        ];
        return data.map(point => ({ price: point.price }));
    }, [data]);

    // Calculate Trend Color
    const isIncreasing = chartData.length > 1 &&
        chartData[chartData.length - 1].price > chartData[0].price;
    const isDecreasing = chartData.length > 1 &&
        chartData[chartData.length - 1].price < chartData[0].price;

    let strokeColor = '#3b82f6'; // Default Blue
    if (isIncreasing) strokeColor = '#10b981'; // Green
    if (isDecreasing) strokeColor = '#ef4444'; // Red

    return (
        <div className="product-sparkline-container">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${strokeColor}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide={true} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#gradient-${strokeColor})`}
                        isAnimationActive={true}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
