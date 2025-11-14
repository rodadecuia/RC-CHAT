import axios from 'axios';
import { logger } from '../../utils/logger';
import AppError from '../../errors/AppError';
import Setting from '../../models/Setting'; // Importar o modelo Setting

interface WhmcsActivationResponse {
  status: 'Active' | 'Suspended' | 'Terminated' | 'Expired' | 'Invalid' | 'Not Configured';
  activationid?: string; // Renomeado de licenseid
  regdate?: string;
  nextduedate?: string;
  domain?: string;
  ip?: string;
  dir?: string;
  // Campos personalizados do WHMCS para features
  rcchat_plan_type?: 'Free' | 'Pro'; // Exemplo de campo personalizado
  rcchat_max_users?: number;
  // ... outros campos que você configurar no WHMCS
}

const WHMCS_ACTIVATION_KEY_SETTING = 'whmcsActivationKey'; // Renomeado
const WHMCS_ACTIVATION_VALIDATION_URL_SETTING = 'whmcsActivationValidationUrl'; // Renomeado
const SYSTEM_ACTIVATION_DETAILS_SETTING = 'systemActivationDetails'; // Renomeado

export const validateSystemActivation = async (): Promise<WhmcsActivationResponse | null> => { // Renomeado
  const activationKeySetting = await Setting.findOne({ where: { key: WHMCS_ACTIVATION_KEY_SETTING } }); // Renomeado
  const validationUrlSetting = await Setting.findOne({ where: { key: WHMCS_ACTIVATION_VALIDATION_URL_SETTING } }); // Renomeado

  if (!activationKeySetting || !activationKeySetting.value) {
    logger.warn('[RC-API-LIC] No WHMCS Activation Key configured in system settings.'); // Mensagem atualizada
    // Se não há chave, o sistema opera como Free ou com funcionalidades limitadas
    await updateSystemActivationDetails({ status: 'Not Configured', rcchat_plan_type: 'Free' }); // Renomeado
    return null;
  }

  if (!validationUrlSetting || !validationUrlSetting.value) {
    logger.error('[RC-API-LIC] WHMCS Activation Validation URL not configured in system settings.'); // Mensagem atualizada
    await updateSystemActivationDetails({ status: 'Invalid', rcchat_plan_type: 'Free' }); // Renomeado
    throw new AppError('WHMCS Activation Validation URL not configured.', 500);
  }

  const activationKey = activationKeySetting.value as string; // Renomeado
  const validationUrl = validationUrlSetting.value as string;

  try {
    const params = new URLSearchParams();
    params.append('activationkey', activationKey); // Renomeado
    params.append('domain', process.env.FRONTEND_URL || 'localhost'); // Use o domínio do seu frontend ou um valor padrão
    params.append('ip', process.env.SERVER_IP || '127.0.0.1'); // Use o IP do seu servidor
    params.append('dir', '/'); // Ou o diretório de instalação do RC-CHAT

    const response = await axios.post<WhmcsActivationResponse>(validationUrl, params.toString(), { // Renomeado
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const activationData = response.data; // Renomeado

    if (activationData.status === 'Invalid') {
      logger.warn(`[RC-API-LIC] Invalid system activation key: ${activationKey}`); // Mensagem atualizada
      await updateSystemActivationDetails({ status: 'Invalid', rcchat_plan_type: 'Free' }); // Renomeado
      return activationData;
    }

    // Atualiza os detalhes da ativação globalmente
    await updateSystemActivationDetails(activationData); // Renomeado
    logger.info(`[RC-API-LIC] System activation validated. Status: ${activationData.status}, Plan: ${activationData.rcchat_plan_type || 'N/A'}`); // Mensagem atualizada
    return activationData;

  } catch (error) {
    logger.error({ error }, `[RC-API-LIC] Error validating system activation: ${activationKey}`); // Mensagem atualizada
    await updateSystemActivationDetails({ status: 'Invalid', rcchat_plan_type: 'Free' }); // Em caso de erro, assume Free // Renomeado
    throw new AppError('Failed to validate WHMCS System Activation. Please check configuration and try again later.', 500); // Mensagem atualizada
  }
};

// Função auxiliar para atualizar os detalhes da ativação no Setting
export const updateSystemActivationDetails = async (details: Partial<WhmcsActivationResponse>) => { // Renomeado
  let setting = await Setting.findOne({ where: { key: SYSTEM_ACTIVATION_DETAILS_SETTING } }); // Renomeado
  if (!setting) {
    setting = await Setting.create({ key: SYSTEM_ACTIVATION_DETAILS_SETTING, value: JSON.stringify(details) }); // Renomeado
  } else {
    setting.value = JSON.stringify(details);
    await setting.save();
  }
};

// Função para obter os detalhes da ativação atual
export const getSystemActivationDetails = async (): Promise<WhmcsActivationResponse> => { // Renomeado
  const setting = await Setting.findOne({ where: { key: SYSTEM_ACTIVATION_DETAILS_SETTING } }); // Renomeado
  if (setting && setting.value) {
    return JSON.parse(setting.value as string);
  }
  // Retorna um status padrão se não houver detalhes de ativação configurados
  return { status: 'Not Configured', rcchat_plan_type: 'Free' };
};
