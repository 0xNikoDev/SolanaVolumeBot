import React, { useEffect } from 'react';
import './App.css';
import TokenBar from './components/TokenBar/TokenBar';
import WalletList from './components/WalletList/WalletList';
import Chart from './components/Chart/Chart';
import TradingPanel from './components/TradingPanel/TradingPanel';
import TransactionList from './components/TransactionList/TransactionList';
import { useWallets } from './hooks/useWallets';
import { useTrading } from './hooks/useTrading';
import { useTransactions } from './hooks/useTransactions';

const App: React.FC = () => {
    const {
        wallets,
        selectedWallets,
        totalTokens,
        buyAmount,
        sellAmount,
        walletListRef,
        handleWalletSelect,
        handleBuy,
        handleSell,
        handleSellAll,
        addWalletsFromPrivateKeys,
        removeSelectedWallets,
        reorderWallets,
        changeWalletType,
        setBuyAmount,
        setSellAmount
    } = useWallets();

    const {
        tokenAddress,
        timeframe,
        tradingSettings,
        isUpdating,
        updateTokenAddress,
        updateTimeframe,
        updateTradingSettings,
        toggleTrading,
        handleTokenUpdate,
    } = useTrading();

    const {
        transactions,
        holders,
        loading,
        error,
        loadTransactions,
        loadHolders
    } = useTransactions(wallets, tokenAddress);

    // Загрузка данных при изменении токена
    useEffect(() => {
        if (tokenAddress) {
            loadTransactions().catch(console.error);
            loadHolders().catch(console.error);
        }
    }, [tokenAddress, loadTransactions, loadHolders]);

    return (
        <div className="appContainer">
            {/* Token Address Bar */}
            <TokenBar
                tokenAddress={tokenAddress}
                onTokenAddressChange={updateTokenAddress}
                onUpdate={handleTokenUpdate}
                onTokenCreated={updateTokenAddress}
            />

            <div className="mainGrid">
                {/* Left Panel - Wallets */}
                <div className="gridColumn leftColumn">
                    <WalletList
                        wallets={wallets}
                        selectedWallets={selectedWallets}
                        onWalletSelect={handleWalletSelect}
                        onWalletBuy={handleBuy}
                        onWalletSell={handleSell}
                        onAddWallets={addWalletsFromPrivateKeys}
                        onRemoveWallet={removeSelectedWallets}
                        onWalletReorder={reorderWallets}
                        onWalletTypeChange={changeWalletType}
                        buyAmount={buyAmount}
                        sellAmount={sellAmount}
                        onBuyAmountChange={setBuyAmount}
                        onSellAmountChange={setSellAmount}
                        walletListRef={walletListRef}
                    />
                </div>

                {/* Center Panel */}
                <div className="gridColumn centerColumn">
                    {/* Chart */}
                    <Chart
                        tokenAddress={tokenAddress}
                        timeframe={timeframe}
                        onTimeframeChange={updateTimeframe}
                    />

                    {/* Token Info and Sell All */}
                    <div className="tokenInfoContainer">
                        <div className="panel">
                            <div className="sectionTitle sectionTitleToken">
                                Total Tokens: {totalTokens.toLocaleString()}
                            </div>
                        </div>
                        <button
                            onClick={handleSellAll}
                            disabled={totalTokens === 0}
                            className={`button buttonSellAll ${totalTokens === 0 ? 'buttonDisabled' : ''}`}
                        >
                            Sell All Tokens
                        </button>
                    </div>

                    {/* Trading Settings */}
                    <TradingPanel
                        settings={tradingSettings}
                        onSettingsChange={updateTradingSettings}
                        onToggleTrading={toggleTrading}
                        isUpdating={isUpdating}
                    />
                </div>

                {/* Right Panel */}
                <div className="gridColumn rightColumn">
                    <TransactionList
                        transactions={transactions}
                        holders={holders}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;