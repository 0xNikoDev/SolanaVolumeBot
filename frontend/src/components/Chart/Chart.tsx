import React from 'react';
import type {Timeframe} from '../../types';

interface ChartProps {
    tokenAddress: string;
    timeframe: Timeframe;
    onTimeframeChange: (timeframe: Timeframe) => void;
}

const Chart: React.FC<ChartProps> = ({ tokenAddress, timeframe, onTimeframeChange }) => {
    // Маппинг timeframes на интервалы GMGN
    const timeframeToInterval: Record<Timeframe, string> = {
        '1m': '1',
        '5m': '5',
        '15m': '15',
        '30m': '30',
        '1h': '60',
        '4h': '240',
        '1d': '1440'
    };

    const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

    // Построение URL для GMGN iframe
    const buildChartUrl = () => {
        if (!tokenAddress) {
            return '';
        }

        const interval = timeframeToInterval[timeframe];
        const theme = 'dark'; // Используем темную тему по умолчанию

        return `https://www.gmgn.cc/kline/sol/${tokenAddress}?theme=${theme}&interval=${interval}`;
    };

    const chartUrl = buildChartUrl();

    return (
        <div className="panel chartContainer">
            <div className="chartHeader">
                <h3 className="sectionTitle sectionTitleChart">
                    Price Chart
                </h3>
                <div className="timeframeButtons">
                    {timeframes.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => onTimeframeChange(tf)}
                            className={`timeframeButton ${
                                timeframe === tf ? 'timeframeButtonActive' : 'timeframeButtonInactive'
                            }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chartContent">
                {chartUrl ? (
                    <iframe
                        src={chartUrl}
                        className="chartIframe"
                        title={`${tokenAddress} Price Chart`}
                        allowFullScreen
                    />
                ) : (
                    <div className="chartPlaceholder">
                        <div className="placeholderContent">
                            <div className="placeholderIcon">📈</div>
                            <div className="placeholderText">
                                Enter a token address to view the chart
                            </div>
                            <div className="placeholderSubtext">
                                Charts powered by GMGN.cc
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chart;