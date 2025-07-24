// types/index.ts - Обновленные типы
export interface Wallet {
    id: number;
    address: string;
    sol: number;
    token: number;
    pricePerM: number;
    state: 'IDLE' | 'BUYING' | 'SELLING' | 'ERROR';
    type: 'trading' | 'creation' | 'bundle';
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

export interface TradingSettings {
    mode: 'buy' | 'sell';
    active: boolean;
    slippageFrom: string;
    slippageTo: string;
    amountFrom: string;
    amountTo: string;
    stopAtVol: string;
}

// Унифицированный интерфейс транзакции
export interface Transaction {
    id: string;
    walletId: number;
    walletAddress: string;
    type: 'BUY' | 'SELL';
    sol: number;
    tokens: number;
    price: number;
    timestamp: string;
    txId: string;
    isOurWallet: boolean;
}

// Унифицированный интерфейс холдера
export interface Holder {
    walletAddress: string;
    walletId?: number;
    costSol: number;
    tokensHeld: number;
    avgCost: number;
    unrealizedProfit: number;
    potentialSell: number;
    isOurWallet: boolean;
}

// Deprecated types - for backward compatibility
export type WalletType = Wallet['type'];
export type WalletState = Wallet['state'];
export type TradingMode = TradingSettings['mode'];