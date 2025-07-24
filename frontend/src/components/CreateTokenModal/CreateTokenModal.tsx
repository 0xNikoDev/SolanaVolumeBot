import React, { useState } from 'react';
import { apiService, handleApiError, type CreateTokenRequest } from '../../services/apiService';

interface CreateTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTokenCreated: (tokenAddress: string) => void;
}

const CreateTokenModal: React.FC<CreateTokenModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onTokenCreated
                                                           }) => {
    const [formData, setFormData] = useState<CreateTokenRequest>({
        name: '',
        symbol: '',
        description: '',
        image: '',
        twitter: '',
        telegram: '',
        website: '',
        initialBuyAmount: 0.1,
        autoBundleBuy: false
    });

    const [isCreating, setIsCreating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.symbol.trim()) {
            newErrors.symbol = 'Symbol is required';
        } else if (formData.symbol.length > 10) {
            newErrors.symbol = 'Symbol must be 10 characters or less';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.image.trim()) {
            newErrors.image = 'Image URL is required';
        } else if (!isValidUrl(formData.image)) {
            newErrors.image = 'Please enter a valid image URL';
        }

        if (formData.twitter && !isValidUrl(formData.twitter)) {
            newErrors.twitter = 'Please enter a valid Twitter URL';
        }

        if (formData.telegram && !isValidUrl(formData.telegram)) {
            newErrors.telegram = 'Please enter a valid Telegram URL';
        }

        if (formData.website && !isValidUrl(formData.website)) {
            newErrors.website = 'Please enter a valid website URL';
        }

        if (formData.initialBuyAmount <= 0) {
            newErrors.initialBuyAmount = 'Initial buy amount must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleInputChange = (field: keyof CreateTokenRequest, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Очищаем ошибку для этого поля
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsCreating(true);

        try {
            const response = await apiService.createToken(formData);

            if (response.success && response.tokenAddress) {
                onTokenCreated(response.tokenAddress);
                handleClose();
            } else {
                alert(response.error || 'Failed to create token');
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            alert(`Error creating token: ${errorMessage}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (!isCreating) {
            setFormData({
                name: '',
                symbol: '',
                description: '',
                image: '',
                twitter: '',
                telegram: '',
                website: '',
                initialBuyAmount: 0.1,
                autoBundleBuy: false
            });
            setErrors({});
            onClose();
        }
    };

    return (
        <div className="modalOverlay" onClick={handleClose}>
            <div className="modalContent createTokenModal" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h3 className="modalTitle">Create New Token</h3>
                    <button
                        className="modalCloseButton"
                        onClick={handleClose}
                        disabled={isCreating}
                    >
                        ×
                    </button>
                </div>

                <div className="modalBody createTokenBody">
                    <div className="formGrid">
                        {/* Основная информация */}
                        <div className="formSection">
                            <h4 className="formSectionTitle">Token Information</h4>

                            <div className="inputGroup">
                                <label className="inputLabel">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`input ${errors.name ? 'inputError' : ''}`}
                                    placeholder="My Awesome Token"
                                    disabled={isCreating}
                                />
                                {errors.name && <span className="errorText">{errors.name}</span>}
                            </div>

                            <div className="inputGroup">
                                <label className="inputLabel">Symbol *</label>
                                <input
                                    type="text"
                                    value={formData.symbol}
                                    onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                                    className={`input ${errors.symbol ? 'inputError' : ''}`}
                                    placeholder="MAT"
                                    maxLength={10}
                                    disabled={isCreating}
                                />
                                {errors.symbol && <span className="errorText">{errors.symbol}</span>}
                            </div>

                            <div className="inputGroup">
                                <label className="inputLabel">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className={`textareaInput ${errors.description ? 'inputError' : ''}`}
                                    placeholder="Describe your token..."
                                    rows={3}
                                    disabled={isCreating}
                                />
                                {errors.description && <span className="errorText">{errors.description}</span>}
                            </div>

                            <div className="inputGroup">
                                <label className="inputLabel">Image URL *</label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => handleInputChange('image', e.target.value)}
                                    className={`input ${errors.image ? 'inputError' : ''}`}
                                    placeholder="https://example.com/image.jpg"
                                    disabled={isCreating}
                                />
                                {errors.image && <span className="errorText">{errors.image}</span>}
                            </div>
                        </div>

                        {/* Социальные ссылки */}
                        <div className="formSection">
                            <h4 className="formSectionTitle">Social Links</h4>

                            <div className="inputGroup">
                                <label className="inputLabel">Twitter (X)</label>
                                <input
                                    type="url"
                                    value={formData.twitter}
                                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                                    className={`input ${errors.twitter ? 'inputError' : ''}`}
                                    placeholder="https://twitter.com/yourtoken"
                                    disabled={isCreating}
                                />
                                {errors.twitter && <span className="errorText">{errors.twitter}</span>}
                            </div>

                            <div className="inputGroup">
                                <label className="inputLabel">Telegram</label>
                                <input
                                    type="url"
                                    value={formData.telegram}
                                    onChange={(e) => handleInputChange('telegram', e.target.value)}
                                    className={`input ${errors.telegram ? 'inputError' : ''}`}
                                    placeholder="https://t.me/yourtoken"
                                    disabled={isCreating}
                                />
                                {errors.telegram && <span className="errorText">{errors.telegram}</span>}
                            </div>

                            <div className="inputGroup">
                                <label className="inputLabel">Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className={`input ${errors.website ? 'inputError' : ''}`}
                                    placeholder="https://yourtoken.com"
                                    disabled={isCreating}
                                />
                                {errors.website && <span className="errorText">{errors.website}</span>}
                            </div>
                        </div>

                        {/* Настройки торговли */}
                        <div className="formSection">
                            <h4 className="formSectionTitle">Trading Settings</h4>

                            <div className="inputGroup">
                                <label className="inputLabel">Initial Buy Amount (SOL) *</label>
                                <input
                                    type="number"
                                    value={formData.initialBuyAmount}
                                    onChange={(e) => handleInputChange('initialBuyAmount', Number(e.target.value))}
                                    className={`input ${errors.initialBuyAmount ? 'inputError' : ''}`}
                                    placeholder="0.1"
                                    step="0.01"
                                    min="0"
                                    disabled={isCreating}
                                />
                                {errors.initialBuyAmount && <span className="errorText">{errors.initialBuyAmount}</span>}
                            </div>

                            <div className="checkboxGroup">
                                <input
                                    type="checkbox"
                                    id="autoBundleBuy"
                                    checked={formData.autoBundleBuy}
                                    onChange={(e) => handleInputChange('autoBundleBuy', e.target.checked)}
                                    className="checkbox"
                                    disabled={isCreating}
                                />
                                <label htmlFor="autoBundleBuy" className="checkboxLabel">
                                    Auto Bundle Buy
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modalFooter">
                    <button
                        onClick={handleClose}
                        className="button buttonCancel"
                        disabled={isCreating}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="button buttonCreateToken"
                        disabled={isCreating || !formData.name || !formData.symbol || !formData.description || !formData.image}
                    >
                        {isCreating ? 'Creating...' : 'Create Token'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTokenModal;