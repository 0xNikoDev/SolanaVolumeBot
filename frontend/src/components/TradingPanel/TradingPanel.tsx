import React from 'react';
import type {TradingSettings} from '../../types';

type TradingMode = 'buy' | 'sell';

interface TradingPanelProps {
    settings: TradingSettings;
    onSettingsChange: (settings: Partial<TradingSettings>) => void;
    onToggleTrading: () => void;
    isUpdating?: boolean;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
                                                       settings,
                                                       onSettingsChange,
                                                       onToggleTrading,
                                                       isUpdating = false
                                                   }) => {
    const handleModeChange = (mode: TradingMode) => {
        onSettingsChange({ mode });
    };

    const handleInputChange = (field: keyof TradingSettings, value: string) => {
        onSettingsChange({ [field]: value });
    };

    return (
        <div className="panel tradingPanel">
            <div className="tradingHeader">
                <h3 className="sectionTitle sectionTitleTrading">
                    Round Trading
                </h3>
                {isUpdating && (
                    <div className="updatingIndicator">
                        <div className="loadingSpinner"></div>
                        <span>Updating...</span>
                    </div>
                )}
            </div>

            <div className="tradingModeButtons">
                <button
                    onClick={() => handleModeChange('buy')}
                    className={`tradingModeButton ${
                        settings.mode === 'buy'
                            ? 'tradingModeBuyActive'
                            : 'tradingModeInactive'
                    }`}
                    disabled={settings.active || isUpdating}
                >
                    Buy Mode
                </button>
                <button
                    onClick={() => handleModeChange('sell')}
                    className={`tradingModeButton ${
                        settings.mode === 'sell'
                            ? 'tradingModeSellActive'
                            : 'tradingModeInactive'
                    }`}
                    disabled={settings.active || isUpdating}
                >
                    Sell Mode
                </button>
            </div>

            <div className="tradingSettingsGrid">
                <div className="inputGroup">
                    <label className="inputLabel">Slippage (%):</label>
                    <div className="inputRow">
                        <input
                            type="number"
                            value={settings.slippageFrom}
                            onChange={(e) => handleInputChange('slippageFrom', e.target.value)}
                            className="input"
                            placeholder="From"
                            disabled={settings.active || isUpdating}
                            step="0.1"
                            min="0"
                        />
                        <span className="inputSeparator">to</span>
                        <input
                            type="number"
                            value={settings.slippageTo}
                            onChange={(e) => handleInputChange('slippageTo', e.target.value)}
                            className="input"
                            placeholder="To"
                            disabled={settings.active || isUpdating}
                            step="0.1"
                            min="0"
                        />
                    </div>
                </div>

                <div className="inputGroup">
                    <label className="inputLabel">Amount (SOL):</label>
                    <div className="inputRow">
                        <input
                            type="number"
                            value={settings.amountFrom}
                            onChange={(e) => handleInputChange('amountFrom', e.target.value)}
                            className="input"
                            placeholder="From"
                            disabled={settings.active || isUpdating}
                            step="0.01"
                            min="0"
                        />
                        <span className="inputSeparator">to</span>
                        <input
                            type="number"
                            value={settings.amountTo}
                            onChange={(e) => handleInputChange('amountTo', e.target.value)}
                            className="input"
                            placeholder="To"
                            disabled={settings.active || isUpdating}
                            step="0.01"
                            min="0"
                        />
                    </div>
                </div>

                <div className="inputGroup">
                    <label className="inputLabel">Stop at Vol (SOL):</label>
                    <input
                        type="number"
                        value={settings.stopAtVol}
                        onChange={(e) => handleInputChange('stopAtVol', e.target.value)}
                        className="input"
                        disabled={settings.active || isUpdating}
                        step="1"
                        min="0"
                    />
                </div>
            </div>

            <div className="tradingControls">
                <button
                    onClick={onToggleTrading}
                    className={`button tradingToggleButton ${
                        settings.active
                            ? 'tradingToggleButtonStop'
                            : settings.mode === 'buy'
                                ? 'tradingToggleButtonBuy'
                                : 'tradingToggleButtonSell'
                    }`}
                    disabled={isUpdating}
                >
                    {isUpdating
                        ? 'Please wait...'
                        : settings.active
                            ? 'Stop'
                            : settings.mode === 'buy'
                                ? 'Start Buying'
                                : 'Start Selling'
                    }
                </button>

                <div className={`tradingStatus ${
                    settings.active ? 'tradingStatusActive' : 'tradingStatusInactive'
                }`}>
                    {isUpdating ? 'Updating...' : settings.active ? 'Active' : 'Stopped'}
                </div>
            </div>
        </div>
    );
};

export default TradingPanel;