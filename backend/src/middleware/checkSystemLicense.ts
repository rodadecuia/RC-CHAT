import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/AppError';
import { getSystemActivationDetails } from '../services/WhmcsServices/rc-api-lic'; // Importar do novo arquivo

// Middleware para verificar o status geral da ativação do sistema
export const checkSystemActivation = async (req: Request, res: Response, next: NextFunction) => { // Renomeado
  const activationDetails = await getSystemActivationDetails(); // Renomeado

  if (activationDetails.status !== 'Active') {
    // Se a ativação não estiver ativa, impede o acesso a funcionalidades críticas
    throw new AppError('System activation is not active. Please contact support.', 403); // Mensagem atualizada
  }
  next();
};

// Middleware para verificar o tipo de plano (Free/Pro)
export const checkPlanType = (requiredPlanType: 'Free' | 'Pro') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const activationDetails = await getSystemActivationDetails(); // Renomeado

    if (activationDetails.status !== 'Active') {
      throw new AppError('System activation is not active. Please contact support.', 403); // Mensagem atualizada
    }

    if (activationDetails.rcchat_plan_type !== requiredPlanType) {
      throw new AppError(`This feature requires a ${requiredPlanType} plan. Your current plan is ${activationDetails.rcchat_plan_type || 'Free'}.`, 403); // Mensagem atualizada
    }
    next();
  };
};
