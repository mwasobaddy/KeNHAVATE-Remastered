import axios from 'axios';
import { useCallback, useState } from 'react';

export const OTP_MAX_LENGTH = 6;

export function useTwoFactorAuth() {
    const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
    const [manualSetupKey, setManualSetupKey] = useState<string>('');
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [hasSetupData, setHasSetupData] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchSetupData = useCallback(async () => {
        try {
            await axios.post('/user/two-factor-authentication');
            const qrCodeUrl = `/user/two-factor-qr-code`;
            const qrResponse = await axios.get(qrCodeUrl);
            setQrCodeSvg(qrResponse.data.svg ?? '');
            const keyResponse = await axios.get('/user/two-factor-secret-key');
            setManualSetupKey(keyResponse.data.secretKey ?? '');
            setHasSetupData(true);
        } catch (error: any) {
            setErrors(error.response?.data?.errors ?? {});
        }
    }, []);

    const clearSetupData = useCallback(() => {
        setQrCodeSvg('');
        setManualSetupKey('');
        setHasSetupData(false);
        setErrors({});
    }, []);

    const clearTwoFactorAuthData = useCallback(() => {
        clearSetupData();
        setRecoveryCodesList([]);
    }, [clearSetupData]);

    const fetchRecoveryCodes = useCallback(async () => {
        try {
            const response = await axios.get('/user/two-factor-recovery-codes');
            setRecoveryCodesList(response.data ?? []);
        } catch (error: any) {
            setErrors(error.response?.data?.errors ?? {});
        }
    }, []);

    return {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    };
}
