import type {WalletType, WalletState} from '../types';

export const shortenAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const getWalletTypeClass = (type: WalletType): string => {
    switch (type) {
        case 'trading':
            return 'walletTypeTrading';
        case 'creation':
            return 'walletTypeCreation';
        case 'bundle':
            return 'walletTypeBundle';
        default:
            return '';
    }
};

export const getStateClass = (state: WalletState): string => {
    switch (state) {
        case 'IDLE': return 'stateIdle';
        case 'BUYING': return 'stateBuying';
        case 'SELLING': return 'stateSelling';
        case 'ERROR': return 'stateError';
        default: return 'stateIdle';
    }
};

export const formatNumber = (num: number, decimals: number = 4): string => {
    return num.toFixed(decimals);
};

export const formatTokens = (tokens: number): string => {
    return (tokens / 1000000).toFixed(2) + 'M';
};