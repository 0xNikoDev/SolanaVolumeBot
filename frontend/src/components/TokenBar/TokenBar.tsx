import React, { useState } from 'react';
import CreateTokenModal from '../CreateTokenModal/CreateTokenModal';

interface TokenBarProps {
    tokenAddress: string;
    onTokenAddressChange: (address: string) => void;
    onUpdate: () => void;
    onTokenCreated: (address: string) => void;
}

const TokenBar: React.FC<TokenBarProps> = ({
                                               tokenAddress,
                                               onTokenAddressChange,
                                               onUpdate,
                                               onTokenCreated
                                           }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleTokenCreated = (newTokenAddress: string) => {
        onTokenCreated(newTokenAddress);
        setIsCreateModalOpen(false);
    };

    return (
        <>
            <div className="tokenAddressBar">
                <div className="tokenAddressContent">
                    <input
                        type="text"
                        value={tokenAddress}
                        onChange={(e) => onTokenAddressChange(e.target.value)}
                        className="tokenAddressInput"
                        placeholder="Enter token address..."
                    />
                    <div className="tokenBarActions">
                        <button
                            onClick={onUpdate}
                            className="button updateButton"
                        >
                            Update
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="button createButton"
                        >
                            Create Token
                        </button>
                    </div>
                </div>
            </div>

            <CreateTokenModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTokenCreated={handleTokenCreated}
            />
        </>
    );
};

export default TokenBar;