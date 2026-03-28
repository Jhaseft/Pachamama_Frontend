import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { WithdrawalRequest } from '../../../types/withdrawalRequest';
import { apiUpdateWithdrawalStatus } from '../../../api/paymentRequest';
import WithdrawalDetailStep from './WithdrawalDetailStep';
import WithdrawalRejectStep from './WithdrawalRejectStep';
import WithdrawalApproveStep from './WithdrawalApproveStep';

type Step = 'detail' | 'reject' | 'approve';

const stepTitle: Record<Step, string> = {
    detail:  'Detalle de Solicitud',
    reject:  'Motivo de Rechazo',
    approve: 'Subir Comprobante',
};

interface Props {
    visible: boolean;
    item: WithdrawalRequest | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function WithdrawalDetailModal({ visible, item, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<Step>('detail');
    const [rejectionReason, setRejectionReason] = useState('');
    const [receipt, setReceipt] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [loading, setLoading] = useState(false);

    if (!item) return null;

    const reset = () => { setStep('detail'); setRejectionReason(''); setReceipt(null); };
    const handleClose = () => { reset(); onClose(); };

    const pickReceipt = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setReceipt({ uri: asset.uri, name: asset.fileName ?? `comprobante_${Date.now()}.jpg`, type: asset.mimeType ?? 'image/jpeg' });
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectionReason.trim()) { Alert.alert('Error', 'Debes ingresar un motivo de rechazo'); return; }
        setLoading(true);
        try {
            await apiUpdateWithdrawalStatus(item.id, { status: 'REJECTED', rejectionReason });
            reset(); onSuccess();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally { setLoading(false); }
    };

    const handleApproveConfirm = async () => {
        if (!receipt) { Alert.alert('Error', 'Debes subir el comprobante de pago'); return; }
        setLoading(true);
        try {
            await apiUpdateWithdrawalStatus(item.id, { status: 'APPROVED', receipt });
            reset(); onSuccess();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally { setLoading(false); }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-[#121212] rounded-t-[40px] px-6 pt-4 pb-6 border-t border-zinc-800 h-[85%]">


                    <View className="flex-row justify-between items-center mb-4">
                        <TouchableOpacity onPress={step !== 'detail' ? () => setStep('detail') : () => {}}>
                            <MaterialCommunityIcons
                                name={step !== 'detail' ? 'arrow-left' : 'minus'}
                                size={24}
                                color={step !== 'detail' ? 'white' : 'transparent'}
                            />
                        </TouchableOpacity>
                        <Text className="text-white font-black text-[18px] italic">{stepTitle[step]}</Text>
                        <TouchableOpacity onPress={handleClose} className="bg-zinc-800 p-2 rounded-full">
                            <MaterialCommunityIcons name="close" size={22} color="white" />
                        </TouchableOpacity>
                    </View>

                    {step === 'detail' && (
                        <WithdrawalDetailStep
                            item={item}
                            onReject={() => setStep('reject')}
                            onApprove={() => setStep('approve')}
                        />
                    )}

                    {step === 'reject' && (
                        <WithdrawalRejectStep
                            value={rejectionReason}
                            onChange={setRejectionReason}
                            loading={loading}
                            onConfirm={handleRejectConfirm}
                        />
                    )}

                    {step === 'approve' && (
                        <WithdrawalApproveStep
                            receipt={receipt}
                            loading={loading}
                            onPickReceipt={pickReceipt}
                            onConfirm={handleApproveConfirm}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
